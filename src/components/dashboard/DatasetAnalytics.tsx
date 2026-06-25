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

interface DatasetAnalyticsProps {
  data: Array<{ level: string; count: number }>;
}

export default function DatasetAnalytics({ data }: DatasetAnalyticsProps) {
  const { t } = useLanguage();

  const chartConfig = {
    count: {
      label: t("datasetAnalytics.wordsCount"),
      color: "var(--chart-2)",
    },
  };

  return (
    <Card className="glass-card border-none flex-1 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("datasetAnalytics.title")}</CardTitle>
        <CardDescription>
          {t("datasetAnalytics.desc")}
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
                name={t("datasetAnalytics.wordsCount")}
                fill="var(--color-count)"
                radius={[4, 4, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ChartContainer>
        </div>
        <p className="text-center text-xs font-semibold text-violet-500/80 dark:text-violet-400/80 bg-violet-500/5 py-2 rounded-lg border border-violet-500/10">
          {t("datasetAnalytics.alert")}
        </p>
      </CardContent>
    </Card>
  );
}
