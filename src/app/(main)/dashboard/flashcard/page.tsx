"use client";

import { useState, useEffect } from "react";
import Flashcard from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

interface VocabularyItem {
  _id: string;
  word: string;
  reading: string;
  meaning: string;
  part_of_speech: string[];
  level: string;
}

export default function FlashcardPage() {
  const [word, setWord] = useState<VocabularyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomWord = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vocabulary/random");
      if (!res.ok) {
        throw new Error("Failed to fetch vocabulary card");
      }
      const data = await res.json();
      setWord(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomWord();
  }, []);

  const handleAction = async (status: "learned" | "review") => {
    if (!word) return;

    if (status === "learned") {
      try {
        // Save user progress in the DB
        await fetch("/api/vocabulary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vocabId: word._id, status: "learned" }),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }

    // Load next card
    fetchRandomWord();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 min-h-[calc(100vh-4rem)] flex flex-col justify-center">
      {/* Navigation Headers */}
      <div className="flex items-center justify-between w-full max-w-md mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={fetchRandomWord} className="text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-rose-400 bg-clip-text text-transparent">
          Random Flashcards
        </h1>
        <p className="text-sm text-muted-foreground">
          Test your memory and pronunciation of N2 vocabulary words.
        </p>
      </div>

      {/* Flashcard container with fixed loading/error bounds */}
      <div className="flex-1 flex items-center justify-center min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading card...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-rose-500 font-semibold">{error}</p>
            <Button onClick={fetchRandomWord} size="sm">
              Try Again
            </Button>
          </div>
        ) : word ? (
          <Flashcard word={word} onAction={handleAction} />
        ) : (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">No vocabulary words available.</p>
            <Button onClick={fetchRandomWord} size="sm">
              Reload
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
