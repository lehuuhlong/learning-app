"use client";

import { useState, useEffect, useCallback } from "react";
import Flashcard from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  RefreshCw,
  Flame,
  Zap,
  Trophy,
  Star,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VocabularyItem {
  _id: string;
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string[];
  level: string;
  srs?: {
    easeFactor: number;
    interval: number;
    repetitions: number;
    isReview: boolean;
  };
}

interface ReviewResult {
  gamification: {
    expGained: number;
    totalExp: number;
    level: number;
    leveledUp: boolean;
    newBadges: Array<{ id: string; name: string; icon: string }>;
    currentStreak: number;
    flashcardsToday: number;
  };
}

interface SessionStats {
  reviewed: number;
  correct: number; // quality >= 3
  expEarned: number;
  newBadges: Array<{ id: string; name: string; icon: string }>;
}

export default function FlashcardPage() {
  const { t } = useLanguage();
  const [queue, setQueue] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDue, setTotalDue] = useState(0);
  const [totalNew, setTotalNew] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [expToast, setExpToast] = useState<string | null>(null);
  const [levelUpToast, setLevelUpToast] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    reviewed: 0,
    correct: 0,
    expEarned: 0,
    newBadges: [],
  });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSessionComplete(false);
    setCurrentIndex(0);
    setSessionStats({ reviewed: 0, correct: 0, expEarned: 0, newBadges: [] });
    try {
      const res = await fetch("/api/flashcard/queue");
      if (!res.ok) {
        throw new Error("Failed to fetch flashcard queue");
      }
      const data = await res.json();
      const allCards = [...data.dueCards, ...data.newCards];
      setQueue(allCards);
      setTotalDue(data.totalDue);
      setTotalNew(data.totalNew);

      if (allCards.length === 0) {
        setSessionComplete(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleRate = async (quality: 0 | 2 | 3 | 5) => {
    const currentWord = queue[currentIndex];
    if (!currentWord) return;

    try {
      const res = await fetch("/api/flashcard/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabId: currentWord._id, quality }),
      });

      if (res.ok) {
        const data: ReviewResult = await res.json();

        // Update session stats
        setSessionStats((prev) => ({
          reviewed: prev.reviewed + 1,
          correct: quality >= 3 ? prev.correct + 1 : prev.correct,
          expEarned: prev.expEarned + (data.gamification?.expGained || 0),
          newBadges: [
            ...prev.newBadges,
            ...(data.gamification?.newBadges || []),
          ],
        }));

        // Show EXP toast
        if (data.gamification?.expGained > 0) {
          setExpToast(`+${data.gamification.expGained} EXP`);
          setTimeout(() => setExpToast(null), 1500);
        }

        // Show level up animation
        if (data.gamification?.leveledUp) {
          setLevelUpToast(true);
          setTimeout(() => setLevelUpToast(false), 3000);
        }
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }

    // Advance to next card
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const currentWord = queue[currentIndex];
  const progressPercent =
    queue.length > 0 ? Math.round(((currentIndex) / queue.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Navigation Headers */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {t("flashcard.backToDashboard")}
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {totalDue > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20"
            >
              <Flame className="h-3 w-3 mr-1" />
              {t("flashcard.due", { count: totalDue })}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchQueue}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
          {t("flashcard.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("flashcard.subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      {!sessionComplete && queue.length > 0 && (
        <div className="w-full max-w-md mx-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("flashcard.cardProgress", { index: currentIndex + 1, total: queue.length })}
            </span>
            <span>{t("flashcard.percentComplete", { percent: progressPercent })}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* EXP Toast */}
      {expToast && (
        <div className="fixed top-24 right-6 z-50 animate-bounce">
          <Badge className="bg-emerald-500/90 text-white text-sm px-3 py-1.5 shadow-lg shadow-emerald-500/30 border-none font-bold">
            <Zap className="h-3.5 w-3.5 mr-1" />
            {expToast}
          </Badge>
        </div>
      )}

      {/* Level Up Toast */}
      {levelUpToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2 animate-bounce">
            <div className="text-6xl">🎉</div>
            <div className="text-2xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {t("flashcard.levelUp")}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center min-h-[420px]">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("flashcard.loadingQueue")}
            </p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-rose-500 font-semibold">{error}</p>
            <Button onClick={fetchQueue} size="sm">
              {t("flashcard.tryAgain")}
            </Button>
          </div>
        ) : sessionComplete ? (
          /* Session Complete Summary */
          <Card className="w-full max-w-md glass-card border-none">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-2">
                <div className="text-5xl mb-4">
                  {sessionStats.reviewed === 0 ? "🌟" : "🎊"}
                </div>
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  {sessionStats.reviewed === 0
                    ? t("flashcard.allCaughtUp")
                    : t("flashcard.sessionComplete")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {sessionStats.reviewed === 0
                    ? t("flashcard.noCardsDue")
                    : t("flashcard.greatJob")}
                </p>
              </div>

              {sessionStats.reviewed > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center p-3 rounded-xl bg-muted/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mb-1" />
                    <span className="text-lg font-bold">
                      {sessionStats.reviewed}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      {t("flashcard.reviewed")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-xl bg-muted/20">
                    <Trophy className="h-5 w-5 text-amber-500 mb-1" />
                    <span className="text-lg font-bold">
                      {sessionStats.reviewed > 0
                        ? Math.round(
                            (sessionStats.correct / sessionStats.reviewed) * 100
                          )
                        : 0}
                      %
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      {t("flashcard.accuracy")}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-xl bg-muted/20">
                    <Star className="h-5 w-5 text-violet-500 mb-1" />
                    <span className="text-lg font-bold">
                      +{sessionStats.expEarned}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      {t("common.exp")}
                    </span>
                  </div>
                </div>
              )}

              {/* Show newly earned badges */}
              {sessionStats.newBadges.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    {t("flashcard.newBadges")}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sessionStats.newBadges.map((badge) => (
                      <Badge
                        key={badge.id}
                        className="text-sm px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold"
                      >
                        {badge.icon} {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={fetchQueue}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("flashcard.newSession")}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white border-none">
                    {t("nav.dashboard")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : currentWord ? (
          <Flashcard word={currentWord} onRate={handleRate} />
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("flashcard.noVocab")}
            </p>
            <Button onClick={fetchQueue} size="sm">
              {t("flashcard.reload")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
