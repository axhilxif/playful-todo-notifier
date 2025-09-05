import { UserStats } from '@/lib/achievements';
import { PlanItem } from '@/components/plan-board/PlanBoard';
import { Todo } from '@/types';
import { differenceInDays, format, isSameDay, isWithinInterval } from 'date-fns';

interface StudyPattern {
  subject: string;
  timeSpent: number;
  completedTasks: number;
  averageScore: number;
  preferredTimeOfDay: string;
}

interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
}

interface AIContext {
  studyPatterns: Map<string, StudyPattern>;
  lastUpdateTime: Date;
}

let aiContext: AIContext = {
  studyPatterns: new Map(),
  lastUpdateTime: new Date()
};

export function updateAIContext(plans: PlanItem[], todos: Todo[], stats: UserStats) {
  const patterns = new Map<string, StudyPattern>();
  
  // Analyze study patterns from timer sessions
  stats.timerSessions?.forEach(session => {
    const subject = session.subject;
    if (!subject) return;

    const pattern = patterns.get(subject) || {
      subject,
      timeSpent: 0,
      completedTasks: 0,
      averageScore: 0,
      preferredTimeOfDay: ''
    };

    pattern.timeSpent += session.duration;
    patterns.set(subject, pattern);
  });

  // Analyze todos by subject
  todos.forEach(todo => {
    if (!todo.subject) return;
    const pattern = patterns.get(todo.subject) || {
      subject: todo.subject,
      timeSpent: 0,
      completedTasks: 0,
      averageScore: 0,
      preferredTimeOfDay: ''
    };

    if (todo.completed) {
      pattern.completedTasks++;
    }
    patterns.set(todo.subject, pattern);
  });

  // Update preferred time of day
  patterns.forEach(pattern => {
    const subjectSessions = stats.timerSessions?.filter(s => s.subject === pattern.subject) || [];
    const timeDistribution = Array(24).fill(0);
    
    subjectSessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      timeDistribution[hour] += session.duration;
    });

    const maxHour = timeDistribution.indexOf(Math.max(...timeDistribution));
    pattern.preferredTimeOfDay = getTimeOfDay(maxHour);
  });

  aiContext = {
    studyPatterns: patterns,
    lastUpdateTime: new Date()
  };
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function generateSmartInsights(plans: PlanItem[], todos: Todo[], stats: UserStats) {
  const insights: SmartInsight[] = [];

  // Helper to add insights
  const addInsight = (insight: SmartInsight) => {
    insights.push(insight);
  };

  // 1. Analyze upcoming deadlines and suggest study plans
  plans.forEach(plan => {
    if (plan.dueDate) {
      const daysUntil = differenceInDays(new Date(plan.dueDate), new Date());
      if (daysUntil > 0 && daysUntil <= 7) {
        if (plan.subject && stats.subjectStats[plan.subject]) {
          const subjectStats = stats.subjectStats[plan.subject];
          const recentPerformance = stats.timerSessions
            .filter(s => s.subject === plan.subject)
            .slice(-3)
            .reduce((avg, s) => avg + s.focusScore, 0) / 3;

          addInsight({
            id: `deadline-${plan.id}`,
            type: 'warning',
            priority: daysUntil <= 3 ? 'high' : 'medium',
            title: `${plan.subject} Deadline Approaching`,
            message: `${plan.title} is due in ${daysUntil} days. Your recent focus score is ${Math.round(recentPerformance * 100)}%. Consider scheduling focused sessions during your peak hours.`,
            action: { label: 'Start Timer', route: `/timer?subject=${encodeURIComponent(plan.subject)}` }
          });
        }
      }
    }
  });

  // 2. Analyze subject patterns and suggest improvements
  Object.entries(stats.subjectStats).forEach(([subject, subjectStat]) => {
    const recentSessions = stats.timerSessions
      .filter(s => s.subject === subject)
      .slice(-5);
      
    const lastSession = recentSessions[recentSessions.length - 1];
    const daysSinceLastStudy = lastSession
      ? differenceInDays(new Date(), new Date(lastSession.startTime))
      : Infinity;

    if (daysSinceLastStudy > 3) {
      const pendingTodos = todos.filter(t => 
        t.subject === subject && !t.completed
      ).length;

      if (pendingTodos > 0) {
        addInsight({
          id: `subject-attention-${subject}`,
          type: 'warning',
          priority: 'medium',
          title: `${subject} Needs Attention`,
          message: `You haven't studied ${subject} for ${daysSinceLastStudy} days and have ${pendingTodos} pending tasks.`,
          action: { label: 'Start Timer', route: `/timer?subject=${encodeURIComponent(subject)}` }
        });
      }
    }

    // Check for performance trends
    if (recentSessions.length >= 3) {
      const avgScore = recentSessions.reduce((sum, s) => sum + s.focusScore, 0) / recentSessions.length;
      if (avgScore < subjectStat.averageScore * 0.8) {
        addInsight({
          id: `performance-drop-${subject}`,
          type: 'warning',
          priority: 'high',
          title: `${subject} Performance Drop`,
          message: `Your recent focus scores in ${subject} are ${Math.round((1 - avgScore/subjectStat.averageScore) * 100)}% below your average. Consider shorter, more focused sessions.`,
          action: { label: 'View Stats', route: `/profile?subject=${encodeURIComponent(subject)}` }
        });
      }
    }

    // New: Insight for subjects with low focus scores
    if (subjectStat.sessionsCount > 3 && subjectStat.averageScore < 0.6) {
      addInsight({
        id: `low-focus-score-${subject}`,
        type: 'warning',
        priority: 'medium',
        title: `Low Focus in ${subject}`,
        message: `Your average focus score for ${subject} is quite low (${Math.round(subjectStat.averageScore * 100)}%). Try eliminating distractions or using shorter focus sessions.`,
        action: { label: 'Improve Focus', route: `/timer?subject=${encodeURIComponent(subject)}` }
      });
    }
  });

  // 3. Analyze recent productivity trends
  const recentTodos = todos.filter(todo => 
    todo.createdAt && differenceInDays(new Date(), new Date(todo.createdAt)) <= 7
  );
  
  if (recentTodos.length > 0) {
    const completionRate = recentTodos.filter(t => t.completed).length / recentTodos.length;
    const previousWeekTodos = todos.filter(todo => {
      const createdAt = new Date(todo.createdAt);
      return differenceInDays(new Date(), createdAt) <= 14 && 
             differenceInDays(new Date(), createdAt) > 7;
    });
    const previousCompletionRate = previousWeekTodos.length > 0
      ? previousWeekTodos.filter(t => t.completed).length / previousWeekTodos.length
      : 1;

    if (completionRate < 0.6 || completionRate < previousCompletionRate * 0.8) {
      addInsight({
        id: 'productivity-drop',
        type: 'warning',
        priority: 'high',
        title: 'Productivity Alert',
        message: completionRate < previousCompletionRate * 0.8
          ? `Your task completion rate has dropped by ${Math.round((1 - completionRate/previousCompletionRate) * 100)}% compared to last week.`
          : `Your weekly task completion rate is ${Math.round(completionRate * 100)}%. Need help breaking down tasks?`,
        action: { label: 'View Tasks', route: '/todos' }
      });
    }

    // New: Consistent productivity
    if (completionRate >= 0.8 && previousCompletionRate >= 0.8) {
      addInsight({
        id: 'consistent-productivity',
        type: 'success',
        priority: 'low',
        title: 'Consistent Productivity!',
        message: `Great job! You've maintained a high task completion rate of ${Math.round(completionRate * 100)}% this week.`,
      });
    }
  }

  // 4. Consistency/Streak Insights
  if (stats.streak > 0) {
    addInsight({
      id: 'streak-motivation',
      type: 'info',
      priority: 'low',
      title: 'Keep the Streak Alive!',
      message: `You're on a ${stats.streak}-day streak! Keep up the great work to unlock more achievements.`,
      action: { label: 'View Achievements', route: '/profile' }
    });
  }

  // New: Broken streak insight
  if (stats.streak === 0 && stats.lastActive && differenceInDays(new Date(), stats.lastActive) > 1) {
    addInsight({
      id: 'broken-streak',
      type: 'warning',
      priority: 'medium',
      title: 'Streak Broken',
      message: `It looks like your streak was broken. Don't worry, every day is a new chance to start building it again!`,
      action: { label: 'Start a Todo', route: '/todos' }
    });
  }

  // 5. Time Management Insights
  // New: Optimal study hours
  const optimalHour = stats.productiveHours.indexOf(Math.max(...stats.productiveHours));
  if (optimalHour !== -1 && stats.productiveHours[optimalHour] > 0) {
    addInsight({
      id: 'optimal-study-hour',
      type: 'info',
      priority: 'low',
      title: 'Your Peak Productivity Hour',
      message: `You tend to be most productive around ${optimalHour}:00. Try scheduling your most challenging tasks during this time.`,
    });
  }

  // New: Long sessions without breaks
  stats.timerSessions.forEach(session => {
    if (session.duration > 3600 && session.breaks === 0) { // Sessions longer than 1 hour with no breaks
      addInsight({
        id: `long-session-no-break-${session.id}`,
        type: 'warning',
        priority: 'low',
        title: 'Consider a Break',
        message: `You had a long focus session (${Math.round(session.duration / 60)} minutes) without any breaks. Remember to take short breaks to maintain focus and prevent burnout.`,
        action: { label: 'Learn about Breaks', route: '/settings' } // Assuming settings has info on breaks
      });
    }
  });

  // New: Suggest working on high priority todos
  const highPriorityPendingTodos = todos.filter(t => t.priority === 'high' && !t.completed).length;
  if (highPriorityPendingTodos > 0) {
    addInsight({
      id: 'high-priority-todos',
      type: 'warning',
      priority: 'high',
      title: 'High Priority Tasks Awaiting',
      message: `You have ${highPriorityPendingTodos} high-priority tasks that need your attention. Tackle them first for maximum impact!`,
      action: { label: 'View High Priority', route: '/todos' }
    });
  }

  // New: Suggest creating plans if few exist
  if (stats.planBoardItems < 5) {
    addInsight({
      id: 'create-more-plans',
      type: 'info',
      priority: 'low',
      title: 'Plan Your Success',
      message: 'Creating plans helps you visualize your goals and stay organized. Try adding a few more items to your plan board!',
      action: { label: 'Create Plan', route: '/plan' }
    });
  }

  return insights;
}

// Schedule notification check
export function scheduleNotifications(insights: ReturnType<typeof generateSmartInsights>) {
  insights.forEach(insight => {
    if (insight.type === 'warning') {
      // Schedule high-priority notifications
      scheduleNotification({
        title: insight.title,
        body: insight.message,
        timestamp: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        priority: 'high'
      });
    }
  });
}

interface NotificationPayload {
  title: string;
  body: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

function scheduleNotification(notification: NotificationPayload) {
  // Implementation depends on your notification service
  console.log('Scheduling notification:', notification);
  // TODO: Implement actual notification scheduling
}
