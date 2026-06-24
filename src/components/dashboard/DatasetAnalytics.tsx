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

interface DatasetAnalyticsProps {
  data: Array<{ level: string; count: number }>;
}

export default function DatasetAnalytics({ data }: DatasetAnalyticsProps) {
  const chartConfig = {
    count: {
      label: "Words Count",
      color: "var(--chart-2)",
    },
  };

  return (
    <Card className="glass-card border-none flex-1 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">N2 Dataset Analytics</CardTitle>
        <CardDescription>
          Distribution of vocabulary imported into the database across all JLPT levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="level"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="var(--muted-foreground)"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                stroke="var(--muted-foreground)"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "var(--accent)", opacity: 0.1 }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <p className="text-center text-xs font-semibold text-violet-500/80 dark:text-violet-400/80 bg-violet-500/5 py-2 rounded-lg border border-violet-500/10">
          📊 Tỷ lệ từ vựng và ngữ pháp đã được Import thành công vào Database.
        </p>
      </CardContent>
    </Card>
  );
}
