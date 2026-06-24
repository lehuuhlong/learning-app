"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import StatsCard from "@/components/dashboard/StatsCard";

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

const chartConfig = {
  words: {
    label: "Từ vựng đã học",
    color: "var(--chart-1)",
  },
  quizzes: {
    label: "Quiz ngữ pháp",
    color: "var(--chart-2)",
  },
  reading: {
    label: "Bài đọc hiểu",
    color: "var(--chart-3)",
  },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile data", err);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Đang tải thông tin cá nhân...</p>
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
        <h2 className="text-xl font-bold text-foreground">Bạn chưa đăng nhập</h2>
        <p className="text-sm text-muted-foreground">
          Vui lòng đăng nhập để xem thông tin hồ sơ và quá trình học tập.
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

  const formattedDate = new Date(profile.createdAt).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Profile Section */}
      <Card className="glass-card border-none overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-rose-600/20" />
        <CardContent className="pt-16 pb-6 px-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Tham gia từ {formattedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <Badge className="bg-violet-500/10 text-violet-500 border border-violet-500/20 px-3 py-1 font-bold text-sm">
              Mục tiêu: {profile.targetLevel}
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 font-bold text-sm uppercase">
              Tài khoản: {profile.provider}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Từ vựng đã học"
          value={profile.stats.vocabLearnedCount}
          description="tổng số từ tích lũy"
          icon={BookOpen}
          color="blue"
        />
        <StatsCard
          title="Quiz đã làm"
          value={profile.stats.quizzesCount}
          description="bài kiểm tra hoàn thành"
          icon={Brain}
          color="violet"
        />
        <StatsCard
          title="Điểm số trung bình"
          value={`${profile.stats.quizAverage}%`}
          description="trên toàn hệ thống"
          icon={Trophy}
          color="amber"
        />
        <StatsCard
          title="Chuỗi ngày học"
          value={`${profile.stats.streak} ngày`}
          description="duy trì liên tục"
          icon={Flame}
          color="rose"
        />
      </div>

      {/* Learning History Chart */}
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Flame className="h-5 w-5 text-rose-500" />
            Lịch sử học tập 7 ngày qua
          </CardTitle>
          <CardDescription>
            Theo dõi chi tiết lượng kiến thức bạn đã thu nạp trong tuần này
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full pt-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={profile.chartData} barGap={4}>
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
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: "var(--accent)", opacity: 0.15 }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-semibold text-foreground">{value}</span>}
                />
                <Bar
                  dataKey="words"
                  name="Từ vựng đã học"
                  fill="var(--color-words)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="quizzes"
                  name="Quiz ngữ pháp"
                  fill="var(--color-quizzes)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="reading"
                  name="Bài đọc hiểu"
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
