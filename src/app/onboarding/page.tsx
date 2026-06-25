"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface JLPTLevelOption {
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  badgeColor: string;
  hoverGlow: string;
}

const levels: JLPTLevelOption[] = [
  {
    level: "N5",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    hoverGlow: "hover:border-emerald-500/30 group-hover:shadow-emerald-500/5 from-emerald-500/[0.03]"
  },
  {
    level: "N4",
    badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    hoverGlow: "hover:border-teal-500/30 group-hover:shadow-teal-500/5 from-teal-500/[0.03]"
  },
  {
    level: "N3",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    hoverGlow: "hover:border-blue-500/30 group-hover:shadow-blue-500/5 from-blue-500/[0.03]"
  },
  {
    level: "N2",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    hoverGlow: "hover:border-violet-500/30 group-hover:shadow-violet-500/5 from-violet-500/[0.03]"
  },
  {
    level: "N1",
    badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    hoverGlow: "hover:border-rose-500/30 group-hover:shadow-rose-500/5 from-rose-500/[0.03]"
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<"N5" | "N4" | "N3" | "N2" | "N1" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSelect = (level: "N5" | "N4" | "N3" | "N2" | "N1") => {
    setSelected(level);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLevel: selected }),
      });

      if (response.ok) {
        // Force fully reload or navigate to trigger dashboard stats fetch
        router.push("/dashboard");
        router.refresh();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save level");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("common.errorOccurred"));
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-background relative overflow-hidden">
      {/* Animated gradient blobs in background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-3xl space-y-8 z-10">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-2">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent sm:text-4xl">
            {t("onboarding.title")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
            {t("onboarding.subtitle")}
          </p>
        </div>

        {/* Level List */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-5">
          {levels.map((opt) => {
            const isSelected = selected === opt.level;
            return (
              <Card
                key={opt.level}
                onClick={() => handleSelect(opt.level)}
                className={cn(
                  "group relative overflow-hidden cursor-pointer border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] select-none md:col-span-1",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : opt.hoverGlow
                )}
              >
                {/* Selection Highlight Gradient */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                )}

                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3 flex-1">
                    {/* Badge */}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={cn("text-xs font-bold rounded-full px-2 py-0.5", opt.badgeColor)}>
                        {opt.level}
                      </Badge>
                      {isSelected && (
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      )}
                    </div>

                    {/* Level Title */}
                    <h3 className="font-bold text-base text-foreground leading-tight">
                      {t(`onboarding.levels.${opt.level}.title`)}
                    </h3>

                    {/* Level Description */}
                    <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-4">
                      {t(`onboarding.levels.${opt.level}.desc`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Button & Errors */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          {error && (
            <p className="text-sm text-rose-500 font-semibold bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20">
              {error}
            </p>
          )}

          <Button
            onClick={handleConfirm}
            disabled={!selected || saving}
            className="w-full sm:w-64 gap-2 font-bold py-6 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("onboarding.loading")}
              </>
            ) : (
              <>
                {t("onboarding.confirmBtn")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
