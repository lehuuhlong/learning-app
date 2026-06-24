"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCcw, Volume2, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VocabularyItem {
  _id: string;
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string[];
  level: string;
}

interface FlashcardProps {
  word: VocabularyItem;
  onAction: (status: "learned" | "review") => void;
}

export default function Flashcard({ word, onAction }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

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

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-6">
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
          <Card 
            className="absolute inset-0 flex flex-col items-center justify-center p-6 border border-white/10 bg-white/5 dark:bg-black/40 backdrop-blur-md shadow-2xl backface-hidden rounded-2xl hover:border-primary/45 transition-all duration-300"
          >
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
              Click card to reveal translation
            </p>
          </Card>

          {/* Card Back */}
          <Card 
            className="absolute inset-0 flex flex-col p-6 border border-white/10 bg-white/5 dark:bg-black/40 backdrop-blur-md shadow-2xl backface-hidden rotate-y-180 rounded-2xl hover:border-primary/45 transition-all duration-300"
          >
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
                    <Badge key={pos} variant="outline" className="text-[10px] bg-white/5 border-white/10 text-muted-foreground">
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
                <RotateCcw className="h-3 w-3" /> Flip back
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 w-full justify-center">
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            setIsFlipped(false);
            setTimeout(() => onAction("review"), 250);
          }}
          className="flex-1 gap-2 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 max-w-[180px] font-semibold rounded-xl transition-all hover:scale-[1.02]"
        >
          <HelpCircle className="h-4.5 w-4.5" />
          Need Review
        </Button>
        <Button
          size="lg"
          onClick={() => {
            setIsFlipped(false);
            setTimeout(() => onAction("learned"), 250);
          }}
          className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none shadow-lg max-w-[180px] font-semibold rounded-xl transition-all hover:scale-[1.02]"
        >
          <CheckCircle2 className="h-4.5 w-4.5" />
          Learned
        </Button>
      </div>
    </div>
  );
}
