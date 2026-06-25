import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Explanation from "@/models/Explanation";

/**
 * Generate a deterministic SHA-256 hash from the question text.
 * This allows cache lookups even when callers don't send a questionId.
 */
function generateQuestionId(questionText: string): string {
  return crypto.createHash("sha256").update(questionText.trim()).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { questionId: providedId, question, userAnswer, correctAnswer } = await req.json();

    if (!question || !userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Determine questionId: use provided one, or generate from question text
    const questionId = providedId || generateQuestionId(question);

    // ─── Step 1: Check MongoDB Cache ─────────────────────────────
    await dbConnect();

    const cached = await Explanation.findOne({ questionId }).lean();
    if (cached) {
      console.log(`✅ Cache Hit - Returning explanation from MongoDB (questionId: ${questionId.slice(0, 12)}...)`);
      return NextResponse.json(cached.explanationData);
    }

    console.log(`⏳ Cache Miss - Fetching explanation for questionId: ${questionId.slice(0, 12)}...`);

    // ─── Step 2: Try Gemini API ──────────────────────────────────
    const systemPrompt = `You are an expert Japanese language tutor specialized in JLPT N2 grammar.
Explain this grammar question to a Vietnamese student who selected the wrong option.
Be concise but extremely helpful, clear, and professional.

Your explanation MUST be returned in Vietnamese as a JSON object with exactly three keys:
{
  "whyCorrect": "Explain why the correct answer is the right choice for this context.",
  "whyWrong": "Explain why the student's selected wrong answer does not work or is grammatically incorrect.",
  "nuance": "Detail the grammatical nuance, usage rules, structure (e.g. V-dictionary + ...), and standard context for this N2 grammar point."
}
Return ONLY the raw JSON object. Do not include markdown code block syntax (like \`\`\`json) or any extra text before or after the JSON.`;

    const userPrompt = `Question: "${question}"
User answered: "${userAnswer}"
Correct answer: "${correctAnswer}"`;

    let explanationData: { whyCorrect: string; whyWrong: string; nuance: string } | null = null;

    if (process.env.GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            explanationData = JSON.parse(text.trim());
          } catch (e) {
            console.error("Failed to parse Gemini response as JSON:", text, e);
          }
        }
      } else {
        const errText = await response.text();
        console.error("Gemini API error:", errText);
      }
    }

    // ─── Step 3: Fallback to simulated response ──────────────────
    if (!explanationData) {
      explanationData = {
        whyCorrect: `Đáp án đúng là "${correctAnswer}". Trong ngữ cảnh câu hỏi này, cấu trúc ngữ pháp đòi hỏi sự liên kết về mặt ý nghĩa biểu thị hành động diễn ra tự nhiên, hoặc đi sau một điều kiện giả định phù hợp với sắc thái trang trọng của JLPT N2.`,
        whyWrong: `Lựa chọn của bạn là "${userAnswer}" chưa chính xác vì cấu trúc này không tương thích với trợ từ đứng trước hoặc biểu thị sai mối quan hệ nguyên nhân - kết quả của câu hỏi N2 này.`,
        nuance: `Điểm ngữ pháp liên quan thường đi kèm với danh từ hoặc động từ thể liên kết, được dùng để nhấn mạnh nhận định, thái độ khách quan của người nói. Ví dụ: "V-る + にあたって" (Nhân dịp / Vào lúc).`,
      };

      // Tailored simulated responses for specific N2 grammar points
      if (question.includes("にあたって")) {
        explanationData.whyCorrect = `Mẫu "~にあたって" (Nhân dịp, vào thời điểm trọng đại) diễn tả hành động chuẩn bị trước một sự kiện quan trọng (như khai mạc, thành lập).`;
        explanationData.whyWrong = `Lựa chọn "${userAnswer}" biểu thị ý nghĩa thông thường hơn, không diễn tả đúng sắc thái trang trọng của một dịp lễ lớn.`;
        explanationData.nuance = `Cấu trúc: N + にあたって / V-る + にあたって. Thường đi với các động từ mang tính hành vi có ý chí trang trọng.`;
      } else if (question.includes("ものなら")) {
        explanationData.whyCorrect = `Mẫu "~ものなら" (Nếu có thể...) đi với động từ khả năng thể hiện một ước muốn khó thực hiện, giả định một việc gần như không thể.`;
        explanationData.whyWrong = `Lựa chọn "${userAnswer}" dùng cho các giả định thông thường hàng ngày (như ~たら hoặc ~ば) chứ không mang hàm ý thách thức hay tiếc nuối.`;
        explanationData.nuance = `Cấu trúc: V-khả năng + ものなら. Ví dụ: "帰れるものなら、今すぐ国へ帰りたい" (Nếu có thể về, tôi muốn về nước ngay bây giờ).`;
      }
    }

    // ─── Step 4: Save to MongoDB Cache ───────────────────────────
    try {
      await Explanation.create({
        questionId,
        questionText: question,
        correctAnswer,
        explanationData,
      });
      console.log(`💾 Saved explanation to MongoDB cache (questionId: ${questionId.slice(0, 12)}...)`);
    } catch (saveError: any) {
      // Duplicate key means another concurrent request beat us — that's fine
      if (saveError.code !== 11000) {
        console.error("Failed to save explanation to cache:", saveError);
      }
    }

    return NextResponse.json(explanationData);
  } catch (error: any) {
    console.error("Error in AI explanation route:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
