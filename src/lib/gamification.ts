/**
 * Gamification System — Levels, EXP, Badges, and Streak Logic
 */

// ─── EXP Rewards per Action ─────────────────────────────────
export const EXP_REWARDS = {
  flashcard: 5,      // Per successful flashcard (quality ≥ 3)
  dokkai: 50,        // Per completed reading comprehension
  grammar: 30,       // Per completed grammar quiz
  daily_login: 10,   // First activity of the day
} as const;

export type ActionType = keyof typeof EXP_REWARDS;

// ─── Level Calculation ──────────────────────────────────────
/**
 * Calculate level from total EXP.
 * Every 100 EXP = 1 level. Level 1 starts at 0 EXP.
 */
export function calculateLevel(exp: number): number {
  return Math.floor(exp / 100) + 1;
}

/**
 * Get progress toward the next level.
 */
export function expToNextLevel(exp: number): {
  current: number;
  required: number;
  progress: number;
} {
  const current = exp % 100;
  const required = 100;
  const progress = Math.round((current / required) * 100);
  return { current, required, progress };
}

// ─── Badge Definitions ──────────────────────────────────────
export interface BadgeDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string; // Human-readable unlock condition
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "flame_keeper",
    name: "Flame Keeper",
    icon: "🔥",
    description: "Duy trì streak 7 ngày liên tiếp",
    requirement: "7-day streak",
  },
  {
    id: "centurion",
    name: "Centurion",
    icon: "🏆",
    description: "Học thuộc 100 từ vựng",
    requirement: "100 words learned",
  },
  {
    id: "bookworm",
    name: "Bookworm",
    icon: "📚",
    description: "Hoàn thành 10 bài đọc hiểu Dokkai",
    requirement: "10 Dokkai completed",
  },
  {
    id: "speed_learner",
    name: "Speed Learner",
    icon: "⚡",
    description: "Ôn 50 flashcard trong một ngày",
    requirement: "50 flashcards in one day",
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    icon: "🎯",
    description: "Đạt 100% trong bất kỳ bài quiz nào",
    requirement: "100% on any quiz",
  },
  {
    id: "diamond",
    name: "Diamond",
    icon: "💎",
    description: "Đạt Level 10",
    requirement: "Reach Level 10",
  },
];

/**
 * Check which new badges a user has earned.
 * Returns IDs of badges not yet in the user's `badges` array.
 */
export function checkBadges(gamification: {
  exp: number;
  currentStreak: number;
  badges: string[];
  flashcardsToday: number;
}, stats: {
  totalVocabLearned: number;
  totalDokkaiCompleted: number;
  hasPerfectQuiz: boolean;
}): string[] {
  const earned = gamification.badges || [];
  const newBadges: string[] = [];

  // 🔥 Flame Keeper — 7-day streak
  if (!earned.includes("flame_keeper") && gamification.currentStreak >= 7) {
    newBadges.push("flame_keeper");
  }

  // 🏆 Centurion — 100 words learned
  if (!earned.includes("centurion") && stats.totalVocabLearned >= 100) {
    newBadges.push("centurion");
  }

  // 📚 Bookworm — 10 Dokkai completed
  if (!earned.includes("bookworm") && stats.totalDokkaiCompleted >= 10) {
    newBadges.push("bookworm");
  }

  // ⚡ Speed Learner — 50 flashcards in one day
  if (!earned.includes("speed_learner") && gamification.flashcardsToday >= 50) {
    newBadges.push("speed_learner");
  }

  // 🎯 Perfect Score — 100% on any quiz
  if (!earned.includes("perfect_score") && stats.hasPerfectQuiz) {
    newBadges.push("perfect_score");
  }

  // 💎 Diamond — Reach Level 10
  if (!earned.includes("diamond") && calculateLevel(gamification.exp) >= 10) {
    newBadges.push("diamond");
  }

  return newBadges;
}

/**
 * Update the user's streak based on the current date and their last active date.
 * Returns updated streak values.
 */
export function updateStreak(lastActiveDate: string | null, currentStreak: number, longestStreak: number): {
  currentStreak: number;
  longestStreak: number;
  isNewDay: boolean;
} {
  const todayStr = getDateString(new Date());

  if (!lastActiveDate) {
    // First ever activity
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      isNewDay: true,
    };
  }

  if (lastActiveDate === todayStr) {
    // Already active today — no streak change
    return {
      currentStreak,
      longestStreak,
      isNewDay: false,
    };
  }

  const yesterdayStr = getDateString(new Date(Date.now() - 86400000));

  if (lastActiveDate === yesterdayStr) {
    // Consecutive day — increment streak
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      isNewDay: true,
    };
  }

  // Streak broken — reset to 1 (today is still a new active day)
  return {
    currentStreak: 1,
    longestStreak,
    isNewDay: true,
  };
}

function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
