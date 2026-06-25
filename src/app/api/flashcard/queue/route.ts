import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import SrsCard from "@/models/SrsCard";
import Vocabulary from "@/models/Vocabulary";
import User from "@/models/User";

const BATCH_SIZE = 20;

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id;
    const targetLevel = user.targetLevel || "N2";

    // 1. Fetch due cards (nextReviewDate ≤ now)
    const now = new Date();
    const dueCards = await SrsCard.find({
      userId,
      nextReviewDate: { $lte: now },
    })
      .sort({ nextReviewDate: 1 }) // Most overdue first
      .limit(BATCH_SIZE)
      .populate({
        path: "vocabId",
        select: "word reading meaning part_of_speech level exampleSentence exampleMeaning",
      })
      .lean();

    // Filter out cards where vocabulary was deleted
    const validDueCards = dueCards.filter((card) => card.vocabId !== null);

    // 2. Count total due
    const totalDue = await SrsCard.countDocuments({
      userId,
      nextReviewDate: { $lte: now },
    });

    // 3. If we have fewer than BATCH_SIZE due cards, backfill with NEW unseen words
    const remainingSlots = BATCH_SIZE - validDueCards.length;
    let newCards: any[] = [];
    let totalNew = 0;

    if (remainingSlots > 0) {
      // Find vocab IDs that already have SRS cards for this user
      const existingVocabIds = await SrsCard.find({ userId })
        .select("vocabId")
        .lean();
      const seenIds = existingVocabIds.map((c) => c.vocabId);

      // Fetch unseen vocabulary matching user's target level
      newCards = await Vocabulary.find({
        _id: { $nin: seenIds },
        $or: [{ level: targetLevel }, { jlptLevel: targetLevel }],
      })
        .limit(remainingSlots)
        .select("word reading meaning part_of_speech level exampleSentence exampleMeaning")
        .lean();

      // Count total unseen
      totalNew = await Vocabulary.countDocuments({
        _id: { $nin: seenIds },
        $or: [{ level: targetLevel }, { jlptLevel: targetLevel }],
      });
    }

    // 4. Format response
    const formattedDueCards = validDueCards.map((card) => {
      const vocab = card.vocabId as any;
      return {
        _id: vocab._id.toString(),
        word: vocab.word || "",
        reading: vocab.reading || "",
        meaning: vocab.meaning || "",
        part_of_speech: vocab.part_of_speech || [],
        level: vocab.level || targetLevel,
        exampleSentence: vocab.exampleSentence || "",
        exampleMeaning: vocab.exampleMeaning || "",
        // SRS metadata for UI hints
        srs: {
          easeFactor: card.easeFactor,
          interval: card.interval,
          repetitions: card.repetitions,
          isReview: true,
        },
      };
    });

    const formattedNewCards = newCards.map((vocab) => ({
      _id: vocab._id.toString(),
      word: vocab.word || "",
      reading: vocab.reading || "",
      meaning: vocab.meaning || "",
      part_of_speech: vocab.part_of_speech || [],
      level: vocab.level || targetLevel,
      exampleSentence: vocab.exampleSentence || "",
      exampleMeaning: vocab.exampleMeaning || "",
      srs: {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        isReview: false,
      },
    }));

    return NextResponse.json({
      dueCards: formattedDueCards,
      newCards: formattedNewCards,
      totalDue,
      totalNew,
    });
  } catch (error: any) {
    console.error("Flashcard queue error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch flashcard queue" },
      { status: 500 }
    );
  }
}
