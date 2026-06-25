import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import SrsCard from "@/models/SrsCard";
import User from "@/models/User";
import { sm2 } from "@/lib/srs";
import {
  EXP_REWARDS,
  calculateLevel,
  updateStreak,
  checkBadges,
} from "@/lib/gamification";
import Progress from "@/models/Progress";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vocabId, quality } = await request.json();

    if (!vocabId || quality === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (vocabId, quality)" },
        { status: 400 }
      );
    }

    // Validate quality is one of the allowed values
    if (![0, 2, 3, 5].includes(quality)) {
      return NextResponse.json(
        { error: "Invalid quality. Must be 0 (Again), 2 (Hard), 3 (Good), or 5 (Easy)" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id;

    // 1. Find or create SRS card
    let srsCard = await SrsCard.findOne({ userId, vocabId });

    if (!srsCard) {
      srsCard = new SrsCard({
        userId,
        vocabId,
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
        quality: 0,
      });
    }

    // 2. Run SM-2 algorithm
    const result = sm2(
      quality,
      srsCard.repetitions,
      srsCard.easeFactor,
      srsCard.interval
    );

    // 3. Update SRS card
    srsCard.easeFactor = result.easeFactor;
    srsCard.interval = result.interval;
    srsCard.repetitions = result.repetitions;
    srsCard.nextReviewDate = result.nextReviewDate;
    srsCard.lastReviewDate = new Date();
    srsCard.quality = quality;

    await srsCard.save();

    // 4. Award EXP for successful recall (quality ≥ 3)
    let expGained = 0;
    let newBadges: string[] = [];
    let leveledUp = false;

    // Initialize gamification if needed
    if (!user.gamification) {
      user.gamification = {
        exp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        badges: [],
        flashcardsToday: 0,
        flashcardsTodayDate: null,
      };
    }

    // Reset daily counter if it's a new day
    const todayStr = new Date().toISOString().split("T")[0];
    if (user.gamification.flashcardsTodayDate !== todayStr) {
      user.gamification.flashcardsToday = 0;
      user.gamification.flashcardsTodayDate = todayStr;
    }

    // Increment daily flashcard counter
    user.gamification.flashcardsToday += 1;

    if (quality >= 3) {
      expGained = EXP_REWARDS.flashcard;

      // Update streak
      const streakResult = updateStreak(
        user.gamification.lastActiveDate,
        user.gamification.currentStreak,
        user.gamification.longestStreak
      );

      // Award daily login bonus on first activity of the day
      if (streakResult.isNewDay) {
        expGained += EXP_REWARDS.daily_login;
      }

      user.gamification.currentStreak = streakResult.currentStreak;
      user.gamification.longestStreak = streakResult.longestStreak;
      user.gamification.lastActiveDate = todayStr;

      const oldLevel = calculateLevel(user.gamification.exp);
      user.gamification.exp += expGained;
      const newLevel = calculateLevel(user.gamification.exp);
      user.gamification.level = newLevel;
      leveledUp = newLevel > oldLevel;

      // Check for new badges
      const totalVocabLearned = await Progress.countDocuments({
        userId,
        status: "learned",
      });

      const dokkaiCount = (user.learningHistory || []).filter(
        (h: any) => h.activityType === "dokkai"
      ).length;

      const hasPerfectQuiz = (user.progress?.quizScores || []).some(
        (q: any) => q.score === q.total && q.total > 0
      );

      newBadges = checkBadges(user.gamification, {
        totalVocabLearned,
        totalDokkaiCompleted: dokkaiCount,
        hasPerfectQuiz,
      });

      if (newBadges.length > 0) {
        user.gamification.badges.push(...newBadges);
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      srs: {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        nextReviewDate: result.nextReviewDate,
      },
      gamification: {
        expGained,
        totalExp: user.gamification.exp,
        level: user.gamification.level,
        leveledUp,
        newBadges,
        currentStreak: user.gamification.currentStreak,
        flashcardsToday: user.gamification.flashcardsToday,
      },
    });
  } catch (error: any) {
    console.error("Flashcard review error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process review" },
      { status: 500 }
    );
  }
}
