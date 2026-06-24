import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  BarChart3,
  Sparkles,
  ArrowRight,
  Layers,
  Brain,
  Target,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground animate-pulse duration-3000">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              JLPT<span className="text-primary/70">Master</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium" id="hero-signin">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-medium" id="hero-getstarted">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex flex-1 items-center overflow-hidden py-10">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-violet-500/10 dark:bg-violet-500/20 blur-3xl animate-pulse duration-4000" />
          <div className="absolute bottom-1/4 -right-20 h-[500px] w-[500px] rounded-full bg-rose-500/10 dark:bg-rose-500/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="gap-1.5 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5 text-primary shadow-sm shadow-primary/10"
              >
                <Target className="h-3.5 w-3.5 text-rose-500" />
                Focused on JLPT N2
              </Badge>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Master Japanese
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
                with confidence
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
              A modern, focused learning platform for JLPT N2. Interactive
              flashcards, reading comprehension practice, and progress tracking
              — all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8 font-semibold text-base h-12 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white shadow-md shadow-violet-500/20 border-none transition-all duration-300 hover:scale-105" id="cta-start">
                  Start Learning Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 font-medium text-base h-12 border-border/80 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all"
                  id="cta-signin"
                >
                  I have an account
                </Button>
              </Link>
            </div>

            {/* Japanese text decoration */}
            <div className="pt-4">
              <p className="text-sm font-semibold tracking-widest text-violet-500/60 dark:text-violet-400/60 bg-gradient-to-r from-violet-500/10 via-rose-500/10 to-violet-500/10 py-1.5 px-6 rounded-full inline-block border border-violet-500/10" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                日本語能力試験 N2 対策
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need for N2
            </h2>
            <p className="text-muted-foreground text-lg">
              Carefully designed tools to help you pass the JLPT N2 exam.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Flashcards */}
            <Card className="group border-border/50 bg-card/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition-transform duration-300 group-hover:scale-110">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg mt-4">
                  Vocabulary Flashcards
                </CardTitle>
                <CardDescription>
                  Interactive 3D flip cards with kanji, readings, meanings, and
                  real example sentences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs border border-blue-500/20">
                    800+ words
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    N2 level
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Reading */}
            <Card className="group border-border/50 bg-card/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform duration-300 group-hover:scale-110">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg mt-4">
                  Reading Comprehension
                </CardTitle>
                <CardDescription>
                  Split-screen Dokkai practice with vocabulary notes and instant
                  answer feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs border border-emerald-500/20">
                    Split-screen
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Resizable
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Progress */}
            <Card className="group border-border/50 bg-card/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition-transform duration-300 group-hover:scale-110">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg mt-4">
                  Progress Dashboard
                </CardTitle>
                <CardDescription>
                  Track your learning journey with beautiful charts, streaks, and
                  mastery metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs border border-amber-500/20">
                    Charts
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Streaks
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            <span>JLPT Master — Built for N2 learners</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
