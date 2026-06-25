"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Brain,
  Trophy,
  Flame,
  Sparkles,
  PlusCircle,
  Zap,
  Star,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatsCard from "@/components/dashboard/StatsCard";
import ProgressChart from "@/components/dashboard/ProgressChart";
import DatasetAnalytics from "@/components/dashboard/DatasetAnalytics";
import Roadmap from "@/components/dashboard/Roadmap";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface Stats {
  vocabLearnedCount: number;
  streak: number;
  totalN2Count: number;
  n2CompletionRate: number;
  quizAverage: number;
  recentActivity: Array<{
    id: number;
    action: string;
    type: string;
    time: string;
  }>;
  analyticsData: Array<{ level: string; count: number }>;
  isFirstLogin?: boolean;
  targetLevel?: string;
}

interface GamificationData {
  exp: number;
  level: number;
  expToNext: {
    current: number;
    required: number;
    progress: number;
  };
  currentStreak: number;
  longestStreak: number;
  flashcardsToday: number;
  earnedBadges: Array<{ id: string; name: string; icon: string; description: string }>;
}

const typeColors: Record<string, string> = {
  vocabulary: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  reading: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  quiz: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  grammar: "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Predefined recent vocab for the dashboard lookup showcase
  const recentVocab = [
    { kanji: "影響", hiragana: "えいきょう", romaji: "eikyou", meaning: "influence; effect" },
    { kanji: "経験", hiragana: "けいけん", romaji: "keiken", meaning: "experience" },
    { kanji: "複雑", hiragana: "ふくざつ", romaji: "fukuzatsu", meaning: "complicated; complex" },
    { kanji: "届ける", hiragana: "とどける", romaji: "todokeru", meaning: "to deliver" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, gamRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/user/gamification"),
        ]);

        if (dashRes.ok) {
          const data = await dashRes.json();
          if (data.isFirstLogin) {
            window.location.href = "/onboarding";
            return;
          }
          setStats(data);
        }

        if (gamRes.ok) {
          const gamData = await gamRes.json();
          setGamification(gamData);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Circular progress calculations for the Daily Goal Progress Ring
  const dailyGoalPercent = stats
    ? Math.min(Math.round((stats.vocabLearnedCount / 200) * 100), 100)
    : 21;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (dailyGoalPercent / 100) * circumference;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">
            {t("dashboard.loading")}
          </p>
        </div>
      </div>
    );
  }

  const currentStats = stats || {
    vocabLearnedCount: 42,
    streak: 7,
    totalN2Count: 1846,
    n2CompletionRate: 2.27,
    quizAverage: 78,
    recentActivity: [],
    analyticsData: [
      { level: "N5", count: 700 },
      { level: "N4", count: 649 },
      { level: "N3", count: 1835 },
      { level: "N2 (Focus)", count: 1846 },
      { level: "N1", count: 3475 },
    ],
    isFirstLogin: false,
    targetLevel: "N2",
  };

  const streak = gamification?.currentStreak ?? currentStats.streak;
  const exp = gamification?.exp ?? 0;
  const level = gamification?.level ?? 1;
  const expProgress = gamification?.expToNext ?? {
    current: 0,
    required: 100,
    progress: 0,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
            {t("dashboard.welcome")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <Badge className="bg-violet-500/10 text-violet-500 border border-violet-500/20 px-3 py-1 font-bold text-sm">
            <Star className="h-3.5 w-3.5 mr-1" />
            {t("common.level")}.{level}
          </Badge>
          <Link href="/vocabulary">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-md border-none font-semibold transition-all hover:scale-105">
              <PlusCircle className="h-4 w-4" />
              {t("dashboard.learnNewWords")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("dashboard.wordsLearned")}
          value={currentStats.vocabLearnedCount}
          description={t("dashboard.ofN2Words", { total: currentStats.totalN2Count })}
          icon={BookOpen}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title={t("dashboard.quizAverage")}
          value={`${currentStats.quizAverage}%`}
          description={t("dashboard.acrossQuizzes")}
          icon={Brain}
          trend={{ value: 5, isPositive: true }}
          color="violet"
        />
        <StatsCard
          title={t("dashboard.mastery")}
          value={`${currentStats.n2CompletionRate}%`}
          description={t("dashboard.syllabusComplete")}
          icon={Trophy}
          color="amber"
        />
        {/* Streak Card with Fire Animation */}
        <Card className="group relative overflow-hidden border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg h-full">
          {/* Subtle gradient overlay on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/[0.05] group-hover:shadow-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {t("dashboard.streakTitle")}
              </p>
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  streak > 0
                    ? "bg-rose-500/10 animate-pulse"
                    : "bg-muted/20"
                )}
              >
                <Flame
                  className={cn(
                    "h-5 w-5",
                    streak > 0 ? "text-rose-500" : "text-muted-foreground"
                  )}
                />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold">
                <span
                  className={cn(
                    streak > 0
                      ? "bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent"
                      : ""
                  )}
                >
                  {streak} {streak === 1 ? t("dashboard.day") : t("dashboard.days")}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {streak >= 7
                  ? t("common.onFire")
                  : streak >= 3
                  ? t("common.dontBreakStreak")
                  : streak > 0
                  ? t("common.goodStartStreak")
                  : t("common.startStreakHint")}
              </p>
              {gamification && gamification.longestStreak > 0 && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {t("dashboard.longestStreak", { count: gamification.longestStreak })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bento Layout with 2 Columns to eliminate vertical gaps */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ProgressChart />
          
          <Roadmap targetLevel={currentStats.targetLevel || "N2"} />

          {/* Recent Vocab */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t("dashboard.recentVocabTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.recentVocabDesc", { level: currentStats.targetLevel || "N2" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentVocab.map((vocab) => (
                  <div
                    key={vocab.kanji}
                    className="flex flex-col p-3 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-all hover:bg-card/60"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {vocab.kanji}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {vocab.hiragana}
                      </span>
                    </div>
                    <span className="text-xs text-primary font-medium tracking-wide pb-1">
                      {vocab.romaji}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1 border-t border-border/20 pt-1">
                      {vocab.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* EXP & Level Card */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                {t("dashboard.levelExpTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.levelExpDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-5">
              {/* Level Display */}
              <div className="relative flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border-2 border-amber-500/30 shadow-lg shadow-amber-500/10">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                      {level}
                    </p>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                      {t("common.level")}
                    </p>
                  </div>
                </div>
              </div>

              {/* EXP Progress Bar */}
              <div className="w-full max-w-[220px] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <Zap className="h-3 w-3 inline mr-0.5 text-amber-500" />
                    {expProgress.current} / {expProgress.required} EXP
                  </span>
                  <span className="font-semibold text-amber-500">
                    {expProgress.progress}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700 ease-out shadow-sm shadow-amber-500/30"
                    style={{ width: `${expProgress.progress}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  {t("dashboard.totalExp", { exp })}
                </p>
              </div>

              {/* Recent Badges */}
              {gamification &&
                gamification.earnedBadges &&
                gamification.earnedBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {gamification.earnedBadges.slice(0, 3).map((badge) => (
                      <Badge
                        key={badge.id}
                        variant="outline"
                        className="text-[10px] bg-amber-500/5 border-amber-500/20 text-amber-500"
                      >
                        {badge.icon} {badge.name}
                      </Badge>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>

          <DatasetAnalytics data={currentStats.analyticsData} />

          {/* Daily Goal Ring */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                {t("dashboard.dailyGoalTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.dailyGoalDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative flex items-center justify-center h-36 w-36">
                <svg
                  viewBox="0 0 144 144"
                  className="w-full h-full transform -rotate-90"
                >
                  {/* Background Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-muted/20 stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Glowing Progress Circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-primary stroke-current transition-all duration-700 ease-out"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold">
                    {dailyGoalPercent}%
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Progress
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                {t("dashboard.dailyGoalProgress", { learned: currentStats.vocabLearnedCount, target: 200 })}
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t("dashboard.recentActivityTitle")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.recentActivityDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {currentStats.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="mt-0.5">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] font-semibold border px-2 py-0.5 rounded-full",
                          typeColors[item.type] || ""
                        )}
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {item.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
