"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Trophy, BookOpen, Star, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapProps {
  targetLevel: "N5" | "N4" | "N3" | "N2" | "N1" | string;
}

interface Milestone {
  title: string;
  description: string;
  isCompleted: boolean;
}

const levelMilestones: Record<string, Milestone[]> = {
  N5: [
    { title: "Hiragana & Katakana Mastery", description: "Learn basic scripts and pronunciation", isCompleted: true },
    { title: "Essential Kanji: 100 characters", description: "Master numbers, directions, and primary kanji", isCompleted: false },
    { title: "Basic Vocabulary: 800 words", description: "Practice greeting items and school objects", isCompleted: false },
    { title: "Grammar Stage 1", description: "Master simple structures like 'X wa Y desu'", isCompleted: false },
    { title: "N5 Practice Mock Test", description: "Achieve a passing score on the mini N5 practice exam", isCompleted: false }
  ],
  N4: [
    { title: "Kanji Milestone: 300 characters", description: "Read simple verbs, daily nouns, and basic adjectives", isCompleted: true },
    { title: "Vocabulary Booster: 1500 words", description: "Increase vocabulary list for conversation", isCompleted: false },
    { title: "Polite & Casual Speech Patterns", description: "Differentiate conversation register states", isCompleted: false },
    { title: "N4 Short Dokkai Passages", description: "Understand simple announcements and short emails", isCompleted: false },
    { title: "N4 Practice Mock Test", description: "Complete a full N4 reading/listening mock exam", isCompleted: false }
  ],
  N3: [
    { title: "Intermediate Kanji: 650 characters", description: "Master kanji compounds and on-yomi variations", isCompleted: false },
    { title: "Vocabulary Booster: 3700 words", description: "Study newspaper terminology and abstract words", isCompleted: false },
    { title: "NHK News Easy Practice", description: "Understand news simplified for foreigners", isCompleted: false },
    { title: "Intermediate Grammar Patterns", description: "Study structures like 'V-te tamaranai'", isCompleted: false },
    { title: "N3 Full Mock Test", description: "Exceed passing threshold on standard N3 quiz", isCompleted: false }
  ],
  N2: [
    { title: "Upper Intermediate Kanji: 1000 characters", description: "Read complex kanji combinations without furigana", isCompleted: false },
    { title: "Advanced Vocabulary: 6000 words", description: "Learn formal business expressions and compound verbs", isCompleted: false },
    { title: "Grammar Booster: 25 grammar points", description: "Understand structures like 'V-te koso' and 'N ni atatte'", isCompleted: false },
    { title: "Real-world Newspaper Practice", description: "Read editorial blogs and columns on Yahoo News", isCompleted: false },
    { title: "N2 Comprehensive Examination", description: "Pass full mock examination under 105-minute limit", isCompleted: false }
  ],
  N1: [
    { title: "Advanced Kanji: 2000+ characters", description: "Identify academic terminology and literary characters", isCompleted: false },
    { title: "Lexicon Expansion: 10000+ words", description: "Master advanced metaphors, idiomatic expressions, and nuances", isCompleted: false },
    { title: "Academic & Editorial Reading", description: "Synthesize long texts on economics and philosophy", isCompleted: false },
    { title: "Nuanced Grammar Patterns", description: "Master 40+ complex structures like 'V-zaru wo enai'", isCompleted: false },
    { title: "N1 Ultimate Evaluation", description: "Complete advanced evaluation and analysis tests", isCompleted: false }
  ]
};

export default function Roadmap({ targetLevel }: RoadmapProps) {
  const level = targetLevel || "N2";
  const milestones = levelMilestones[level] || levelMilestones["N2"];

  return (
    <Card className="glass-card border-none flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Your Personalized {level} Roadmap
          </CardTitle>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <CardDescription>Step-by-step milestones to clear your JLPT {level} exam</CardDescription>
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
                      Next Step
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
