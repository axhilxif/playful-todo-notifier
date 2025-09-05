import { UserStats, ACHIEVEMENTS } from './achievements';
import { calculateUserStats } from './gamification';
import { Todo } from '@/types'; // Assuming Todo type is available

export interface AISuggestion {
  id: string;
  message: string;
  type: 'productivity' | 'planning' | 'achievement' | 'general';
  action?: string; // e.g., "Go to Todos", "View Achievements"
  priority: 'low' | 'medium' | 'high';
}

function getHourPeriod(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "late night";
}

export function getOptimalFocusTimeSuggestion(stats: UserStats): AISuggestion | null {
  if (!stats.productiveHours || stats.productiveHours.length === 0) {
    return {
      id: 'optimal-focus-start',
      message: "Start tracking your focus sessions to get personalized optimal focus time suggestions!",
      type: 'productivity',
      action: "Go to Timer",
      priority: 'medium',
    };
  }

  let maxFocusTime = 0;
  let optimalHour = -1;

  stats.productiveHours.forEach((hours, hour) => {
    if (hours > maxFocusTime) {
      maxFocusTime = hours;
      optimalHour = hour;
    }
  });

  if (optimalHour === -1 || maxFocusTime === 0) {
    return {
      id: 'optimal-focus-more-data',
      message: "Keep tracking your focus sessions to help us identify your optimal focus times.",
      type: 'productivity',
      action: "Go to Timer",
      priority: 'low',
    };
  }

  const period = getHourPeriod(optimalHour);
  return {
    id: 'optimal-focus-time',
    message: `Your most productive time seems to be in the ${period} (around ${optimalHour}:00). Try scheduling your most demanding tasks then!`,
    type: 'productivity',
    priority: 'high',
  };
}

export function getBreakReminderSuggestion(stats: UserStats): AISuggestion | null {
  const focusHours = stats.totalFocusTime; // in hours
  const breaksTaken = stats.totalBreaks;

  if (focusHours < 1) {
    return {
      id: 'break-reminder-start',
      message: "Complete more focus sessions to get personalized break suggestions.",
      type: 'productivity',
      action: "Go to Timer",
      priority: 'low',
    };
  }

  const expectedBreaks = Math.floor(focusHours / 1.5); // Suggest a break every 1.5 hours of focus

  if (breaksTaken < expectedBreaks && focusHours > 2) { // Only suggest if significant focus time
    return {
      id: 'take-more-breaks',
      message: `You've focused for ${focusHours} hours but only taken ${breaksTaken} breaks. Remember to take regular breaks to avoid burnout!`, 
      type: 'productivity',
      priority: 'high',
    };
  } else if (breaksTaken > expectedBreaks * 1.5 && focusHours > 2) {
    return {
      id: 'balanced-breaks',
      message: `Great job taking breaks! You've taken ${breaksTaken} breaks for ${focusHours} hours of focus. Keep up the balance!`, 
      type: 'productivity',
      priority: 'low',
    };
  } else {
    return {
      id: 'break-habits-balanced',
      message: "Your break habits seem balanced. Keep up the good work!",
      type: 'productivity',
      priority: 'low',
    };
  }
}

export function getTodoCompletionSuggestion(stats: UserStats): AISuggestion | null {
  if (stats.totalTodos === 0) {
    return {
      id: 'todo-completion-start',
      message: "Add some todos to start tracking your completion rate!",
      type: 'productivity',
      action: "Go to Todos",
      priority: 'medium',
    };
  }

  const completionRate = (stats.completedTodos / stats.totalTodos) * 100;

  if (completionRate < 50) {
    return {
      id: 'improve-completion-rate',
      message: `Your todo completion rate is ${completionRate.toFixed(0)}%. Try breaking down large tasks or setting more realistic deadlines!`,
      type: 'productivity',
      action: "Go to Todos",
      priority: 'high',
    };
  } else if (completionRate < 80) {
    return {
      id: 'good-completion-rate',
      message: `Your todo completion rate is ${completionRate.toFixed(0)}%. You're doing great, keep pushing!`,
      type: 'productivity',
      priority: 'medium',
    };
  } else {
    return {
      id: 'excellent-completion-rate',
      message: `Excellent! Your todo completion rate is ${completionRate.toFixed(0)}%. You're a todo master!`,
      type: 'productivity',
      priority: 'low',
    };
  }
}

export function getPlanningSuggestion(stats: UserStats): AISuggestion | null {
  if (stats.planBoardItems === 0) {
    return {
      id: 'planning-start',
      message: "Start creating plans on your Plan Board to organize your activities and goals!",
      type: 'planning',
      action: "Go to Plan Board",
      priority: 'medium',
    };
  }

  if (stats.plansCreatedInAdvance < 3) {
    return {
      id: 'plan-ahead',
      message: `You have ${stats.plansCreatedInAdvance} plans created in advance. Planning ahead can significantly boost your productivity!`,
      type: 'planning',
      action: "Go to Plan Board",
      priority: 'high',
    };
  } else {
    return {
      id: 'good-planning',
      message: "Your planning habits are looking good! Keep organizing your future tasks.",
      type: 'planning',
      priority: 'low',
    };
  }
}

export function getAchievementNudge(stats: UserStats): AISuggestion | null {
  const uncompletedAchievements = ACHIEVEMENTS.filter(ach => !stats.achievements.includes(ach.id));

  if (uncompletedAchievements.length === 0) {
    return {
      id: 'all-achievements-unlocked',
      message: "Congratulations! You've unlocked all available achievements. You're a true StudyBuddy master!",
      type: 'achievement',
      action: "View Achievements",
      priority: 'low',
    };
  }

  // Suggest the next easiest achievement to unlock
  // This is a simplified logic; a real AI would consider user's current progress more deeply
  const easiestAchievement = uncompletedAchievements.sort((a, b) => a.reward.xp - b.reward.xp)[0];

  if (easiestAchievement) {
    return {
      id: 'next-achievement-nudge',
      message: `You're close to unlocking "${easiestAchievement.name}"! ${easiestAchievement.description}. Keep going!`,
      type: 'achievement',
      action: "View Achievements",
      priority: 'medium',
    };
  }
  return null;
}

function getStreakSuggestion(stats: UserStats): AISuggestion | null {
  if (stats.streak === 0) {
    return {
      id: 'start-streak',
      message: "Start your productivity streak by completing tasks daily!",
      type: 'general',
      priority: 'medium',
    };
  }

  if (stats.streak > 0 && stats.streak < 3) {
    return {
      id: 'build-streak',
      message: `You're on a ${stats.streak} day streak! Keep going to build momentum.`,
      type: 'general',
      priority: 'high',
    };
  }

  return {
    id: 'maintain-streak',
    message: `Impressive ${stats.streak} day streak! You're building great habits.`,
    type: 'general',
    priority: 'medium',
  };
}

function getFocusPatternSuggestion(stats: UserStats): AISuggestion | null {
  const today = new Date();
  const hour = today.getHours();

  // Early morning focus check
  if (hour < 12 && stats.productiveHours && stats.productiveHours[hour - 1] === 0) {
    return {
      id: 'morning-focus',
      message: "Consider starting your day with a focused session. Morning focus can set a productive tone for the day!",
      type: 'productivity',
      priority: 'medium',
    };
  }

  // Afternoon slump check
  if (hour >= 14 && hour <= 16 && stats.productiveHours) {
    const afternoonHours = stats.productiveHours.slice(14, 17);
    if (afternoonHours.every(h => h === 0)) {
      return {
        id: 'afternoon-slump',
        message: "Notice the afternoon productivity dip? Try scheduling lighter tasks or quick breaks during this time.",
        type: 'productivity',
        priority: 'high',
      };
    }
  }

  return null;
}

function getConsistencyAdvice(stats: UserStats): AISuggestion | null {
  const completionRate = stats.totalTodos > 0 ? (stats.completedTodos / stats.totalTodos) * 100 : 0;
  const focusConsistency = stats.focusSessionsPerDay && stats.focusSessionsPerDay.length > 0
    ? stats.focusSessionsPerDay.filter(s => s > 0).length / stats.focusSessionsPerDay.length * 100
    : 0;

  if (completionRate > 80 && focusConsistency < 50) {
    return {
      id: 'improve-consistency',
      message: "While your task completion is great, try to maintain more consistent daily focus sessions for better long-term results.",
      type: 'productivity',
      priority: 'high',
    };
  }

  return null;
}

function getWeeklyProgressInsight(stats: UserStats): AISuggestion | null {
  const { weeklyStats, averages } = stats;
  
  if (weeklyStats.focusTime > averages.dailyFocusTime * 7 * 1.2) {
    return {
      id: 'exceptional-week',
      message: `Outstanding week! You've focused ${Math.round(weeklyStats.focusTime)}h this week, well above your daily average.`,
      type: 'productivity',
      priority: 'high',
    };
  }
  
  if (weeklyStats.focusTime < averages.dailyFocusTime * 7 * 0.8) {
    return {
      id: 'below-average-week',
      message: `This week's focus time (${Math.round(weeklyStats.focusTime)}h) is below your usual. Need help getting back on track?`,
      type: 'productivity',
      action: "View Timer",
      priority: 'high',
    };
  }

  return null;
}

function getProductivityPatternInsight(stats: UserStats): AISuggestion | null {
  // Analyze the distribution of productive hours
  const morningHours = stats.productiveHours.slice(5, 12).reduce((sum, h) => sum + h, 0);
  const afternoonHours = stats.productiveHours.slice(12, 17).reduce((sum, h) => sum + h, 0);
  const eveningHours = stats.productiveHours.slice(17, 22).reduce((sum, h) => sum + h, 0);
  
  const total = morningHours + afternoonHours + eveningHours;
  if (total === 0) return null;

  const morningPercent = (morningHours / total) * 100;
  const afternoonPercent = (afternoonHours / total) * 100;
  const eveningPercent = (eveningHours / total) * 100;

  let peakTime = '';
  let percent = 0;

  if (morningPercent > afternoonPercent && morningPercent > eveningPercent) {
    peakTime = 'morning';
    percent = morningPercent;
  } else if (afternoonPercent > morningPercent && afternoonPercent > eveningPercent) {
    peakTime = 'afternoon';
    percent = afternoonPercent;
  } else {
    peakTime = 'evening';
    percent = eveningPercent;
  }

  return {
    id: 'productivity-pattern',
    message: `You're most productive in the ${peakTime} (${Math.round(percent)}% of your focus time). Consider scheduling important tasks during this period!`,
    type: 'productivity',
    priority: 'medium',
  };
}

function getLevelProgressInsight(stats: UserStats): AISuggestion | null {
  const nextLevelXp = Math.ceil(stats.xp / 100) * 100;
  const xpToNext = nextLevelXp - stats.xp;
  
  if (xpToNext <= 50) {
    return {
      id: 'near-level-up',
      message: `Only ${xpToNext} XP away from level ${stats.level + 1}! Complete a few more tasks to level up.`,
      type: 'achievement',
      priority: 'high',
    };
  }
  
  return null;
}

export function getAllSuggestions(stats: UserStats): AISuggestion[] {
  const suggestions: AISuggestion[] = [];

  const addIfNotNull = (suggestion: AISuggestion | null) => {
    if (suggestion) {
      suggestions.push(suggestion);
    }
  };

  // Core suggestions
  addIfNotNull(getOptimalFocusTimeSuggestion(stats));
  addIfNotNull(getBreakReminderSuggestion(stats));
  addIfNotNull(getTodoCompletionSuggestion(stats));
  addIfNotNull(getPlanningSuggestion(stats));
  addIfNotNull(getAchievementNudge(stats));
  
  // Advanced insights
  addIfNotNull(getStreakSuggestion(stats));
  addIfNotNull(getFocusPatternSuggestion(stats));
  addIfNotNull(getConsistencyAdvice(stats));
  addIfNotNull(getWeeklyProgressInsight(stats));
  addIfNotNull(getProductivityPatternInsight(stats));
  addIfNotNull(getLevelProgressInsight(stats));

  // Sort suggestions by priority (high to low)
  const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
  suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  // Only return the top 5 most relevant suggestions to avoid overwhelming the user
  return suggestions.slice(0, 5);
}

// Convenience wrapper: if stats not provided, compute them so AI uses real data
export function getAllSuggestionsAuto(stats?: UserStats): AISuggestion[] {
  const effectiveStats = stats || calculateUserStats();
  return getAllSuggestions(effectiveStats);
}