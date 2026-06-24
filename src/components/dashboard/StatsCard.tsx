import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "blue" | "emerald" | "amber" | "rose" | "violet";
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  rose: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  violet: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
};

const gradientMap = {
  primary: "from-primary/[0.03] group-hover:shadow-primary/5",
  blue: "from-blue-500/[0.05] group-hover:shadow-blue-500/5",
  emerald: "from-emerald-500/[0.05] group-hover:shadow-emerald-500/5",
  amber: "from-amber-500/[0.05] group-hover:shadow-amber-500/5",
  rose: "from-rose-500/[0.05] group-hover:shadow-rose-500/5",
  violet: "from-violet-500/[0.05] group-hover:shadow-violet-500/5",
};

export default function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = "primary",
}: StatsCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg h-full",
      color === "primary" ? "" : `hover:border-${color}-500/30`
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        gradientMap[color]
      )} />

      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1.5">
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold",
                    trend.isPositive ? "text-emerald-500" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            colorMap[color]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
