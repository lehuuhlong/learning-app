"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface RoadmapProps {
  targetLevel: "N5" | "N4" | "N3" | "N2" | "N1" | string;
}

export default function Roadmap({ targetLevel }: RoadmapProps) {
  const { t } = useLanguage();
  const level = ["N5", "N4", "N3", "N2", "N1"].includes(targetLevel) ? targetLevel : "N2";
  
  const stepPrefixes = ["_1", "_2", "_3", "_4", "_5"];
  const isFirstCompleted = level === "N5" || level === "N4";

  const milestones = stepPrefixes.map((suffix, idx) => {
    const key = `${level}${suffix}`;
    return {
      title: t(`roadmap.milestones.${key}_title`),
      description: t(`roadmap.milestones.${key}_desc`),
      isCompleted: idx === 0 && isFirstCompleted,
    };
  });

  return (
    <Card className="border border-border/50 bg-card/80 backdrop-blur-sm flex flex-col h-full hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            {t("roadmap.title", { level })}
          </CardTitle>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <CardDescription>{t("roadmap.subtitle", { level })}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto px-6 py-2">
        <div className="relative border-l border-border/60 pl-6 ml-3 space-y-6 my-2">
          {milestones.map((step, index) => (
            <div key={index} className="relative group">
              {/* Icon Marker */}
              <span className="absolute -left-[35px] top-0.5 flex items-center justify-center rounded-full bg-background transition-transform duration-200 group-hover:scale-110">
                {step.isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 bg-emerald-500/10 rounded-full" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground/40 bg-muted/10 rounded-full" />
                )}
              </span>

              {/* Step Content */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    "text-sm font-semibold transition-colors leading-none",
                    step.isCompleted ? "text-emerald-500" : "text-foreground",
                    "group-hover:text-primary"
                  )}>
                    {step.title}
                  </h4>
                  {index === 1 && !step.isCompleted && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border border-primary/20 animate-pulse">
                      {t("roadmap.nextStep")}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-normal max-w-md">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
