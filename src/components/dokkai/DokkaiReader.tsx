"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
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
  ChevronRight,
  BookOpen,
} from "lucide-react";

// Mock N2-level reading passage
const readingPassage = {
  title: "テレワークの影響",
  titleEn: "The Impact of Remote Work",
  level: "N2",
  paragraphs: [
    {
      id: 1,
      japanese:
        "近年、テレワークを導入する企業が増えている。特に2020年以降、多くの会社が在宅勤務を認めるようになった。通勤時間がなくなることで、社員は自分の時間を有効に使えるようになったと言われている。",
      note: "テレワーク = telework/remote work; 導入する = to introduce; 在宅勤務 = working from home",
    },
    {
      id: 2,
      japanese:
        "しかし、テレワークには課題もある。まず、同僚とのコミュニケーションが難しくなるという問題がある。オフィスで働いていれば、気軽に相談できるが、テレワークではそうはいかない。また、仕事とプライベートの境界が曖昧になり、働きすぎてしまう人も少なくない。",
      note: "課題 = challenge; 同僚 = colleague; 境界 = boundary; 曖昧 = ambiguous",
    },
    {
      id: 3,
      japanese:
        "一方で、テレワークのおかげで地方に移住する人が増えたという報告もある。都市部の高い家賃を避け、自然豊かな環境で生活しながら仕事を続けることが可能になったのだ。企業にとっても、オフィスの維持費を削減できるというメリットがある。",
      note: "移住する = to relocate; 都市部 = urban area; 維持費 = maintenance costs; 削減 = reduction",
    },
    {
      id: 4,
      japanese:
        "今後、テレワークと出社を組み合わせたハイブリッド型の働き方がさらに広まると予想される。大切なのは、それぞれの働き方の長所と短所を理解し、柔軟に対応していくことだろう。",
      note: "出社 = going to the office; ハイブリッド型 = hybrid-style; 柔軟 = flexible",
    },
  ],
};

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: "テレワークが増えた主な理由として、本文で述べられているのは何か。",
    options: [
      "社員が会社に不満を持っていたから",
      "2020年以降、多くの企業が在宅勤務を認めるようになったから",
      "通勤が法律で禁止されたから",
      "テレワークの方が給料が高いから",
    ],
    correctIndex: 1,
    explanation:
      "第1段落で「特に2020年以降、多くの会社が在宅勤務を認めるようになった」と述べられています。",
  },
  {
    id: 2,
    question: "テレワークの課題として本文で述べられていないものはどれか。",
    options: [
      "コミュニケーションが取りにくい",
      "仕事とプライベートの区別がつきにくい",
      "インターネットの速度が遅い",
      "働きすぎてしまうことがある",
    ],
    correctIndex: 2,
    explanation:
      "インターネットの速度については本文中で言及されていません。本文では「コミュニケーション」「仕事とプライベートの境界」「働きすぎ」が課題として挙げられています。",
  },
  {
    id: 3,
    question: "筆者は今後の働き方についてどのように考えているか。",
    options: [
      "全員がテレワークをするべきだ",
      "テレワークは廃止されるだろう",
      "ハイブリッド型の働き方が広まり、柔軟な対応が大切だ",
      "出社だけの働き方に戻るべきだ",
    ],
    correctIndex: 2,
    explanation:
      "第4段落で「ハイブリッド型の働き方がさらに広まると予想される」「柔軟に対応していくことだろう」と述べられています。",
  },
];

export default function DokkaiReader() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  function handleSelectAnswer(questionId: number, optionIndex: number) {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleCheckAnswers() {
    setShowResults(true);
  }

  function handleReset() {
    setAnswers({});
    setShowResults(false);
  }

  const totalCorrect = showResults
    ? questions.filter((q) => answers[q.id] === q.correctIndex).length
    : 0;

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="min-h-[calc(100vh-4rem)] rounded-lg border border-border/50"
      id="dokkai-panel-group"
    >
      {/* Left Panel: Reading Passage */}
      <ResizablePanel defaultSize={55} minSize={30} id="reading-panel">
        <div className="flex h-full flex-col">
          {/* Passage Header */}
          <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-6 py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-lg font-semibold">
                  {readingPassage.title}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {readingPassage.titleEn}
              </p>
            </div>
            <Badge variant="secondary" className="text-sm font-medium">
              {readingPassage.level}
            </Badge>
          </div>

          {/* Passage Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-2xl space-y-6">
              {readingPassage.paragraphs.map((para) => (
                <div key={para.id} className="group space-y-2">
                  <div className="flex gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {para.id}
                    </span>
                    <p className="text-base leading-8 tracking-wide" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                      {para.japanese}
                    </p>
                  </div>
                  {/* Vocabulary notes (subtle, expandable feel) */}
                  <div className="ml-9 rounded-md bg-accent/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed opacity-80 transition-opacity group-hover:opacity-100">
                    📝 {para.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResizablePanel>

      {/* Resize Handle */}
      <ResizableHandle withHandle className="bg-border/30" />

      {/* Right Panel: Questions */}
      <ResizablePanel defaultSize={45} minSize={30} id="questions-panel">
        <div className="flex h-full flex-col">
          {/* Questions Header */}
          <div className="flex items-center justify-between border-b border-border/50 bg-card/50 px-6 py-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Comprehension Questions</h2>
              <p className="text-sm text-muted-foreground">
                {questions.length} questions
              </p>
            </div>
            {showResults && (
              <Badge
                variant="secondary"
                className={`text-sm font-semibold ${
                  totalCorrect === questions.length
                    ? "bg-green-500/10 text-green-500"
                    : totalCorrect > 0
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {totalCorrect} / {questions.length} correct
              </Badge>
            )}
          </div>

          {/* Questions Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <Card
                  key={q.id}
                  className="border-border/50 bg-card/60 backdrop-blur-sm"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">
                        {qIndex + 1}
                      </span>
                      問題 {qIndex + 1}
                    </CardTitle>
                    <CardDescription className="text-sm font-medium text-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                      {q.question}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {q.options.map((option, i) => {
                      const isSelected = answers[q.id] === i;
                      const isCorrect = q.correctIndex === i;

                      let optionStyle = "border-border/50 hover:border-border hover:bg-accent/50";

                      if (showResults) {
                        if (isCorrect) {
                          optionStyle =
                            "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400";
                        } else if (isSelected && !isCorrect) {
                          optionStyle =
                            "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400";
                        } else {
                          optionStyle = "border-border/30 opacity-50";
                        }
                      } else if (isSelected) {
                        optionStyle =
                          "border-primary bg-primary/5 ring-1 ring-primary/20";
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleSelectAnswer(q.id, i)}
                          disabled={showResults}
                          className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all ${optionStyle}`}
                          id={`q${q.id}-option-${i}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                            {option}
                          </span>
                          {showResults && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          )}
                          {showResults && isSelected && !isCorrect && (
                            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                          )}
                        </button>
                      );
                    })}

                    {/* Explanation (shown after checking) */}
                    {showResults && (
                      <div className="mt-3 rounded-lg bg-accent/50 p-3 text-sm">
                        <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Explanation
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-border/50 bg-card/50 px-6 py-4">
            <div className="flex items-center gap-3">
              {!showResults ? (
                <Button
                  className="flex-1 gap-2 font-medium"
                  disabled={!allAnswered}
                  onClick={handleCheckAnswers}
                  id="check-answers-btn"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Check Answers
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 font-medium"
                  onClick={handleReset}
                  id="retry-btn"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
            </div>
            {!allAnswered && !showResults && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Answer all questions to check your results
              </p>
            )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
