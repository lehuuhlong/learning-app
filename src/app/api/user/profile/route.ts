import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Vocabulary from "@/models/Vocabulary";
import Progress from "@/models/Progress";

export async function GET() {
  try {
    await dbConnect();
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetLevel = user.targetLevel || "N2";

    // 1. Calculate stats
    // Total vocabulary words learned
    const vocabLearnedCount = await Progress.countDocuments({
      userId: user._id,
      status: "learned"
    });

    // Total quizzes completed
    const scores = user.progress?.quizScores || [];
    const quizzesCount = scores.length;

    // Quiz average
    const quizAverage = scores.length > 0
      ? Math.round(scores.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / scores.length * 100)
      : 0;

    // 2. Generate last 7 days calendar dates (local time)
    interface DayData {
      dateStr: string;
      dayLabel: string;
      words: number;
      quizzes: number;
      reading: number;
    }
    const last7Days: DayData[] = [];
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const dayLabel = weekdays[d.getDay()];
      last7Days.push({
        dateStr,
        dayLabel,
        words: 0,
        quizzes: 0,
        reading: 0
      });
    }

    // Populate data from learningHistory
    const history = user.learningHistory || [];
    history.forEach((act) => {
      const actDateStr = new Date(act.date).toISOString().split("T")[0];
      const dayData = last7Days.find(d => d.dateStr === actDateStr);
      if (dayData) {
        if (act.activityType === "vocabulary") {
          dayData.words += act.score; // words learned
        } else if (act.activityType === "grammar") {
          dayData.quizzes += 1; // quizzes completed
        } else if (act.activityType === "dokkai") {
          dayData.reading += 1; // reading passages completed
        }
      }
    });

    const chartData = last7Days.map(d => ({
      day: d.dayLabel,
      words: d.words,
      quizzes: d.quizzes,
      reading: d.reading
    }));

    return NextResponse.json({
      name: user.name,
      email: user.email,
      targetLevel,
      provider: user.provider,
      createdAt: user.createdAt,
      stats: {
        vocabLearnedCount,
        quizzesCount,
        quizAverage,
        streak: calculateStreak(history, scores),
      },
      chartData
    });
  } catch (error: any) {
    console.error("Profile API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateStreak(history: any[], quizScores: any[]): number {
  const activityDates: Date[] = [];
  history.forEach(h => activityDates.push(new Date(h.date)));
  quizScores.forEach(q => activityDates.push(new Date(q.date)));

  if (activityDates.length === 0) return 0;

  const uniqueDateStrings = Array.from(
    new Set(
      activityDates.map(d => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a));

  if (uniqueDateStrings.length === 0) return 0;

  const todayStr = getLocalDateString(new Date());
  const yesterdayStr = getLocalDateString(new Date(Date.now() - 86400000));
  const newestDateStr = uniqueDateStrings[0];

  if (newestDateStr !== todayStr && newestDateStr !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = newestDateStr === todayStr ? new Date() : new Date(Date.now() - 86400000);

  for (const dateStr of uniqueDateStrings) {
    const expectedStr = getLocalDateString(currentDate);
    if (dateStr === expectedStr) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
