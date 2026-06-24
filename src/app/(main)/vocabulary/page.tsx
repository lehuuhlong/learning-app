"use client";

import { useState, useEffect } from "react";
import FlashCard from "@/components/vocabulary/FlashCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shuffle, Loader2 } from "lucide-react";

export default function VocabularyPage() {
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [vocabRes, dashRes] = await Promise.all([
          fetch("/api/vocabulary?level=N2&limit=60"),
          fetch("/api/dashboard")
        ]);

        if (vocabRes.ok) {
          const vocabData = await vocabRes.json();
          setVocabulary(vocabData.vocabulary || []);
        }

        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (dashData.learnedVocabIds) {
            setLearnedIds(new Set(dashData.learnedVocabIds));
          }
        }
      } catch (err) {
        console.error("Failed to load vocabulary data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleMarkLearned(id: string) {
    try {
      const response = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabId: id, status: "learned" }),
      });
      if (response.ok) {
        setLearnedIds((prev) => new Set([...prev, id]));
      }
    } catch (err) {
      console.error("Failed to mark word as learned:", err);
    }
  }

  function shuffleCards() {
    setVocabulary((prev) => [...prev].sort(() => Math.random() - 0.5));
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Vocabulary</h1>
            <Badge variant="secondary" className="text-sm">
              N2
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Master essential N2 vocabulary with interactive flashcards.
            Click a card to flip it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 py-1.5 px-3 text-sm font-medium"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {learnedIds.size} / {vocabulary.length} learned
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={shuffleCards}
          >
            <Shuffle className="h-3.5 w-3.5" />
            Shuffle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Words</TabsTrigger>
          <TabsTrigger value="new">
            New ({vocabulary.length - learnedIds.size})
          </TabsTrigger>
          <TabsTrigger value="learned">
            Learned ({learnedIds.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vocabulary.map((word) => (
              <FlashCard
                key={word._id}
                word={word}
                isLearned={learnedIds.has(word._id)}
                onMarkLearned={handleMarkLearned}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vocabulary
              .filter((w) => !learnedIds.has(w._id))
              .map((word) => (
                <FlashCard
                  key={word._id}
                  word={word}
                  isLearned={false}
                  onMarkLearned={handleMarkLearned}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="learned" className="space-y-6">
          {learnedIds.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No words learned yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Flip a card and click &ldquo;Mark learned&rdquo; to track your
                progress.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vocabulary
                .filter((w) => learnedIds.has(w._id))
                .map((word) => (
                  <FlashCard key={word._id} word={word} isLearned />
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
