"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Brain,
  GraduationCap,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  grammarPoint: string;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    question: "留学生のハチさん＿＿＿＿＿、日本での生活は毎日が新しい発見の連続だ。",
    options: [
      "にとって (Đối với)",
      "にしたがって (Cập nhật / Theo như)",
      "について (Về)",
      "に反して (Trái với)"
    ],
    correctIndex: 0,
    grammarPoint: "にとって"
  },
  {
    id: 2,
    question: "今の実力では、試験に合格できる＿＿＿＿＿。もっと勉強しなければならない。",
    options: [
      "わけがない (Không thể nào)",
      "に違いない (Chắc chắn là)",
      "べきではない (Không nên)",
      "おそれがある (E là / Sợ là)"
    ],
    correctIndex: 0,
    grammarPoint: "わけがない"
  },
  {
    id: 3,
    question: "新しいビジネスを始める＿＿＿＿＿、十分な市場調査を行う必要がある。",
    options: [
      "にあたって (Nhân dịp / Trước khi)",
      "にかけて (Suốt / Đến)",
      "に伴って (Cùng với)",
      "からこそ (Chính vì)"
    ],
    correctIndex: 0,
    grammarPoint: "にあたって"
  },
  {
    id: 4,
    question: "一度決めたことは、どんなに困難＿＿＿＿＿、最後までやり遂げるべきだ。",
    options: [
      "であろうと (Dù cho có là)",
      "にすぎず (Chỉ là)",
      "に応じて (Ứng với)",
      "を契機に (Nhân cơ hội)"
    ],
    correctIndex: 0,
    grammarPoint: "であろうと"
  }
];

interface AIExplanation {
  whyCorrect: string;
  whyWrong: string;
  nuance: string;
}

export default function GrammarQuizPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [explaining, setExplaining] = useState<Record<number, boolean>>({});
  const [explanations, setExplanations] = useState<Record<number, AIExplanation>>({});
  const [expandedAI, setExpandedAI] = useState<Record<number, boolean>>({});

  function handleSelectOption(questionId: number, optionIndex: number) {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleCheckAnswers() {
    setShowResults(true);
  }

  function handleReset() {
    setAnswers({});
    setShowResults(false);
    setExplaining({});
    setExplanations({});
    setExpandedAI({});
  }

  async function handleExplainWithAI(q: Question) {
    const userAnswerIndex = answers[q.id];
    if (userAnswerIndex === undefined) return;

    setExplaining((prev) => ({ ...prev, [q.id]: true }));

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: q.question,
          userAnswer: q.options[userAnswerIndex],
          correctAnswer: q.options[q.correctIndex],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExplanations((prev) => ({ ...prev, [q.id]: data }));
        setExpandedAI((prev) => ({ ...prev, [q.id]: true }));
      } else {
        console.error("Failed to fetch explanation");
      }
    } catch (error) {
      console.error("Error explaining with AI:", error);
    } finally {
      setExplaining((prev) => ({ ...prev, [q.id]: false }));
    }
  }

  const allAnswered = quizQuestions.every((q) => answers[q.id] !== undefined);
  const score = quizQuestions.filter((q) => answers[q.id] === q.correctIndex).length;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-rose-600 dark:from-violet-400 dark:to-rose-400 bg-clip-text text-transparent">
            Grammar AI Quiz
          </h1>
          <p className="text-muted-foreground">
            Test your JLPT N2 grammar and learn from errors using the integrated AI Tutor.
          </p>
        </div>
        {showResults && (
          <Badge
            className={cn(
              "self-start text-sm font-semibold px-4 py-1.5 rounded-full border shadow-sm",
              score === quizQuestions.length
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : score > 0
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            )}
            variant="outline"
          >
            Quiz Result: {score} / {quizQuestions.length} Correct ({Math.round((score / quizQuestions.length) * 100)}%)
          </Badge>
        )}
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {quizQuestions.map((q, index) => {
          const isSelected = answers[q.id] !== undefined;
          const userIndex = answers[q.id];
          const isCorrect = userIndex === q.correctIndex;
          const showAIButton = showResults && !isCorrect;
          const explanation = explanations[q.id];
          const isExpanded = expandedAI[q.id];

          return (
            <Card
              key={q.id}
              className={cn(
                "border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300",
                showResults
                  ? isCorrect
                    ? "hover:border-emerald-500/30"
                    : "hover:border-destructive/30"
                  : "hover:border-primary/30"
              )}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-bold">
                    {index + 1}
                  </span>
                  N2 Grammar Question
                </CardTitle>
                <div className="text-base font-bold text-foreground leading-relaxed pt-1" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {q.question}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Options Grid */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((option, i) => {
                    const isOptSelected = userIndex === i;
                    const isOptCorrect = q.correctIndex === i;

                    let optionStyle = "border-border/50 hover:border-border hover:bg-accent/50";

                    if (showResults) {
                      if (isOptCorrect) {
                        optionStyle =
                          "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium";
                      } else if (isOptSelected && !isOptCorrect) {
                        optionStyle =
                          "border-destructive/50 bg-destructive/10 text-destructive font-medium";
                      } else {
                        optionStyle = "border-border/30 opacity-50";
                      }
                    } else if (isOptSelected) {
                      optionStyle =
                        "border-primary bg-primary/5 ring-1 ring-primary/20 font-medium";
                    }

                    return (
                      <button
                        key={i}
                        disabled={showResults}
                        onClick={() => handleSelectOption(q.id, i)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition-all duration-200",
                          optionStyle
                        )}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
                          {i + 1}
                        </span>
                        <span className="flex-1 leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                          {option}
                        </span>
                        {showResults && isOptCorrect && (
                          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                        )}
                        {showResults && isOptSelected && !isOptCorrect && (
                          <XCircle className="h-4.5 w-4.5 shrink-0 text-destructive" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* AI Tutor Callout & Accordion */}
                {showAIButton && (
                  <div className="pt-2">
                    {!explanation ? (
                      <Button
                        size="sm"
                        onClick={() => handleExplainWithAI(q)}
                        disabled={explaining[q.id]}
                        className="gap-2 font-semibold bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-sm transition-all"
                      >
                        {explaining[q.id] ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Consulting AI Tutor...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            Explain with AI (Giải thích bằng AI)
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 dark:bg-violet-500/10 overflow-hidden shadow-sm shadow-violet-500/5">
                        {/* Accordion Trigger Header */}
                        <button
                          onClick={() =>
                            setExpandedAI((prev) => ({ ...prev, [q.id]: !isExpanded }))
                          }
                          className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-sm text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-rose-500" />
                            AI Explanation Details (Giải thích từ AI Tutor)
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-violet-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-violet-500" />
                          )}
                        </button>

                        {/* Accordion Content Panel */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 space-y-3.5 text-sm leading-relaxed border-t border-violet-500/20 text-foreground/90">
                            {/* Correct Answer Explanation */}
                            <div className="space-y-1">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 uppercase tracking-wide">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Tại sao đáp án này đúng?
                              </span>
                              <p className="pl-5 text-foreground/80">{explanation.whyCorrect}</p>
                            </div>

                            <Separator className="bg-violet-500/15" />

                            {/* Wrong Answer Explanation */}
                            <div className="space-y-1">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-destructive uppercase tracking-wide">
                                <XCircle className="h-3.5 w-3.5" />
                                Tại sao đáp án của bạn chưa đúng?
                              </span>
                              <p className="pl-5 text-foreground/80">{explanation.whyWrong}</p>
                            </div>

                            <Separator className="bg-violet-500/15" />

                            {/* Nuance & Details */}
                            <div className="space-y-1">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-violet-500 uppercase tracking-wide">
                                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                Chi tiết sắc thái & Cấu trúc ngữ pháp N2
                              </span>
                              <div className="pl-5 bg-violet-500/5 dark:bg-black/20 p-3 rounded-lg border border-violet-500/10">
                                <p className="text-foreground/80 font-medium text-xs leading-5">
                                  {explanation.nuance}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-center py-4">
        {!showResults ? (
          <Button
            size="lg"
            className="w-full sm:w-64 gap-2 font-bold shadow-md"
            disabled={!allAnswered}
            onClick={handleCheckAnswers}
          >
            <CheckCircle2 className="h-5 w-5" />
            Check Answers & Score
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-64 gap-2 font-bold border-border/80"
            onClick={handleReset}
          >
            <RotateCcw className="h-5 w-5" />
            Try Another Quiz
          </Button>
        )}
      </div>
    </div>
  );
}
