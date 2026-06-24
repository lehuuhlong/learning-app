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

    // 1. Calculate Total N2 words in the database (supporting both level and jlptLevel fields)
    const totalN2Count = await Vocabulary.countDocuments({
      $or: [{ level: "N2" }, { jlptLevel: "N2" }]
    });

    // Default mock stats if user is not authenticated (helps with local visual testing!)
    if (!session || !session.user || !session.user.email) {
      const mockWordsLearned = Math.floor(totalN2Count * 0.15); // e.g., 15% learned
      const n2CompletionRate = totalN2Count > 0 
        ? Math.round((mockWordsLearned / totalN2Count) * 10000) / 100 
        : 0;

      // Get count distribution for all levels
      const [n5, n4, n3, n2, n1] = await Promise.all([
        Vocabulary.countDocuments({ $or: [{ level: "N5" }, { jlptLevel: "N5" }] }),
        Vocabulary.countDocuments({ $or: [{ level: "N4" }, { jlptLevel: "N4" }] }),
        Vocabulary.countDocuments({ $or: [{ level: "N3" }, { jlptLevel: "N3" }] }),
        Vocabulary.countDocuments({ $or: [{ level: "N2" }, { jlptLevel: "N2" }] }),
        Vocabulary.countDocuments({ $or: [{ level: "N1" }, { jlptLevel: "N1" }] })
      ]);

      const analyticsData = [
        { level: "N5", count: n5 || 700 },
        { level: "N4", count: n4 || 649 },
        { level: "N3", count: n3 || 1835 },
        { level: "N2 (Focus)", count: n2 || 1846 },
        { level: "N1", count: n1 || 3475 }
      ];

      return NextResponse.json({
        vocabLearnedCount: mockWordsLearned,
        streak: 12,
        totalN2Count,
        n2CompletionRate,
        quizAverage: 85,
        recentActivity: [
          { id: 1, action: "Learned 就任 (しゅうにん)", type: "vocabulary", time: "1 hour ago" },
          { id: 2, action: "Completed Dokkai Practice #1", type: "reading", time: "3 hours ago" },
          { id: 3, action: "Scored 9/10 on Vocab Quiz", type: "quiz", time: "yesterday" }
        ],
        analyticsData,
        learnedVocabIds: []
      });
    }

    // Authenticated path - fetch from DB
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate Vocab Learned Count
    // Query Progress collection first
    const learnedProgressCount = await Progress.countDocuments({
      userId: user._id,
      level: "N2",
      status: "learned"
    });

    // Support fallback to user.progress.vocabLearned
    let userVocabLearnedCount = 0;
    if (user.progress?.vocabLearned && user.progress.vocabLearned.length > 0) {
      userVocabLearnedCount = await Vocabulary.countDocuments({
        _id: { $in: user.progress.vocabLearned },
        $or: [{ level: "N2" }, { jlptLevel: "N2" }]
      });
    }

    const vocabLearnedCount = Math.max(learnedProgressCount, userVocabLearnedCount);

    // Completion rate
    const n2CompletionRate = totalN2Count > 0 
      ? Math.round((vocabLearnedCount / totalN2Count) * 10000) / 100 
      : 0;

    // Calculate Quiz Average
    const scores = user.progress?.quizScores || [];
    const quizAverage = scores.length > 0
      ? Math.round(scores.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / scores.length * 100)
      : 0; // 0% if no quizzes taken yet

    // Calculate Streak
    const activityDates: Date[] = [];
    
    // Get progress timestamps
    const progressActivities = await Progress.find({ userId: user._id }).select("updatedAt");
    progressActivities.forEach(p => activityDates.push(new Date(p.updatedAt)));
    
    // Get quiz score dates
    scores.forEach(q => activityDates.push(new Date(q.date)));
    
    const streak = calculateStreak(activityDates);

    // Get Recent Activity
    const recentActivity = [];
    let activityId = 1;

    const recentProgress = await Progress.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("vocabId");

    for (const prog of recentProgress) {
      const vocab = prog.vocabId as any;
      if (vocab) {
        recentActivity.push({
          id: activityId++,
          action: `Learned ${vocab.word} (${vocab.reading})`,
          type: "vocabulary",
          time: formatTimeAgo(new Date(prog.updatedAt)),
          date: new Date(prog.updatedAt)
        });
      }
    }

    scores.forEach((quiz) => {
      recentActivity.push({
        id: activityId++,
        action: `Scored ${quiz.score}/${quiz.total} on ${quiz.type === "vocabulary" ? "Vocab" : "Grammar"} Quiz`,
        type: "quiz",
        time: formatTimeAgo(new Date(quiz.date)),
        date: new Date(quiz.date)
      });
    });

    recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

    const finalRecentActivity = recentActivity.slice(0, 5).map((act, index) => ({
      id: index + 1,
      action: act.action,
      type: act.type,
      time: act.time
    }));

    if (finalRecentActivity.length === 0) {
      finalRecentActivity.push({
        id: 1,
        action: "Joined the platform! Welcome!",
        type: "grammar",
        time: formatTimeAgo(new Date(user.createdAt || Date.now()))
      });
    }

    // Get count distribution for all levels
    const [n5, n4, n3, n2, n1] = await Promise.all([
      Vocabulary.countDocuments({ $or: [{ level: "N5" }, { jlptLevel: "N5" }] }),
      Vocabulary.countDocuments({ $or: [{ level: "N4" }, { jlptLevel: "N4" }] }),
      Vocabulary.countDocuments({ $or: [{ level: "N3" }, { jlptLevel: "N3" }] }),
      Vocabulary.countDocuments({ $or: [{ level: "N2" }, { jlptLevel: "N2" }] }),
      Vocabulary.countDocuments({ $or: [{ level: "N1" }, { jlptLevel: "N1" }] })
    ]);

    const analyticsData = [
      { level: "N5", count: n5 || 700 },
      { level: "N4", count: n4 || 649 },
      { level: "N3", count: n3 || 1835 },
      { level: "N2 (Focus)", count: n2 || 1846 },
      { level: "N1", count: n1 || 3475 }
    ];

    return NextResponse.json({
      vocabLearnedCount,
      streak,
      totalN2Count,
      n2CompletionRate,
      quizAverage,
      recentActivity: finalRecentActivity,
      analyticsData,
      learnedVocabIds: user.progress?.vocabLearned || []
    });
  } catch (error: any) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const uniqueDateStrings = Array.from(
    new Set(
      dates.map(d => {
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

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
