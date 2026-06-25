/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 *
 * Quality ratings:
 *   0 = Again  — Complete blackout, total failure to recall
 *   2 = Hard   — Recalled with serious difficulty
 *   3 = Good   — Recalled with some hesitation
 *   5 = Easy   — Perfect response, instant recall
 *
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface SrsResult {
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
}

/**
 * Compute the next review schedule using the SM-2 algorithm.
 *
 * @param quality       - User's self-assessed quality of recall (0, 2, 3, or 5)
 * @param repetitions   - Number of consecutive successful reviews
 * @param easeFactor    - Current ease factor (≥ 1.3)
 * @param interval      - Current interval in days
 * @returns Updated SRS parameters and the next review date
 */
export function sm2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SrsResult {
  let newRepetitions: number;
  let newEaseFactor: number;
  let newInterval: number;

  if (quality < 3) {
    // Failed recall — reset to beginning
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
    newEaseFactor = Math.max(1.3, easeFactor - 0.2); // Slightly decrease ease
  } else {
    // Successful recall — advance the schedule
    newRepetitions = repetitions + 1;

    // Calculate new interval based on repetition count
    if (newRepetitions === 1) {
      newInterval = 1;   // First success → review in 1 day
    } else if (newRepetitions === 2) {
      newInterval = 6;   // Second success → review in 6 days
    } else {
      newInterval = Math.round(interval * easeFactor);
    }

    // Update ease factor using SM-2 formula:
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const qualityDelta = 5 - quality;
    newEaseFactor = easeFactor + (0.1 - qualityDelta * (0.08 + qualityDelta * 0.02));
    newEaseFactor = Math.max(1.3, newEaseFactor); // Minimum EF is 1.3
  }

  // Calculate the next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  // For "Again" (quality=0), set next review to 10 minutes from now
  // to allow immediate re-study within the same session
  if (quality === 0) {
    nextReviewDate.setTime(Date.now() + 10 * 60 * 1000); // 10 minutes
  }

  return {
    repetitions: newRepetitions,
    easeFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
    interval: newInterval,
    nextReviewDate,
  };
}

/**
 * Map UI button labels to SM-2 quality scores.
 */
export const QUALITY_MAP = {
  again: 0,
  hard: 2,
  good: 3,
  easy: 5,
} as const;

export type QualityLabel = keyof typeof QUALITY_MAP;

/**
 * Predict the next review interval for each quality rating.
 * Used to display interval hints on the flashcard buttons.
 */
export function predictIntervals(
  repetitions: number,
  easeFactor: number,
  interval: number
): Record<QualityLabel, string> {
  const predictions: Record<QualityLabel, string> = {
    again: "< 10 min",
    hard: "",
    good: "",
    easy: "",
  };

  for (const label of ["hard", "good", "easy"] as QualityLabel[]) {
    const result = sm2(QUALITY_MAP[label], repetitions, easeFactor, interval);
    predictions[label] = formatInterval(result.interval);
  }

  return predictions;
}

/**
 * Format an interval in days to a human-readable string.
 */
function formatInterval(days: number): string {
  if (days <= 0) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? "1 month" : `${months} months`;
  }
  const years = Math.round(days / 365);
  return years === 1 ? "1 year" : `${years} years`;
}
