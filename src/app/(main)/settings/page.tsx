"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Lock,
  Target,
  Sparkles,
  Info,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const levels = [
  { level: "N5", badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" },
  { level: "N4", badgeColor: "bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20" },
  { level: "N3", badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20" },
  { level: "N2", badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/20" },
  { level: "N1", badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20" },
];

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const [targetLevel, setTargetLevel] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [savingLevel, setSavingLevel] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { t } = useLanguage();

  // Zod Validation Schema defined inside component to react to language changes
  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1, t("settings.currentPasswordRequired")),
      newPassword: z.string().min(6, t("settings.newPasswordMin")),
      confirmPassword: z.string().min(1, t("settings.confirmPasswordRequired")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("settings.passwordMismatch"),
      path: ["confirmPassword"],
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch initial profile/settings details
  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setTargetLevel(data.targetLevel);
          setProvider(data.provider);
        }
      } catch (err) {
        console.error("Failed to load settings details", err);
      } finally {
        setLoadingLevel(false);
      }
    }

    if (status === "authenticated") {
      fetchSettings();
    } else if (status === "unauthenticated") {
      setLoadingLevel(false);
    }
  }, [status]);

  // Handle changing JLPT Level
  const handleLevelChange = async (level: string) => {
    if (savingLevel || level === targetLevel) return;
    setSavingLevel(true);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLevel: level }),
      });

      if (response.ok) {
        setTargetLevel(level);
        toast.success(t("settings.toastSuccessLevel", { level }));
        // Refresh session to keep level data synced
        await update();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || t("settings.toastErrorLevel"));
      }
    } catch (err: any) {
      toast.error(err.message || t("settings.toastErrorLevel"));
    } finally {
      setSavingLevel(false);
    }
  };

  // Handle Changing Password
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setChangingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("settings.toastSuccessPassword"));
        reset();
      } else {
        throw new Error(data.error || t("settings.toastErrorPassword"));
      }
    } catch (err: any) {
      toast.error(err.message || t("settings.toastErrorPassword"));
    } finally {
      setChangingPassword(false);
    }
  };

  if (status === "loading" || loadingLevel) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">{t("settings.loading")}</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Info className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{t("common.unauthenticated")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("common.pleaseLoginSettings")}
        </p>
      </div>
    );
  }

  const isGoogleUser = provider === "google";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
          {t("settings.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Card: Target Level Setting */}
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-500" />
              {t("settings.jlptTitle")}
            </CardTitle>
            <CardDescription>
              {t("settings.jlptDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-muted-foreground">{t("settings.selectLevel")}</Label>
              <div className="grid grid-cols-5 gap-2">
                {levels.map((lvl) => {
                  const isActive = targetLevel === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      disabled={savingLevel}
                      onClick={() => handleLevelChange(lvl.level)}
                      className={cn(
                        "flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-300 font-bold text-base cursor-pointer",
                        isActive
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground scale-105 shadow-md shadow-primary/5"
                          : "border-border/40 bg-card/40 hover:scale-102 hover:border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>{lvl.level}</span>
                      {isActive && <Sparkles className="h-3 w-3 mt-1 text-primary animate-pulse" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3.5 flex gap-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <p>
                {t("settings.jlptChangeWarning")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Change Password Form */}
        <Card className="border border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              {t("settings.passwordTitle")}
            </CardTitle>
            <CardDescription>
              {t("settings.passwordDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGoogleUser ? (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <div className="flex gap-2.5 text-amber-500 text-sm font-semibold">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span>{t("settings.oauthWarningTitle")}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t("settings.oauthWarningDesc")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
                  <Input
                    type="password"
                    id="currentPassword"
                    placeholder="••••••••"
                    className="border-border/40 focus:border-primary/50"
                    {...register("currentPassword")}
                  />
                  {errors.currentPassword && (
                    <p className="text-xs text-rose-500 font-medium">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                  <Input
                    type="password"
                    id="newPassword"
                    placeholder="••••••••"
                    className="border-border/40 focus:border-primary/50"
                    {...register("newPassword")}
                  />
                  {errors.newPassword && (
                    <p className="text-xs text-rose-500 font-medium">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("settings.confirmNewPassword")}</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="border-border/40 focus:border-primary/50"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-500 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full font-bold bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-md rounded-xl transition-all"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("settings.processing")}
                    </>
                  ) : (
                    t("settings.changePasswordBtn")
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
