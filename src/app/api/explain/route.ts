import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, userAnswer, correctAnswer } = await req.json();

    if (!question || !userAnswer || !correctAnswer) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

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

    // 1. Check for Gemini API key
    if (process.env.GEMINI_API_KEY) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
            const parsed = JSON.parse(text.trim());
            return NextResponse.json(parsed);
          } catch (e) {
            console.error("Failed to parse Gemini response as JSON:", text, e);
          }
        }
      } else {
        const errText = await response.text();
        console.error("Gemini API error:", errText);
      }
    }

    const simulatedResponse = {
      whyCorrect: `Đáp án đúng là "${correctAnswer}". Trong ngữ cảnh câu hỏi này, cấu trúc ngữ pháp đòi hỏi sự liên kết về mặt ý nghĩa biểu thị hành động diễn ra tự nhiên, hoặc đi sau một điều kiện giả định phù hợp với sắc thái trang trọng của JLPT N2.`,
      whyWrong: `Lựa chọn của bạn là "${userAnswer}" chưa chính xác vì cấu trúc này không tương thích với trợ từ đứng trước hoặc biểu thị sai mối quan hệ nguyên nhân - kết quả của câu hỏi N2 này.`,
      nuance: `Điểm ngữ pháp liên quan thường đi kèm với danh từ hoặc động từ thể liên kết, được dùng để nhấn mạnh nhận định, thái độ khách quan của người nói. Ví dụ: "V-る + にあたって" (Nhân dịp / Vào lúc).`
    };

    // Make the simulated explanation more tailored if we can match specific N2 questions
    if (question.includes("にあたって")) {
      simulatedResponse.whyCorrect = `Mẫu "~にあたって" (Nhân dịp, vào thời điểm trọng đại) diễn tả hành động chuẩn bị trước một sự kiện quan trọng (như khai mạc, thành lập).`;
      simulatedResponse.whyWrong = `Lựa chọn "${userAnswer}" biểu thị ý nghĩa thông thường hơn, không diễn tả đúng sắc thái trang trọng của một dịp lễ lớn.`;
      simulatedResponse.nuance = `Cấu trúc: N + にあたって / V-る + にあたって. Thường đi với các động từ mang tính hành vi có ý chí trang trọng.`;
    } else if (question.includes("ものなら")) {
      simulatedResponse.whyCorrect = `Mẫu "~ものなら" (Nếu có thể...) đi với động từ khả năng thể hiện một ước muốn khó thực hiện, giả định một việc gần như không thể.`;
      simulatedResponse.whyWrong = `Lựa chọn "${userAnswer}" dùng cho các giả định thông thường hàng ngày (như ~たら hoặc ~ば) chứ không mang hàm ý thách thức hay tiếc nuối.`;
      simulatedResponse.nuance = `Cấu trúc: V-khả năng + ものなら. Ví dụ: "帰れるものなら、今すぐ国へ帰りたい" (Nếu có thể về, tôi muốn về nước ngay bây giờ).`;
    }

    return NextResponse.json(simulatedResponse);
  } catch (error: any) {
    console.error("Error in AI explanation route:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
