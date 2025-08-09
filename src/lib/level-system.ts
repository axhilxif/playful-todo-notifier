interface LevelInfo {
  level: number;
  xpNeeded: number;
  title: string;
  emoji: string;
}

export const calculateLevel = (xp: number): LevelInfo => {
  // XP required for each level follows a progression curve
  // Level 1: 100 XP
  // Each subsequent level requires 20% more XP than the previous
  let currentLevel = 0;
  let xpNeeded = 100;
  let totalXpNeeded = 0;
  
  while (xp >= totalXpNeeded + xpNeeded) {
    currentLevel++;
    totalXpNeeded += xpNeeded;
    xpNeeded = Math.floor(xpNeeded * 1.2);
  }

  const titles = [
    { level: 0, title: "Novice Student", emoji: "📚" },
    { level: 5, title: "Dedicated Learner", emoji: "✏️" },
    { level: 10, title: "Focus Master", emoji: "🎯" },
    { level: 15, title: "Study Champion", emoji: "🏆" },
    { level: 20, title: "Knowledge Seeker", emoji: "🔍" },
    { level: 25, title: "Academic Star", emoji: "⭐" },
    { level: 30, title: "Wisdom Sage", emoji: "🦉" },
    { level: 40, title: "Learning Legend", emoji: "👑" },
    { level: 50, title: "Study Virtuoso", emoji: "🌟" },
  ];

  const currentTitle = titles
    .slice()
    .reverse()
    .find(t => currentLevel >= t.level) || titles[0];

  return {
    level: currentLevel,
    xpNeeded,
    title: currentTitle.title,
    emoji: currentTitle.emoji,
  };
};

export const calculateXPReward = (action: string, streak: number = 0): number => {
  const baseRewards: Record<string, number> = {
    'complete-todo': 20,
    'focus-session': 30,
    'perfect-day': 100,
    'create-plan': 15,
    'complete-special-day': 50,
    'early-bird': 40,
    'night-owl': 40,
    'weekend-warrior': 45,
  };

  let reward = baseRewards[action] || 10;
  
  // Streak bonus (up to 100% bonus at 7-day streak)
  if (streak > 0) {
    const streakMultiplier = Math.min(streak / 7, 1);
    reward *= (1 + streakMultiplier);
  }

  return Math.floor(reward);
};

export const formatXP = (xp: number): string => {
  return xp.toLocaleString();
};
