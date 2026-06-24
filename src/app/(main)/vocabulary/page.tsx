"use client";

import { useState } from "react";
import type { Metadata } from "next";
import FlashCard from "@/components/vocabulary/FlashCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Shuffle } from "lucide-react";

// Mock vocabulary data (matches seed data so UI works without DB)
const mockVocabulary = [
  {
    _id: "1",
    kanji: "影響",
    hiragana: "えいきょう",
    romaji: "eikyou",
    meaning: "influence; effect; impact",
    jlptLevel: "N2",
    exampleSentence: "この決定は私たちの生活に大きな影響を与えるだろう。",
    exampleMeaning:
      "This decision will probably have a big impact on our lives.",
    tags: ["noun", "suru-verb", "formal"],
  },
  {
    _id: "2",
    kanji: "経験",
    hiragana: "けいけん",
    romaji: "keiken",
    meaning: "experience",
    jlptLevel: "N2",
    exampleSentence: "海外で働いた経験がありますか。",
    exampleMeaning: "Do you have experience working abroad?",
    tags: ["noun", "suru-verb", "business"],
  },
  {
    _id: "3",
    kanji: "相変わらず",
    hiragana: "あいかわらず",
    romaji: "aikawarazu",
    meaning: "as usual; as always; same as ever",
    jlptLevel: "N2",
    exampleSentence: "彼は相変わらず元気だ。",
    exampleMeaning: "He is as energetic as ever.",
    tags: ["adverb", "conversational"],
  },
  {
    _id: "4",
    kanji: "届ける",
    hiragana: "とどける",
    romaji: "todokeru",
    meaning: "to deliver; to report; to notify",
    jlptLevel: "N2",
    exampleSentence: "荷物を友達の家に届けた。",
    exampleMeaning: "I delivered the package to my friend's house.",
    tags: ["ichidan-verb", "transitive"],
  },
  {
    _id: "5",
    kanji: "複雑",
    hiragana: "ふくざつ",
    romaji: "fukuzatsu",
    meaning: "complicated; complex; intricate",
    jlptLevel: "N2",
    exampleSentence: "この問題はとても複雑で、簡単には解決できない。",
    exampleMeaning:
      "This problem is very complicated and cannot be easily solved.",
    tags: ["na-adjective", "formal"],
  },
];

export default function VocabularyPage() {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [vocabulary] = useState(mockVocabulary);

  function handleMarkLearned(id: string) {
    setLearnedIds((prev) => new Set([...prev, id]));
  }

  function shuffleCards() {
    // Simple shuffle for demo
    window.location.reload();
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
