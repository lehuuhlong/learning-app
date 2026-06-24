import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { activityType, score, total, timeSpent } = await request.json();

    if (!activityType || score === undefined || timeSpent === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (activityType, score, timeSpent)" },
        { status: 400 }
      );
    }

    if (!["vocabulary", "grammar", "dokkai"].includes(activityType)) {
      return NextResponse.json(
        { error: "Invalid activityType. Must be 'vocabulary', 'grammar', or 'dokkai'" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Add to learningHistory
    if (!user.learningHistory) {
      user.learningHistory = [];
    }

    user.learningHistory.push({
      date: new Date(),
      activityType,
      score,
      timeSpent: Number(timeSpent)
    });

    // 2. If a total is provided, it's a quiz or comprehension check, add to progress.quizScores
    if (total !== undefined) {
      if (!user.progress) {
        user.progress = { vocabLearned: [], quizScores: [] };
      }
      if (!user.progress.quizScores) {
        user.progress.quizScores = [];
      }

      user.progress.quizScores.push({
        score: Number(score),
        total: Number(total),
        date: new Date(),
        type: activityType
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      learningHistory: user.learningHistory,
      quizScores: user.progress?.quizScores || []
    });
  } catch (error: any) {
    console.error("Activity API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log activity" },
      { status: 500 }
    );
  }
}
