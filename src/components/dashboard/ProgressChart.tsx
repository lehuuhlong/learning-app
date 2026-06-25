"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useLanguage } from "@/components/providers/LanguageProvider";

const rawChartData = [
  { day: "Mon", words: 8, quizzes: 2 },
  { day: "Tue", words: 12, quizzes: 3 },
  { day: "Wed", words: 5, quizzes: 1 },
  { day: "Thu", words: 15, quizzes: 4 },
  { day: "Fri", words: 10, quizzes: 2 },
  { day: "Sat", words: 18, quizzes: 5 },
  { day: "Sun", words: 7, quizzes: 1 },
];

const dayTranslations: Record<string, Record<string, string>> = {
  en: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
  vi: { Mon: "T2", Tue: "T3", Wed: "T4", Thu: "T5", Fri: "T6", Sat: "T7", Sun: "CN" }
};

export default function ProgressChart() {
  const { t, language } = useLanguage();

  const chartConfig = {
    words: {
      label: t("progressChart.words"),
      color: "var(--chart-1)",
    },
    quizzes: {
      label: t("progressChart.quizzes"),
      color: "var(--chart-3)",
    },
  };

  const days = dayTranslations[language] || dayTranslations["en"];
  const chartData = rawChartData.map(item => ({
    ...item,
    day: days[item.day] || item.day
  }));

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("progressChart.title")}</CardTitle>
        <CardDescription>
          {t("progressChart.desc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={chartData} barGap={4}>
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
                cursor={{ fill: "var(--accent)", opacity: 0.3 }}
              />
              <Bar
                dataKey="words"
                name={t("progressChart.words")}
                fill="var(--color-words)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="quizzes"
                name={t("progressChart.quizzes")}
                fill="var(--color-quizzes)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
