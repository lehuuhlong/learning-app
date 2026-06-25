"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { predictIntervals } from "@/lib/srs";
import { useLanguage } from "@/components/providers/LanguageProvider";

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

interface FlashcardProps {
  word: VocabularyItem;
  onRate: (quality: 0 | 2 | 3 | 5) => void;
}

export default function Flashcard({ word, onRate }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { t } = useLanguage();

  const ratingButtons = [
    {
      quality: 0 as const,
      label: t("vocab.sm2.again"),
      sublabel: t("vocab.sm2.againSub"),
      className:
        "border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50",
      icon: "🔴",
      keyName: "again",
    },
    {
      quality: 2 as const,
      label: t("vocab.sm2.hard"),
      sublabel: t("vocab.sm2.hardSub"),
      className:
        "border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/50",
      icon: "🟠",
      keyName: "hard",
    },
    {
      quality: 3 as const,
      label: t("vocab.sm2.good"),
      sublabel: t("vocab.sm2.goodSub"),
      className:
        "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-lg",
      icon: "🟢",
      keyName: "good",
    },
    {
      quality: 5 as const,
      label: t("vocab.sm2.easy"),
      sublabel: t("vocab.sm2.easySub"),
      className:
        "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-none shadow-lg",
      icon: "🔵",
      keyName: "easy",
    },
  ];

  // Get predicted intervals for button hints
  const srs = word.srs || { easeFactor: 2.5, interval: 0, repetitions: 0 };
  const intervals = predictIntervals(
    srs.repetitions,
    srs.easeFactor,
    srs.interval
  );

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flipping when clicking speak button
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any active speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85; // Slightly slower for clear learning pronunciation
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (quality: 0 | 2 | 3 | 5) => {
    setIsFlipped(false);
    setTimeout(() => onRate(quality), 250);
  };

  const intervalMap: Record<string, string> = {
    again: intervals.again,
    hard: intervals.hard,
    good: intervals.good,
    easy: intervals.easy,
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6">
      {/* SRS Status Badge */}
      {word.srs && (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5",
              word.srs.isReview
                ? "border-amber-500/30 text-amber-500 bg-amber-500/5"
                : "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
            )}
          >
            {word.srs.isReview ? `📖 ${t("vocab.reviewBadge")}` : `✨ ${t("vocab.newWordBadge")}`}
          </Badge>
        </div>
      )}

      {/* 3D Card Container */}
      <div
        className="w-full h-80 cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <div
          className={cn(
            "relative w-full h-full duration-500 preserve-3d transition-transform ease-in-out",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Card Front */}
          <Card className="absolute inset-0 flex flex-col items-center justify-center p-6 border border-white/10 bg-white/5 dark:bg-black/40 backdrop-blur-md shadow-2xl backface-hidden rounded-2xl hover:border-primary/45 transition-all duration-300">
            {/* Level Badge */}
            <Badge
              variant="secondary"
              className="absolute top-4 right-4 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              {word.level}
            </Badge>

            {/* TTS Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={speak}
              className="absolute top-4 left-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200"
            >
              <Volume2 className="h-4 w-4" />
            </Button>

            {/* Kanji / Word */}
            <p className="text-5xl font-extrabold tracking-wide text-center bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent mb-4">
              {word.word}
            </p>

            {/* Hint */}
            <p className="absolute bottom-6 text-xs text-muted-foreground/60 bg-white/5 dark:bg-white/5 border border-white/10 px-3 py-1 rounded-full animate-pulse">
              {t("vocab.clickToReveal")}
            </p>
          </Card>

          {/* Card Back */}
          <Card className="absolute inset-0 flex flex-col p-6 border border-white/10 bg-white/5 dark:bg-black/40 backdrop-blur-md shadow-2xl backface-hidden rotate-y-180 rounded-2xl hover:border-primary/45 transition-all duration-300">
            {/* Level Badge */}
            <Badge
              variant="secondary"
              className="absolute top-4 right-4 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              {word.level}
            </Badge>

            {/* TTS Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={speak}
              className="absolute top-4 left-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200"
            >
              <Volume2 className="h-4 w-4" />
            </Button>

            {/* Back Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              {/* Reading (Kana) */}
              <p className="text-3xl font-bold text-violet-500 dark:text-violet-400">
                {word.reading}
              </p>

              {/* Meaning */}
              <p className="text-xl font-medium text-center text-foreground max-w-xs leading-relaxed">
                {word.meaning}
              </p>

              {/* Part of Speech Tags */}
              {word.part_of_speech && word.part_of_speech.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {word.part_of_speech.map((pos) => (
                    <Badge
                      key={pos}
                      variant="outline"
                      className="text-[10px] bg-white/5 border-white/10 text-muted-foreground"
                    >
                      {pos}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Flip hint */}
            <div className="flex items-center justify-center mt-auto">
              <Button
                variant="link"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="text-xs text-muted-foreground/60 hover:text-primary gap-1"
              >
                <RotateCcw className="h-3 w-3" /> {t("vocab.flipBack")}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* SM-2 Rating Buttons */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {ratingButtons.map((btn) => (
          <Button
            key={btn.quality}
            variant="outline"
            size="sm"
            onClick={() => handleRate(btn.quality)}
            className={cn(
              "flex flex-col items-center gap-0.5 h-auto py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.03]",
              btn.className
            )}
          >
            <span className="text-xs font-bold">{btn.label}</span>
            <span className="text-[10px] opacity-70">{btn.sublabel}</span>
            <span className="text-[9px] opacity-50 mt-0.5">
              {intervalMap[btn.keyName]}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
