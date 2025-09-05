import { Todo } from '@/types';
import { UserStats } from '@/lib/achievements';
import { calculateUserStats } from './gamification';
import { format, differenceInDays } from 'date-fns';

interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
  action?: {
    label: string;
    route: string;
  };
}

export interface AINotification {
  id: string;
  title: string;
  body: string;
  type: 'achievement' | 'reminder' | 'insight' | 'alert';
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
  action?: {
    label: string;
    route: string;
  };
}

class AINotificationService {
  private static instance: AINotificationService;
  private notifications: AINotification[] = [];
  private listeners: ((notification: AINotification) => void)[] = [];

  private constructor() {}

  public static getInstance(): AINotificationService {
    if (!AINotificationService.instance) {
      AINotificationService.instance = new AINotificationService();
    }
    return AINotificationService.instance;
  }

  public addListener(callback: (notification: AINotification) => void) {
    this.listeners.push(callback);
  }

  public removeListener(callback: (notification: AINotification) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notify(notification: AINotification) {
    this.notifications.push(notification);
    this.listeners.forEach(listener => listener(notification));
  }

  private generateSmartInsights(todos: Todo[], stats: UserStats, plans: any[]): SmartInsight[] {
    const insights: SmartInsight[] = [];

    // Analyze focus patterns
    if (stats.totalFocusTime > 0 && stats.productiveHours) {
      const mostProductiveHour = stats.productiveHours.indexOf(Math.max(...stats.productiveHours));
      insights.push({
        id: 'focus-pattern',
        type: 'info',
        priority: 'medium',
        title: 'Peak Productivity Time',
        message: `You're most productive at ${mostProductiveHour}:00. Consider scheduling important tasks during this time.`
      });
    }

    // Check streak progress
    if (stats.streak > 0) {
      const nextMilestone = stats.streak < 7 ? 7 : stats.streak < 30 ? 30 : 90;
      const daysToGo = nextMilestone - stats.streak;
      
      if (daysToGo <= 3) {
        insights.push({
          id: 'streak-milestone',
          type: 'success',
          priority: 'high',
          title: 'Streak Milestone Approaching!',
          message: `Only ${daysToGo} days until you reach a ${nextMilestone}-day streak!`
        });
      }
    }

    // Analyze task completion rate
    const recentTodos = todos.filter(todo => 
      todo.createdAt && differenceInDays(new Date(), new Date(todo.createdAt)) <= 7
    );
    
    if (recentTodos.length > 0) {
      const completionRate = recentTodos.filter(t => t.completed).length / recentTodos.length;
      if (completionRate < 0.5) {
        insights.push({
          id: 'low-completion',
          type: 'warning',
          priority: 'high',
          title: 'Task Completion Rate',
          message: 'Your weekly task completion rate is below 50%. Need help breaking down tasks?',
          action: {
            label: 'View Tasks',
            route: '/todos'
          }
        });
      }
    }

    // Level progress
    const nextLevelXp = Math.ceil(stats.xp / 100) * 100;
    const xpToNext = nextLevelXp - stats.xp;
    
    if (xpToNext <= 20) {
      insights.push({
        id: 'near-level',
        type: 'success',
        priority: 'medium',
        title: 'Almost Next Level!',
        message: `Only ${xpToNext} XP needed to reach level ${stats.level + 1}!`
      });
    }

    return insights;
  }

  public async analyzeAndNotify(todos: Todo[], stats?: UserStats, plans?: any[]) {
    // If stats weren't provided, compute them from stored data so AI always uses real data
    const effectiveStats = stats || calculateUserStats();

    // Generate insights
    const insights = this.generateSmartInsights(todos, effectiveStats, plans || []);
    
    insights.forEach(insight => {
      if (insight.type === 'warning' || insight.priority === 'high') {
        this.notify({
          id: `ai-${insight.id}`,
          title: insight.title,
          body: insight.message,
          type: 'insight',
          priority: insight.priority || 'medium',
          timestamp: new Date(),
          action: insight.action
        });
      }
    });

    // Check for upcoming deadlines
    const upcomingTodos = todos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return !todo.completed && hoursUntilDue > 0 && hoursUntilDue <= 24;
    });

    upcomingTodos.forEach(todo => {
      this.notify({
        id: `deadline-${todo.id}`,
        title: 'Upcoming Deadline',
        body: `"${todo.title}" is due ${format(new Date(todo.dueDate!), 'PP')}`,
        type: 'reminder',
        priority: 'high',
        timestamp: new Date(),
        action: {
          label: 'View Todo',
          route: `/todos?id=${todo.id}`
        }
      });
    });

    // Check study patterns and suggest optimal times
    if (effectiveStats.productiveHours) {
      const now = new Date();
      const currentHour = now.getHours();
      const nextProductiveHour = effectiveStats.productiveHours.findIndex(
        (productivity: number, hour: number) => hour > currentHour && productivity > 0.7
      );

      if (nextProductiveHour !== -1) {
        this.notify({
          id: `productive-time-${now.getTime()}`,
          title: 'Productive Time Coming Up',
          body: `Based on your patterns, you're usually very productive at ${nextProductiveHour}:00. Consider scheduling focused work then.`,
          type: 'insight',
          priority: 'medium',
          timestamp: new Date(),
          action: {
            label: 'Open Timer',
            route: '/timer'
          }
        });
      }
    }

    // Analyze achievement progress
  const nextLevelXp = Math.ceil(effectiveStats.xp / 100) * 100;
  const xpToNext = nextLevelXp - effectiveStats.xp;
    
  if (xpToNext <= 20) {
      this.notify({
        id: `level-up-soon-${stats.level}`,
        title: 'Almost There!',
    body: `Only ${xpToNext} XP needed to reach level ${effectiveStats.level + 1}!`,
        type: 'achievement',
        priority: 'medium',
        timestamp: new Date()
      });
    }
  }

  public getNotifications(): AINotification[] {
    return [...this.notifications].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public clearNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  public clearAll() {
    this.notifications = [];
  }
}

export const aiNotificationService = AINotificationService.getInstance();
