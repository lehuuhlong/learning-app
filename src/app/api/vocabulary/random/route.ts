import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Vocabulary from "@/models/Vocabulary";

export async function GET() {
  try {
    await dbConnect();
    
    // Aggregate to fetch one random vocabulary entry where level is N2 (supporting level / jlptLevel)
    const randomWords = await Vocabulary.aggregate([
      { $match: { $or: [{ level: "N2" }, { jlptLevel: "N2" }] } },
      { $sample: { size: 1 } }
    ]);

    if (!randomWords || randomWords.length === 0) {
      return NextResponse.json({ error: "No vocabulary found" }, { status: 404 });
    }

    const word = randomWords[0];
    
    // Map fields dynamically to be compatible with all possible schemas
    const wordVal = word.word || word.kanji || "";
    const readingVal = word.reading || word.hiragana || "";
    const meaningVal = word.meaning || "";
    const levelVal = word.level || word.jlptLevel || "N2";
    const partOfSpeechVal = word.part_of_speech || [];
    
    return NextResponse.json({
      _id: word._id.toString(),
      word: wordVal,
      kanji: wordVal,
      reading: readingVal,
      hiragana: readingVal,
      meaning: meaningVal,
      level: levelVal,
      jlptLevel: levelVal,
      part_of_speech: partOfSpeechVal,
      exampleSentence: word.exampleSentence || "",
      exampleMeaning: word.exampleMeaning || "",
      tags: word.tags || []
    });
  } catch (error: any) {
    console.error("Failed to fetch random vocabulary card:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch random card" }, { status: 500 });
  }
}
