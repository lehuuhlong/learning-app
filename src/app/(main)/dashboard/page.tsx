"use client";

import { useState, useEffect } from "react";
import { BookOpen, Brain, Trophy, Flame, Sparkles, PlusCircle } from "lucide-react";
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
import Link from "next/link";
import { cn } from "@/lib/utils";

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
}

const typeColors: Record<string, string> = {
  vocabulary: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  reading: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  quiz: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  grammar: "bg-violet-500/10 text-violet-500 border-violet-500/20",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Predefined recent vocab for the dashboard lookup showcase
  const recentVocab = [
    { kanji: "影響", hiragana: "えいきょう", romaji: "eikyou", meaning: "influence; effect" },
    { kanji: "経験", hiragana: "けいけん", romaji: "けいけん", meaning: "experience" },
    { kanji: "複雑", hiragana: "ふくざつ", romaji: "fukuzatsu", meaning: "complicated; complex" },
    { kanji: "届ける", hiragana: "とどける", romaji: "todokeru", meaning: "to deliver" }
  ];

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Circular progress calculations for the Daily Goal Progress Ring
  const dailyGoalPercent = stats ? Math.min(Math.round((stats.vocabLearnedCount / 200) * 100), 100) : 21;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (dailyGoalPercent / 100) * circumference;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading your stats...</p>
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
      { level: "N1", count: 3475 }
    ]
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
            Welcome Back!
          </h1>
          <p className="text-muted-foreground">
            Track your JLPT progress, vocabulary, and continue your customized studies.
          </p>
        </div>
        <Link href="/vocabulary">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-md border-none font-semibold transition-all hover:scale-105">
            <PlusCircle className="h-4 w-4" />
            Learn New Words
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Words Learned"
          value={currentStats.vocabLearnedCount}
          description={`of ${currentStats.totalN2Count} N2 words`}
          icon={BookOpen}
          trend={{ value: 12, isPositive: true }}
          color="blue"
        />
        <StatsCard
          title="Quiz Average"
          value={`${currentStats.quizAverage}%`}
          description="across N2 quizzes"
          icon={Brain}
          trend={{ value: 5, isPositive: true }}
          color="violet"
        />
        <StatsCard
          title="N2 Mastery"
          value={`${currentStats.n2CompletionRate}%`}
          description="syllabus complete"
          icon={Trophy}
          color="amber"
        />
        <StatsCard
          title="Study Streak"
          value={`${currentStats.streak} days`}
          description="Keep up the momentum!"
          icon={Flame}
          trend={{ value: 3, isPositive: true }}
          color="rose"
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-12">
        {/* Progress Chart - Bento Grid 7 Cols */}
        <div className="md:col-span-2 lg:col-span-7 flex">
          <ProgressChart />
        </div>

        {/* Daily Goal Ring - Bento Grid 5 Cols */}
        <div className="md:col-span-1 lg:col-span-5 flex">
          <Card className="glass-card flex-1 flex flex-col justify-between border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                Daily N2 Goal
              </CardTitle>
              <CardDescription>Master 200 words to finish stage 1</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative flex items-center justify-center h-36 w-36">
                <svg className="w-full h-full transform -rotate-90">
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
                  <span className="text-2xl font-extrabold">{dailyGoalPercent}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Progress
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                You have learned <strong className="text-foreground">{currentStats.vocabLearnedCount}</strong> words out of your target goal of 200 words.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dataset Analytics - Bento Grid 6 Cols */}
        <div className="md:col-span-3 lg:col-span-6 flex">
          <DatasetAnalytics data={currentStats.analyticsData} />
        </div>

        {/* Recent Vocab - Bento Grid 6 Cols */}
        <div className="md:col-span-3 lg:col-span-6 flex">
          <Card className="glass-card flex-1 border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Vocabulary</CardTitle>
              <CardDescription>Top words from your N2 learning syllabus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {recentVocab.map((vocab) => (
                  <div
                    key={vocab.kanji}
                    className="flex flex-col p-3 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-all hover:bg-card/60"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold text-foreground">{vocab.kanji}</span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{vocab.hiragana}</span>
                    </div>
                    <span className="text-xs text-primary font-medium tracking-wide pb-1">{vocab.romaji}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1 border-t border-border/20 pt-1">
                      {vocab.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Bento Grid 12 Cols */}
        <div className="md:col-span-3 lg:col-span-12 flex">
          <Card className="glass-card flex-1 border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <CardDescription>Your latest learning actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                      <p className="text-sm font-medium leading-tight">
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
