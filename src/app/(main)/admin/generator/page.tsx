"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Database,
  BookOpen,
  GraduationCap,
  Sparkle,
  ArrowRight,
  Info,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const levels = ["N5", "N4", "N3", "N2", "N1"];

export default function AdminGeneratorPage() {
  const { data: session, status } = useSession();
  const [type, setType] = useState<"vocab" | "grammar">("vocab");
  const [level, setLevel] = useState<string>("N2");
  const [count, setCount] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setGeneratedItems([]);
    
    try {
      const response = await fetch("/api/admin/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, level, count }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedItems(data.items || []);
        toast.success(`Đã tạo và lưu thành công ${data.count} mục vào Database!`);
      } else {
        throw new Error(data.error || "Không thể tạo nội dung");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Đã xảy ra lỗi trong quá trình kết nối API");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Đang kiểm tra quyền Admin...</p>
        </div>
      </div>
    );
  }

  // Simple authentication safeguard (only logged-in users can access)
  if (status === "unauthenticated" || !session) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Info className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Truy cập bị từ chối</h2>
        <p className="text-sm text-muted-foreground">
          Bạn cần đăng nhập bằng tài khoản quản trị để truy cập trang này.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Decorative blurred gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="space-y-2 z-10 relative">
        <div className="inline-flex h-9 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <Database className="h-3.5 w-3.5" />
          <span>Admin Controls & Databases</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent sm:text-4xl">
          Generative AI Content Generator
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Sử dụng sức mạnh của mô hình **Google Gemini 2.5 Flash** để tự động soạn thảo từ vựng và ngữ pháp tiếng Nhật chuẩn JLPT, sau đó lưu trực tiếp vào cơ sở dữ liệu MongoDB.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 z-10 relative">
        {/* Left Side: Parameters Configuration Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                Cấu hình sinh nội dung
              </CardTitle>
              <CardDescription>Chọn định dạng và khối lượng kiến thức cần soạn thảo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* 1. Content Type Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Loại dữ liệu (Content Type)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setType("vocab")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm cursor-pointer transition-all duration-200",
                        type === "vocab"
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/20"
                          : "border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      <BookOpen className="h-4.5 w-4.5" />
                      Từ vựng (Vocab)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("grammar")}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-sm cursor-pointer transition-all duration-200",
                        type === "grammar"
                          ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/20"
                          : "border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border"
                      )}
                    >
                      <GraduationCap className="h-4.5 w-4.5" />
                      Ngữ pháp (Grammar)
                    </button>
                  </div>
                </div>

                {/* 2. JLPT Level Selector */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Cấp độ thi (JLPT Level)</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {levels.map((lvl) => {
                      const isActive = level === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setLevel(lvl)}
                          className={cn(
                            "flex items-center justify-center py-2.5 rounded-xl border font-bold text-sm cursor-pointer transition-all duration-200",
                            isActive
                              ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/20"
                              : "border-border/40 bg-card/40 text-muted-foreground hover:text-foreground hover:border-border"
                          )}
                        >
                          {lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Record Count Input */}
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-sm font-semibold">
                    Số lượng mục tạo (Count: 1 - 15)
                  </Label>
                  <Input
                    type="number"
                    id="count"
                    min={1}
                    max={15}
                    className="border-border/40 focus:border-primary/50"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Giới hạn tối đa 15 mục trên mỗi lượt chạy để tránh quá tải API và đảm bảo chất lượng.
                  </p>
                </div>

                {/* Action Trigger Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-2 py-6 font-bold bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white rounded-xl shadow-lg shadow-violet-500/10 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Gemini đang soạn thảo bài...
                    </>
                  ) : (
                    <>
                      <Sparkle className="h-5 w-5 animate-pulse" />
                      Generate & Save to DB
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Generation Results Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass-card border-none h-full flex flex-col min-h-[450px]">
            <CardHeader className="pb-3 border-b border-border/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5 text-emerald-500" />
                  Kết quả đã lưu ({generatedItems.length})
                </CardTitle>
                {generatedItems.length > 0 && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold px-2 py-0.5">
                    SUCCESS
                  </Badge>
                )}
              </div>
              <CardDescription>
                Hiển thị danh sách dữ liệu vừa được đẩy trực tiếp lên cơ sở dữ liệu MongoDB
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 max-h-[550px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground text-sm">Đang sinh bài đọc hiểu & dịch nghĩa...</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Gemini đang liên kết các ví dụ thực tế và dịch chuẩn tiếng Việt. Quá trình này mất khoảng 5 - 10 giây.
                    </p>
                  </div>
                </div>
              ) : generatedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16 text-muted-foreground">
                  <div className="h-12 w-12 rounded-2xl bg-muted/20 flex items-center justify-center border border-border/20 mb-2">
                    <Database className="h-6 w-6 text-muted-foreground/60" />
                  </div>
                  <p className="font-semibold text-sm">Chưa có nội dung nào được tạo</p>
                  <p className="text-xs max-w-xs leading-normal">
                    Chọn cấu hình bên trái và click nút "Generate" để ra lệnh cho Gemini biên soạn tài liệu mới.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedItems.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm space-y-3.5 hover:border-primary/20 transition-all"
                    >
                      {/* Vocab View */}
                      {type === "vocab" ? (
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-xl font-black text-foreground">
                                {item.word}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                ({item.reading})
                              </span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {item.part_of_speech?.map((pos: string) => (
                                <Badge key={pos} variant="secondary" className="text-[9px] px-1.5 py-0 capitalize bg-primary/10 text-primary border-none">
                                  {pos}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-sm font-semibold text-primary pt-0.5 border-t border-border/10">
                            {item.meaning}
                          </div>

                          {item.exampleSentence && (
                            <div className="text-xs space-y-1 bg-primary/5 p-2 rounded-lg border border-primary/10 text-muted-foreground/90 leading-relaxed font-normal">
                              <p className="font-semibold text-foreground" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                                {item.exampleSentence}
                              </p>
                              <p className="italic text-[11px]">
                                {item.exampleMeaning}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Grammar View */
                        <div className="space-y-2.5">
                          <div className="flex items-baseline justify-between border-b border-border/10 pb-2">
                            <span className="text-lg font-black text-foreground bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                              {item.structure}
                            </span>
                            <Badge variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-500 border border-violet-500/20 font-bold">
                              Cách nối: {item.formation}
                            </Badge>
                          </div>
                          
                          <div className="text-sm font-bold text-foreground">
                            Ý nghĩa: <span className="text-primary font-medium">{item.meaning}</span>
                          </div>

                          {/* Examples */}
                          <div className="space-y-2 pt-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ví dụ minh họa:</span>
                            {item.examples?.map((ex: any, exIdx: number) => (
                              <div key={exIdx} className="text-xs space-y-1 bg-primary/5 p-2 rounded-lg border border-primary/10 font-normal leading-relaxed text-muted-foreground/90">
                                <p className="font-semibold text-foreground" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                                  {exIdx + 1}. {ex.japanese}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono">{ex.romaji}</p>
                                <p className="italic text-[11px] text-foreground/80">{ex.vietnamese}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
