import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Progress from "@/models/Progress";
import {
  calculateLevel,
  expToNextLevel,
  updateStreak,
  checkBadges,
  EXP_REWARDS,
  BADGES,
  ActionType,
} from "@/lib/gamification";

/**
 * GET — Returns the user's full gamification profile.
 */
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

    const gamification = user.gamification || {
      exp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      badges: [],
      flashcardsToday: 0,
      flashcardsTodayDate: null,
    };

    const level = calculateLevel(gamification.exp);
    const expProgress = expToNextLevel(gamification.exp);

    // Map badge IDs to full badge info
    const earnedBadges = BADGES.filter((b) =>
      gamification.badges.includes(b.id)
    );
    const lockedBadges = BADGES.filter(
      (b) => !gamification.badges.includes(b.id)
    );

    return NextResponse.json({
      exp: gamification.exp,
      level,
      expToNext: expProgress,
      currentStreak: gamification.currentStreak,
      longestStreak: gamification.longestStreak,
      flashcardsToday: gamification.flashcardsToday,
      earnedBadges,
      lockedBadges,
      allBadges: BADGES,
    });
  } catch (error: any) {
    console.error("Gamification GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST — Awards EXP for a specific action.
 * Body: { action: "flashcard" | "dokkai" | "grammar" | "daily_login" }
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (!action || !Object.keys(EXP_REWARDS).includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${Object.keys(EXP_REWARDS).join(", ")}` },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    const expGained = EXP_REWARDS[action as ActionType];

    // Update streak
    const streakResult = updateStreak(
      user.gamification.lastActiveDate,
      user.gamification.currentStreak,
      user.gamification.longestStreak
    );

    let totalExpGained = expGained;

    // Award daily login bonus on first activity of the day
    if (streakResult.isNewDay && action !== "daily_login") {
      totalExpGained += EXP_REWARDS.daily_login;
    }

    user.gamification.currentStreak = streakResult.currentStreak;
    user.gamification.longestStreak = streakResult.longestStreak;
    user.gamification.lastActiveDate = new Date().toISOString().split("T")[0];

    const oldLevel = calculateLevel(user.gamification.exp);
    user.gamification.exp += totalExpGained;
    const newLevel = calculateLevel(user.gamification.exp);
    user.gamification.level = newLevel;

    // Check for new badges
    const totalVocabLearned = await Progress.countDocuments({
      userId: user._id,
      status: "learned",
    });

    const dokkaiCount = (user.learningHistory || []).filter(
      (h: any) => h.activityType === "dokkai"
    ).length;

    const hasPerfectQuiz = (user.progress?.quizScores || []).some(
      (q: any) => q.score === q.total && q.total > 0
    );

    const newBadges = checkBadges(user.gamification, {
      totalVocabLearned,
      totalDokkaiCompleted: dokkaiCount,
      hasPerfectQuiz,
    });

    if (newBadges.length > 0) {
      user.gamification.badges.push(...newBadges);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      expGained: totalExpGained,
      totalExp: user.gamification.exp,
      level: newLevel,
      leveledUp: newLevel > oldLevel,
      newBadges: BADGES.filter((b) => newBadges.includes(b.id)),
      currentStreak: user.gamification.currentStreak,
      longestStreak: user.gamification.longestStreak,
    });
  } catch (error: any) {
    console.error("Gamification POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
