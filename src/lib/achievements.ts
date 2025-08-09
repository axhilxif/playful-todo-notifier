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
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: 'first-focus',
    name: 'Focus Beginner',
    description: 'Completed your first focus session',
    emoji: '🎯',
    category: 'beginner',
    condition: (stats) => stats.focusSessions >= 1,
    reward: { xp: 50 },
    color: 'from-purple-400 to-purple-500',
  },
  {
    id: 'first-plan',
    name: 'Planning Pioneer',
    description: 'Created your first plan board item',
    emoji: '📋',
    category: 'beginner',
    condition: (stats) => stats.planBoardItems >= 1,
    reward: { xp: 50 },
    color: 'from-green-400 to-green-500',
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
    color: 'from-orange-400 to-orange-500',
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
    color: 'from-orange-500 to-red-500',
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
    color: 'from-red-500 to-purple-500',
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
    color: 'from-blue-500 to-indigo-500',
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
    color: 'from-indigo-500 to-purple-500',
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
    color: 'from-green-500 to-emerald-500',
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
    color: 'from-orange-500 to-red-500',
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
    color: 'from-yellow-400 to-amber-500',
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
    color: 'from-indigo-500 to-purple-500',
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: '10 weekend focus sessions',
    emoji: '🏋️',
    category: 'special',
    condition: (stats) => stats.weekendSessions >= 10,
    reward: { xp: 200, title: 'Weekend Warrior' },
    color: 'from-green-500 to-emerald-500',
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
    color: 'from-cyan-500 to-blue-500',
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
    color: 'from-blue-500 to-indigo-500',
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
    color: 'from-yellow-400 to-amber-500',
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
    color: 'from-orange-500 to-red-500',
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
    color: 'from-red-500 to-rose-500',
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
    color: 'from-slate-500 to-gray-600',
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
    color: 'from-sky-500 to-cyan-500',
    tier: 2,
  },
];
