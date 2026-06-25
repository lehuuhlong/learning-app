"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Brain,
  Trophy,
  Flame,
  User as UserIcon,
  Calendar,
  Mail,
  ShieldAlert,
  Loader2,
  Zap,
  Star,
  Lock,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";
import { cn } from "@/lib/utils";

interface ProfileData {
  name: string;
  email: string;
  targetLevel: string;
  provider: string;
  createdAt: string;
  stats: {
    vocabLearnedCount: number;
    quizzesCount: number;
    quizAverage: number;
    streak: number;
  };
  chartData: Array<{
    day: string;
    words: number;
    quizzes: number;
    reading: number;
  }>;
}

interface BadgeInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
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
  earnedBadges: BadgeInfo[];
  lockedBadges: BadgeInfo[];
}

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const chartConfig = {
    words: {
      label: t("profile.chartWords"),
      color: "var(--chart-1)",
    },
    quizzes: {
      label: t("profile.chartQuizzes"),
      color: "var(--chart-2)",
    },
    reading: {
      label: t("profile.chartReading"),
      color: "var(--chart-3)",
    },
  };
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, gamRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/gamification"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        }

        if (gamRes.ok) {
          const gamData = await gamRes.json();
          setGamification(gamData);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            {t("profile.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t("profile.unauthenticated")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("profile.unauthenticatedDesc")}
        </p>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const formattedDate = new Date(profile.createdAt).toLocaleDateString(
    language === "vi" ? "vi-VN" : "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const exp = gamification?.exp ?? 0;
  const level = gamification?.level ?? 1;
  const expProgress = gamification?.expToNext ?? {
    current: 0,
    required: 100,
    progress: 0,
  };
  const streak = gamification?.currentStreak ?? profile.stats.streak;
  const longestStreak = gamification?.longestStreak ?? streak;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Profile Section */}
      <Card className="border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden relative hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-rose-600/20" />
        <CardContent className="pt-16 pb-6 px-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Level badge on avatar */}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-extrabold rounded-full h-7 w-7 flex items-center justify-center ring-2 ring-background shadow-md">
                {level}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {profile.name}
                </h2>
                {streak > 0 && (
                  <span className="text-lg" title={`${streak} day streak`}>
                    🔥
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("profile.joined", { date: formattedDate })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge className="bg-violet-500/10 text-violet-500 border border-violet-500/20 px-3 py-1 font-bold text-sm">
              {t("profile.target", { level: profile.targetLevel })}
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 font-bold text-sm">
              <Zap className="h-3 w-3 mr-1" />
              {exp} EXP
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 font-bold text-sm uppercase">
              {t("profile.provider", { provider: profile.provider })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title={t("profile.vocabLearned")}
          value={profile.stats.vocabLearnedCount}
          description={t("profile.vocabLearnedDesc")}
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title={t("profile.quizzesDone")}
          value={profile.stats.quizzesCount}
          description={t("profile.quizzesDoneDesc")}
          icon={Brain}
          color="violet"
        />
        <StatsCard
          title={t("profile.quizAverage")}
          value={`${profile.stats.quizAverage}%`}
          description={t("profile.quizAverageDesc")}
          icon={Trophy}
          color="amber"
        />
        <StatsCard
          title={t("profile.streakTitle")}
          value={`${streak} ${streak === 1 ? t("dashboard.day") : t("dashboard.days")}`}
          description={t("profile.longestStreak", { count: longestStreak })}
          icon={Flame}
          color="rose"
        />
        <StatsCard
          title={t("profile.levelExpTitle")}
          value={`Lv.${level}`}
          description={`${expProgress.current}/${expProgress.required} EXP`}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Achievement Badges Showcase */}
      <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {t("profile.badgesTitle")}
          </CardTitle>
          <CardDescription>
            {t("profile.badgesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Earned Badges */}
            {gamification?.earnedBadges?.map((badge) => (
              <div
                key={badge.id}
                className="relative flex items-center gap-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 shadow-sm shadow-amber-500/10 transition-all hover:shadow-amber-500/20 hover:scale-[1.02]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-2xl shadow-inner">
                  {badge.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    {badge.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badge.description}
                  </p>
                </div>
                {/* Glow dot */}
                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              </div>
            ))}

            {/* Locked Badges */}
            {gamification?.lockedBadges?.map((badge) => (
              <div
                key={badge.id}
                className="relative flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/10 opacity-60 transition-all hover:opacity-80"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/20 text-2xl grayscale relative">
                  {badge.icon}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-muted-foreground">
                    {badge.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    {badge.requirement}
                  </p>
                </div>
              </div>
            ))}

            {/* Fallback when gamification not loaded */}
            {!gamification && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                {t("profile.noBadges")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning History Chart */}
      <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500" />
            {t("profile.chartTitle")}
          </CardTitle>
          <CardDescription>
            {t("profile.chartDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full pt-4">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={profile.chartData} barGap={4} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "var(--accent)", opacity: 0.15 }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-foreground">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="words"
                  fill="var(--color-words)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="quizzes"
                  fill="var(--color-quizzes)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="reading"
                  fill="var(--color-reading)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
