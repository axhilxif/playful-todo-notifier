export type AchievementCategory = 
  | 'beginner'
  | 'focus'
  | 'planning'
  | 'consistency'
  | 'milestone'
  | 'special';

export interface AchievementReward {
  xp: number;
  title?: string;
  badge?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  condition: (stats: UserStats) => boolean;
  unlocked?: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  reward: AchievementReward;
  secret?: boolean;
  tier?: 1 | 2 | 3;
  color?: string;
}

export interface UserStats {
  totalTodos: number;
  completedTodos: number;
  totalFocusTime: number; // in hours
  planBoardItems: number;
  streak: number;
  level: number;
  xp: number;
  focusSessions: number;
  earlyBirdSessions: number; // before 8 AM
  nightOwlSessions: number; // after 10 PM
  perfectDays: number; // days with all todos completed
  longestSession: number; // in minutes
  weekendSessions: number;
  totalBreaks: number;
  completedHighPriorityTodos: number;
  plansCreatedInAdvance: number;
  completedOnTimeTodos: number;
  achievements: string[]; // IDs of unlocked achievements
  productiveHours: number[]; // 24-hour array of focus time per hour
  focusSessionsPerDay: number[]; // Array of focus sessions count per day
  lastActive: Date; // Last time user was active
  weeklyStats: {
    completedTodos: number;
    focusTime: number;
    streak: number;
  };
  averages: {
    dailyFocusTime: number;
    dailyCompletedTodos: number;
    sessionsPerDay: number;
  };
  timerSessions: Array<{
    id: string;
    startTime: string;
    endTime?: string;
    duration: number;
    subject?: string;
    breaks: number;
    focusScore: number;
  }>; // Record of focus sessions with details
  subjectStats: {
    [subject: string]: {
      totalTime: number;
      averageScore: number;
      sessionsCount: number;
      lastStudied: string;
    };
  }; // Stats per subject
}

export const ACHIEVEMENTS: Achievement[] = [
  // Beginner Achievements
  {
    id: 'first-todo',
    name: 'First Steps',
    description: 'Created your first todo',
    emoji: '👶',
    category: 'beginner',
    condition: (stats) => stats.totalTodos >= 1,
    reward: { xp: 50 },
    color: 'bg-primary',
  },
  {
    id: 'first-focus',
    name: 'Focus Beginner',
    description: 'Completed your first focus session',
    emoji: '🎯',
    category: 'beginner',
    condition: (stats) => stats.focusSessions >= 1,
    reward: { xp: 50 },
    color: 'bg-accent',
  },
  {
    id: 'first-plan',
    name: 'Planning Pioneer',
    description: 'Created your first plan board item',
    emoji: '📋',
    category: 'beginner',
    condition: (stats) => stats.planBoardItems >= 1,
    reward: { xp: 50 },
    color: 'bg-success',
  },

  // Consistency Achievements
  {
    id: 'week-streak',
    name: 'Consistent',
    description: '7 day activity streak',
    emoji: '🔥',
    category: 'consistency',
    condition: (stats) => stats.streak >= 7,
    reward: { xp: 100, title: 'The Consistent' },
    color: 'bg-warning',
    tier: 1,
  },
  {
    id: 'month-streak',
    name: 'Dedicated',
    description: '30 day activity streak',
    emoji: '💪',
    category: 'consistency',
    condition: (stats) => stats.streak >= 30,
    reward: { xp: 300, title: 'The Dedicated' },
    color: 'bg-destructive',
    tier: 2,
  },
  {
    id: 'quarter-streak',
    name: 'Unstoppable',
    description: '90 day activity streak',
    emoji: '🚀',
    category: 'consistency',
    condition: (stats) => stats.streak >= 90,
    reward: { xp: 1000, title: 'The Unstoppable' },
    color: 'bg-destructive',
    tier: 3,
  },

  // Focus Achievements
  {
    id: 'focus-master',
    name: 'Focus Master',
    description: '10 hours of total focus time',
    emoji: '🧘',
    category: 'focus',
    condition: (stats) => stats.totalFocusTime >= 10,
    reward: { xp: 200, title: 'Focus Master' },
    color: 'bg-primary',
    tier: 1,
  },
  {
    id: 'focus-legend',
    name: 'Focus Legend',
    description: '50 hours of total focus time',
    emoji: '🏆',
    category: 'focus',
    condition: (stats) => stats.totalFocusTime >= 50,
    reward: { xp: 500, title: 'Focus Legend' },
    color: 'bg-accent',
    tier: 2,
  },
  {
    id: 'marathon-session',
    name: 'Marathon Focus',
    description: 'Complete a 2-hour focus session',
    emoji: '🏃',
    category: 'focus',
    condition: (stats) => stats.longestSession >= 120,
    reward: { xp: 150, badge: 'marathon' },
    color: 'bg-success',
  },

  // Task Achievements
  {
    id: 'todo-warrior',
    name: 'Todo Warrior',
    description: 'Completed 50 todos',
    emoji: '⚔️',
    category: 'milestone',
    condition: (stats) => stats.completedTodos >= 50,
    reward: { xp: 200, title: 'Task Warrior' },
    color: 'from-amber-500 to-orange-500',
    tier: 1,
  },
  {
    id: 'productivity-guru',
    name: 'Productivity Guru',
    description: 'Completed 100 todos',
    emoji: '⚡',
    category: 'milestone',
    condition: (stats) => stats.completedTodos >= 100,
    reward: { xp: 400, title: 'Productivity Guru' },
    color: 'bg-destructive',
    tier: 2,
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Completed all todos in a day',
    emoji: '🌟',
    category: 'special',
    condition: (stats) => stats.perfectDays >= 1,
    reward: { xp: 100, badge: 'perfect-day' },
    color: 'bg-warning',
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: '7 perfect days',
    emoji: '💎',
    category: 'special',
    condition: (stats) => stats.perfectDays >= 7,
    reward: { xp: 300, badge: 'perfect-week' },
    color: 'from-blue-400 to-indigo-500',
  },

  // Special Time Achievements
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Started focus session before 8 AM',
    emoji: '🌅',
    category: 'special',
    condition: (stats) => stats.earlyBirdSessions >= 1,
    reward: { xp: 100, title: 'Early Bird' },
    secret: true,
    color: 'from-orange-400 to-amber-500',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Used timer after 10 PM',
    emoji: '🦉',
    category: 'special',
    condition: (stats) => stats.nightOwlSessions >= 1,
    reward: { xp: 100, title: 'Night Owl' },
    secret: true,
    color: 'bg-accent',
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: '10 weekend focus sessions',
    emoji: '🏋️',
    category: 'special',
    condition: (stats) => stats.weekendSessions >= 10,
    reward: { xp: 200, title: 'Weekend Warrior' },
    color: 'bg-success',
  },

  // Planning Achievements
  {
    id: 'planner',
    name: 'Master Planner',
    description: 'Created 10 plan board items',
    emoji: '📅',
    category: 'planning',
    condition: (stats) => stats.planBoardItems >= 10,
    reward: { xp: 150, title: 'Master Planner' },
    color: 'bg-info',
    tier: 1,
  },
  {
    id: 'visionary',
    name: 'Visionary',
    description: 'Created 25 plan board items',
    emoji: '🔮',
    category: 'planning',
    condition: (stats) => stats.planBoardItems >= 25,
    reward: { xp: 300, title: 'The Visionary' },
    color: 'bg-primary',
    tier: 2,
  },

  // Level Achievements
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reached level 5',
    emoji: '⭐',
    category: 'milestone',
    condition: (stats) => stats.level >= 5,
    reward: { xp: 200, title: 'Rising Star' },
    color: 'bg-warning',
    tier: 1,
  },
  {
    id: 'level-10',
    name: 'Champion',
    description: 'Reached level 10',
    emoji: '🏅',
    category: 'milestone',
    condition: (stats) => stats.level >= 10,
    reward: { xp: 500, title: 'Champion' },
    color: 'from-amber-500 to-orange-500',
    tier: 2,
  },
  {
    id: 'level-25',
    name: 'Legend',
    description: 'Reached level 25',
    emoji: '👑',
    category: 'milestone',
    condition: (stats) => stats.level >= 25,
    reward: { xp: 1000, title: 'The Legend', badge: 'legend' },
    color: 'bg-destructive',
    tier: 3,
  },

  // Advanced Task Achievements
  {
    id: 'high-priority-hero',
    name: 'Priority Hero',
    description: 'Complete 10 high-priority todos',
    emoji: '🦸',
    category: 'milestone',
    condition: (stats) => stats.completedHighPriorityTodos >= 10,
    reward: { xp: 250, title: 'Priority Hero' },
    color: 'bg-destructive',
    tier: 2,
  },
  {
    id: 'deadline-demon',
    name: 'Deadline Demon',
    description: 'Complete 20 todos on time',
    emoji: '😈',
    category: 'milestone',
    condition: (stats) => stats.completedOnTimeTodos >= 20,
    reward: { xp: 300, title: 'Deadline Demon' },
    color: 'bg-muted',
    tier: 2,
  },

  // Advanced Planning Achievements
  {
    id: 'future-architect',
    name: 'Future Architect',
    description: 'Create a plan for 7 days in advance',
    emoji: '🏗️',
    category: 'planning',
    condition: (stats) => stats.plansCreatedInAdvance >= 7,
    reward: { xp: 200, title: 'Future Architect' },
    color: 'bg-info',
    tier: 2,
  },
];
