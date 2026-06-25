import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";
import Grammar from "@/models/Grammar";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // 1. Verify User Session Authentication
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, level, count } = await request.json();

    // 2. Validate Inputs
    if (!type || !level || count === undefined) {
      return NextResponse.json(
        { error: "Missing required parameters (type, level, count)" },
        { status: 400 }
      );
    }

    if (!["vocab", "grammar"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'vocab' or 'grammar'" },
        { status: 400 }
      );
    }

    const validLevels = ["N1", "N2", "N3", "N4", "N5"];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid level. Must be N1, N2, N3, N4, or N5" },
        { status: 400 }
      );
    }

    // Clamp count to safety range [1, 15] to prevent API timeouts or rate limits
    const cleanCount = Math.max(1, Math.min(15, Number(count)));

    // 3. Verify Gemini API Key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured in .env.local" },
        { status: 500 }
      );
    }

    // 4. Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    // Use gemini-1.5-flash for high-performance and speed
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let prompt = "";
    let systemInstruction = "";

    if (type === "vocab") {
      systemInstruction = `You are a professional Japanese language educator specialized in the JLPT exam.
Create vocabulary words for level ${level}. Each item must include:
- word: The word in Kanji if applicable (or Hiragana/Katakana if it has no kanji).
- reading: The Hiragana or Katakana pronunciation.
- meaning: The Vietnamese translation.
- part_of_speech: Array of strings representing word classes in English (e.g. ["noun"], ["verb"], ["adjective"], etc.).
- level: Must be "${level}".
- exampleSentence: A Japanese sentence using this word.
- exampleMeaning: The Vietnamese translation of the example sentence.
- tags: Array of tags (e.g. ["daily", "business", "verbs", etc.]).`;

      prompt = `Generate exactly ${cleanCount} distinct and useful Japanese vocabulary items for the JLPT ${level} level.
Return a raw JSON array matching this schema:
[
  {
    "word": "string",
    "reading": "string",
    "meaning": "string",
    "part_of_speech": ["string"],
    "level": "${level}",
    "exampleSentence": "string",
    "exampleMeaning": "string",
    "tags": ["string"]
  }
]`;
    } else {
      systemInstruction = `You are a professional Japanese grammar instructor specialized in the JLPT exam.
Create grammar points for level ${level}. Each item must include:
- structure: The Japanese grammar point structure (e.g. "~わけがない", "~にあたって").
- meaning: The Vietnamese translation and usage definition.
- formation: The explanation of how words connect to this grammar structure (e.g. "V-dictionary + わけがない", "N + にあたって").
- level: Must be "${level}".
- examples: Array of exactly 2 example objects. Each example object must contain:
  - japanese: The Japanese sentence.
  - romaji: The romaji pronunciation.
  - vietnamese: The Vietnamese translation.`;

      prompt = `Generate exactly ${cleanCount} distinct and important Japanese grammar items for the JLPT ${level} level.
Return a raw JSON array matching this schema:
[
  {
    "structure": "string",
    "meaning": "string",
    "formation": "string",
    "level": "${level}",
    "examples": [
      {
        "japanese": "string",
        "romaji": "string",
        "vietnamese": "string"
      }
    ]
  }
]`;
    }

    // Call Gemini API with Exponential Backoff retry mechanism (max 3 retries)
    let response;
    let rawText = "";
    const maxRetries = 3;
    let currentDelay = 2000; // starting delay: 2 seconds

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        response = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
        rawText = response.response.text();
        if (rawText) {
          break; // successfully retrieved response
        }
      } catch (err: any) {
        const isRateLimitOrUnavailable = 
          err.status === 503 || 
          err.status === 429 || 
          err.message?.includes("503") || 
          err.message?.includes("429") || 
          err.message?.includes("overloaded") || 
          err.message?.includes("High Demand");

        if (isRateLimitOrUnavailable && attempt <= maxRetries) {
          console.warn(`[Gemini API] Attempt ${attempt} failed with code 503/429. Retrying in ${currentDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, currentDelay));
          currentDelay *= 2; // exponential backoff: 2000ms -> 4000ms -> 8000ms
          continue;
        }
        throw err; // throw unretryable error or final failure
      }
    }

    if (!rawText) {
      return NextResponse.json({ error: "Gemini API returned empty text response" }, { status: 503 });
    }

    // 5. Parse and Validate Output
    let items = [];
    try {
      items = JSON.parse(rawText.trim());
    } catch (parseError: any) {
      console.error("JSON parsing error:", rawText, parseError);
      return NextResponse.json(
        { error: "AI response was not valid JSON: " + parseError.message, rawText },
        { status: 500 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "AI response did not return a JSON array", rawText },
        { status: 500 }
      );
    }

    // Force values inside each item to match requested parameters (security constraint)
    items.forEach((item: any) => {
      item.level = level; // Ensure correct level
    });

    // 6. Save directly to database
    let result;
    if (type === "vocab") {
      result = await Vocabulary.insertMany(items);
    } else {
      result = await Grammar.insertMany(items);
    }

    return NextResponse.json({
      success: true,
      count: result.length,
      items: result,
    });
  } catch (error: any) {
    console.error("Content generation error:", error);
    // Detect 503 or 429 error statuses from Gemini
    const status = error.status || (error.message && error.message.match(/(503|429)/) ? Number(error.message.match(/(503|429)/)[0]) : 500);
    return NextResponse.json(
      { error: error.message || "Failed to generate content" },
      { status: status === 503 || status === 429 ? status : 500 }
    );
  }
}
