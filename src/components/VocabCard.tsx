import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface VocabCardProps {
  word: string;
  reading: string;
  meaning: string;
  partOfSpeech?: string[];
  level: string;
}

export default function VocabCard({
  word,
  reading,
  meaning,
  partOfSpeech = [],
  level,
}: VocabCardProps) {
  return (
    <Card className="glass-card group overflow-hidden border-border/20 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            {/* Word & Reading */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {reading}
              </p>
              <h3 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
                {word}
              </h3>
            </div>

            {/* Meaning */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm font-semibold uppercase tracking-wider">Meaning</span>
              </div>
              <p className="text-lg font-medium text-foreground/90 leading-relaxed">
                {meaning}
              </p>
            </div>

            {/* Part of Speech */}
            {partOfSpeech.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {partOfSpeech.map((pos, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20 text-xs font-medium"
                  >
                    {pos}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Level Badge */}
          <Badge
            variant="secondary"
            className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 text-sm font-bold shadow-sm"
          >
            {level}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
