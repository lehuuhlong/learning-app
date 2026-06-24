"use client";

import { useState, useEffect, useRef } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Clock,
  BookOpen,
  HelpCircle,
  Loader2,
  Brain,
  Lightbulb,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerId: number;
}

interface DokkaiPassage {
  title: string;
  passage: string;
  questions: Question[];
}

interface AIExplanation {
  whyCorrect: string;
  whyWrong: string;
  nuance: string;
}

export default function DokkaiReader() {
  const [targetLevel, setTargetLevel] = useState<string>("N2");
  const [passageData, setPassageData] = useState<DokkaiPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15:00
  const [timerActive, setTimerActive] = useState(false);
  
  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Tutor explanations
  const [explaining, setExplaining] = useState<Record<number, boolean>>({});
  const [explanations, setExplanations] = useState<Record<number, AIExplanation>>({});
  const [expandedAI, setExpandedAI] = useState<Record<number, boolean>>({});

  // 1. Fetch user level and then load dynamic news
  useEffect(() => {
    async function loadDokkai() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile to get user's targetLevel
        const profileRes = await fetch("/api/user/profile");
        let level = "N2";
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          level = profileData.targetLevel || "N2";
          setTargetLevel(level);
        }

        // Fetch news article based on level
        const newsRes = await fetch(`/api/dokkai/news?level=${level}`);
        if (!newsRes.ok) throw new Error("Không thể tải tin tức Dokkai");
        const newsData = await newsRes.json();
        
        setPassageData(newsData);
        setTimeLeft(900);
        setTimerActive(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    }
    loadDokkai();
  }, []);

  // 2. Timer countdown effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleAutoSubmit();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleAutoSubmit = () => {
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);
    logActivity(0); // auto-submit score
  };

  const handleSubmit = async () => {
    if (!passageData) return;
    setShowResults(true);
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    const correctCount = passageData.questions.filter(
      (q) => answers[q.id] === q.correctAnswerId
    ).length;

    await logActivity(correctCount);
  };

  // Submit to learning history
  const logActivity = async (score: number) => {
    if (!passageData) return;
    try {
      const timeSpent = Math.ceil((900 - timeLeft) / 60); // minutes spent
      await fetch("/api/user/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityType: "dokkai",
          score,
          total: passageData.questions.length,
          timeSpent: timeSpent > 0 ? timeSpent : 1
        })
      });
    } catch (err) {
      console.error("Failed to log activity progress:", err);
    }
  };

  const handleReset = async () => {
    setAnswers({});
    setShowResults(false);
    setExplaining({});
    setExplanations({});
    setExpandedAI({});
    
    // Reload news
    try {
      setLoading(true);
      const newsRes = await fetch(`/api/dokkai/news?level=${targetLevel}`);
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setPassageData(newsData);
        setTimeLeft(900);
        setTimerActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExplainWithAI = async (q: Question) => {
    const userAnswerIndex = answers[q.id];
    if (userAnswerIndex === undefined) return;

    setExplaining((prev) => ({ ...prev, [q.id]: true }));

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.text,
          userAnswer: q.options[userAnswerIndex],
          correctAnswer: q.options[q.correctAnswerId],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExplanations((prev) => ({ ...prev, [q.id]: data }));
        setExpandedAI((prev) => ({ ...prev, [q.id]: true }));
      }
    } catch (error) {
      console.error("Error explaining with AI:", error);
    } finally {
      setExplaining((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Tải tin tức & soạn câu hỏi JLPT {targetLevel}...</p>
        </div>
      </div>
    );
  }

  if (error || !passageData) {
    return (
      <div className="flex h-full items-center justify-center bg-background text-center p-6">
        <div className="space-y-4 max-w-md">
          <XCircle className="h-12 w-12 text-destructive mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Không thể tải bài đọc Dokkai</h3>
          <p className="text-sm text-muted-foreground">{error || "Vui lòng kiểm tra lại kết nối mạng."}</p>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const allAnswered = passageData.questions.every((q) => answers[q.id] !== undefined);
  const correctCount = passageData.questions.filter(
    (q) => answers[q.id] === q.correctAnswerId
  ).length;

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Background blur blobs */}
      <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />

      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1 rounded-none border-t border-border/40 z-10"
        id="dokkai-resizable-root"
      >
        {/* LEFT PANEL: Reading Passage (55%) */}
        <ResizablePanel defaultSize={55} minSize={35} id="dokkai-passage-panel">
          <div className="h-full flex flex-col bg-card/10 backdrop-blur-md border-r border-border/40">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-black/10 dark:bg-black/20">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Báo chí Nhật Bản hôm nay
                </h2>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold px-3 py-1 text-xs">
                Dokkai {targetLevel}
              </Badge>
            </div>

            {/* Passage Scrolling Content */}
            <ScrollArea className="flex-1 px-8 py-6">
              <div className="mx-auto max-w-3xl space-y-6">
                <h1 className="text-xl font-extrabold text-foreground tracking-wide leading-relaxed border-b border-border/10 pb-4" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {passageData.title}
                </h1>
                
                {/* Passage content formatted with paragraphs and line breaks */}
                <div className="space-y-5 text-foreground/90 leading-loose text-[16px] tracking-wide antialiased">
                  {passageData.passage.split("\n\n").map((para, i) => (
                    <p 
                      key={i} 
                      className="indent-4 text-justify font-normal"
                      style={{ 
                        fontFamily: "'Noto Sans JP', 'Hiragino Kaku Gothic Pro', sans-serif" 
                      }}
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        {/* Resizable drag handler */}
        <ResizableHandle withHandle className="bg-border/30 w-1.5 hover:bg-primary/50 transition-colors" />

        {/* RIGHT PANEL: Questions & Timer (45%) */}
        <ResizablePanel defaultSize={45} minSize={30} id="dokkai-questions-panel">
          <div className="h-full flex flex-col bg-card/20 backdrop-blur-md">
            {/* Sticky Header with Timer */}
            <div className="flex items-center justify-between border-b border-border/20 px-6 py-4 bg-black/10 dark:bg-black/20 sticky top-0 z-10">
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-sm sm:text-base">Câu hỏi đọc hiểu</h3>
                <p className="text-xs text-muted-foreground">Chọn một đáp án đúng nhất cho mỗi câu</p>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 shadow-md">
                <Clock className={cn("h-4 w-4", timeLeft < 120 ? "text-rose-500 animate-pulse" : "text-amber-500")} />
                <span className={cn("text-xs font-bold font-mono tracking-wider", timeLeft < 120 ? "text-rose-500" : "text-foreground")}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            {/* Scrollable Questions list */}
            <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-6 pb-24">
                {passageData.questions.map((q, qIndex) => {
                  const userAnswer = answers[q.id];
                  const isSubmitted = showResults;
                  const isUserCorrect = userAnswer === q.correctAnswerId;

                  return (
                    <Card
                      key={q.id}
                      className={cn(
                        "border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300",
                        isSubmitted
                          ? isUserCorrect
                            ? "border-emerald-500/30 shadow-md shadow-emerald-500/5 bg-emerald-500/5"
                            : "border-rose-500/30 shadow-md shadow-rose-500/5 bg-rose-500/5"
                          : "hover:border-primary/20"
                      )}
                    >
                      <CardHeader className="pb-3 pt-4">
                        <CardTitle className="text-xs font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                          <span className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-bold">
                            {qIndex + 1}
                          </span>
                          Câu {qIndex + 1} / {passageData.questions.length}
                        </CardTitle>
                        <div 
                          className="text-[15px] font-bold text-foreground leading-relaxed pt-1" 
                          style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                        >
                          {q.text}
                        </div>
                      </CardHeader>

                      <CardContent className="pb-4 space-y-4">
                        {/* Option Radio Group */}
                        <RadioGroup
                          value={userAnswer !== undefined ? String(userAnswer) : ""}
                          onValueChange={(val) => handleSelectOption(q.id, parseInt(val))}
                          disabled={isSubmitted}
                          className="space-y-2"
                        >
                          {q.options.map((option, oIndex) => {
                            const isSelected = userAnswer === oIndex;
                            const isCorrect = q.correctAnswerId === oIndex;

                            let optionStyle = "border-border/40 hover:border-border/80 hover:bg-white/5";

                            if (isSubmitted) {
                              if (isCorrect) {
                                optionStyle = "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium";
                              } else if (isSelected && !isCorrect) {
                                optionStyle = "border-rose-500/50 bg-rose-500/10 text-rose-500 font-medium";
                              } else {
                                optionStyle = "border-border/20 opacity-40";
                              }
                            } else if (isSelected) {
                              optionStyle = "border-primary bg-primary/5 ring-1 ring-primary/20 font-medium";
                            }

                            return (
                              <div
                                key={oIndex}
                                className={cn(
                                  "flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 cursor-pointer",
                                  optionStyle
                                )}
                                onClick={() => !isSubmitted && handleSelectOption(q.id, oIndex)}
                              >
                                <RadioGroupItem
                                  value={String(oIndex)}
                                  id={`q${q.id}-opt${oIndex}`}
                                  className="mt-0.5 shrink-0"
                                />
                                <Label
                                  htmlFor={`q${q.id}-opt${oIndex}`}
                                  className="text-sm leading-relaxed cursor-pointer font-normal flex-1"
                                  style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
                                >
                                  {option}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>

                        {/* Explain with AI Tutor Callout */}
                        {isSubmitted && (
                          <div className="pt-2">
                            {!explanations[q.id] ? (
                              <Button
                                size="sm"
                                onClick={() => handleExplainWithAI(q)}
                                disabled={explaining[q.id]}
                                className="w-full gap-2 font-semibold bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-sm transition-all rounded-lg"
                              >
                                {explaining[q.id] ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Đang kết nối AI Tutor...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Giải thích bằng AI (AI Explanation)
                                  </>
                                )}
                              </Button>
                            ) : (
                              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 dark:bg-violet-500/10 overflow-hidden shadow-sm shadow-violet-500/5">
                                {/* Accordion Header */}
                                <button
                                  onClick={() =>
                                    setExpandedAI((prev) => ({ ...prev, [q.id]: !expandedAI[q.id] }))
                                  }
                                  className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-xs text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                >
                                  <span className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-rose-500" />
                                    Chi tiết giải thích từ AI
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    {expandedAI[q.id] ? "Thu gọn" : "Mở rộng"}
                                  </span>
                                </button>

                                {/* Accordion Content Panel */}
                                {expandedAI[q.id] && (
                                  <div className="px-4 pb-4 pt-1 space-y-3.5 text-xs leading-relaxed border-t border-violet-500/20 text-foreground/90">
                                    <div className="space-y-1">
                                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 uppercase tracking-wide">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Tại sao đáp án này đúng?
                                      </span>
                                      <p className="pl-4 text-foreground/80">{explanations[q.id].whyCorrect}</p>
                                    </div>

                                    <Separator className="bg-violet-500/10" />

                                    <div className="space-y-1">
                                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 uppercase tracking-wide">
                                        <XCircle className="h-3 w-3" />
                                        Tại sao đáp án khác chưa đúng?
                                      </span>
                                      <p className="pl-4 text-foreground/80">{explanations[q.id].whyWrong}</p>
                                    </div>

                                    <Separator className="bg-violet-500/10" />

                                    <div className="space-y-1">
                                      <span className="flex items-center gap-1 text-[11px] font-bold text-violet-500 uppercase tracking-wide">
                                        <Lightbulb className="h-3 w-3 text-amber-500" />
                                        Sắc thái ngữ pháp & từ vựng
                                      </span>
                                      <p className="pl-4 text-foreground/80 italic">{explanations[q.id].nuance}</p>
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
            </ScrollArea>

            {/* Bottom Footer Actions (Submit/Retry) */}
            <div className="border-t border-border/20 bg-black/10 dark:bg-black/20 p-4 sticky bottom-0 z-10 backdrop-blur-md">
              <div className="flex flex-col gap-2">
                {!showResults ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="w-full gap-2 font-bold shadow-md bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl py-5"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Nộp bài (Submit Answers)
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 gap-2 font-bold border-border/80 rounded-xl"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Làm bài mới
                    </Button>
                    <Link href="/dashboard" className="flex-1">
                      <Button className="w-full font-bold bg-primary text-white rounded-xl">
                        Về Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
                {!allAnswered && !showResults && (
                  <p className="text-center text-[10px] text-muted-foreground">
                    Trả lời tất cả các câu hỏi để mở khóa tính năng nộp bài.
                  </p>
                )}
                {showResults && (
                  <p className="text-center text-xs font-semibold text-foreground">
                    Kết quả của bạn: <span className={cn(correctCount === passageData.questions.length ? "text-emerald-500" : "text-amber-500")}>{correctCount} / {passageData.questions.length} câu đúng</span> (
                    {Math.round((correctCount / passageData.questions.length) * 100)}%)
                  </p>
                )}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
