"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCcw, Volume2 } from "lucide-react";

interface VocabularyItem {
  _id: string;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  jlptLevel: string;
  exampleSentence: string;
  exampleMeaning: string;
  tags: string[];
}

interface FlashCardProps {
  word: VocabularyItem;
  isLearned?: boolean;
  onMarkLearned?: (id: string) => void;
}

export default function FlashCard({
  word,
  isLearned = false,
  onMarkLearned,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000"
      style={{ perspective: "1000px" }}
    >
      <div
        className={`relative h-72 w-full cursor-pointer transition-transform duration-500 ease-in-out`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front */}
        <Card
          className="absolute inset-0 flex flex-col items-center justify-center border-border/50 bg-card/90 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-primary/45 group-hover:shadow-lg group-hover:shadow-primary/10"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* JLPT Level Badge */}
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
          >
            {word.jlptLevel}
          </Badge>

          {isLearned && (
            <div className="absolute top-3 left-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          )}

          {/* Kanji */}
          <p className="text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
            {word.kanji}
          </p>

          {/* Hiragana */}
          <p className="text-xl text-muted-foreground font-semibold">
            {word.hiragana}
          </p>

          {/* Hint */}
          <p className="absolute bottom-4 text-xs font-medium text-violet-500/60 dark:text-violet-400/60 bg-violet-500/5 dark:bg-violet-400/5 px-2.5 py-1 rounded-full border border-violet-500/10">
            Click to reveal meaning
          </p>
        </Card>

        {/* Back */}
        <Card
          className="absolute inset-0 flex flex-col border-border/50 bg-card/90 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-primary/45 group-hover:shadow-lg group-hover:shadow-primary/10"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
          >
            {word.jlptLevel}
          </Badge>

          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            {/* Romaji */}
            <p className="text-sm text-primary font-bold uppercase tracking-wider">
              {word.romaji}
            </p>

            {/* Meaning */}
            <p className="text-2xl font-bold text-center bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">{word.meaning}</p>

            {/* Example */}
            {word.exampleSentence && (
              <div className="mt-2 w-full rounded-lg bg-accent/50 p-3 space-y-1">
                <p className="text-sm font-medium text-center leading-relaxed">
                  {word.exampleSentence}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  {word.exampleMeaning}
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-2">
            {word.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <RotateCcw className="h-3 w-3" />
              Flip back
            </Button>
            {!isLearned && onMarkLearned && (
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkLearned(word._id);
                }}
              >
                <CheckCircle2 className="h-3 w-3" />
                Mark learned
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
