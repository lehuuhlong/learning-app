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

const chartData = [
  { day: "Mon", words: 8, quizzes: 2 },
  { day: "Tue", words: 12, quizzes: 3 },
  { day: "Wed", words: 5, quizzes: 1 },
  { day: "Thu", words: 15, quizzes: 4 },
  { day: "Fri", words: 10, quizzes: 2 },
  { day: "Sat", words: 18, quizzes: 5 },
  { day: "Sun", words: 7, quizzes: 1 },
];

const chartConfig = {
  words: {
    label: "Words Learned",
    color: "var(--chart-1)",
  },
  quizzes: {
    label: "Quizzes Taken",
    color: "var(--chart-3)",
  },
};

export default function ProgressChart() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
        <CardDescription>
          Your learning activity over the past 7 days
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
                fill="var(--color-words)"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="quizzes"
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
