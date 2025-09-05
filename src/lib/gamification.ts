
import { ACHIEVEMENTS, Achievement, UserStats } from './achievements';
import { getTodos, setTodos } from './storage';
import { Todo } from '@/types';
import { notificationService } from './notification-service';

export interface Pet {
  name: string;
  hunger: number; // 0-100
  happiness: number; // 0-100
  isAlive: boolean;
  head: string; // e.g., 'default', 'cat', 'dog'
  lastFed: string; // ISO date string
  lastPlayed: string; // ISO date string
  favoriteSubject: string; // New: Pet's favorite subject based on user activity
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  joinDate: string;
  level: number;
  xp: number;
  achievements: string[];
  favoriteEmoji: string;
  lastLoginDate: string;
  streak: number;
  totalBreaks: number;
  pet: Pet; // Add pet to user profile
}

const safeJSONParse = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const loadUserProfile = (): UserProfile => {
  const profile = safeJSONParse<UserProfile>('userProfile', {
    name: 'Productivity Hero',
    bio: 'On a journey to make every day count! ✨',
    avatar: '',
    joinDate: new Date().toISOString(),
    level: 1,
    xp: 0,
    achievements: [],
    favoriteEmoji: '🚀',
    lastLoginDate: new Date().toISOString(),
    streak: 0,
    totalBreaks: 0,
    pet: { // Default pet values
      name: 'Buddy',
      hunger: 50,
      happiness: 50,
      isAlive: true,
      head: 'default',
      lastFed: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      favoriteSubject: 'General', // Default favorite subject
    },
  });

  // Ensure pet object is always present and has default values
  if (!profile.pet) {
    profile.pet = {
      name: 'Buddy',
      hunger: 50,
      happiness: 50,
      isAlive: true,
      head: 'default',
      lastFed: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      favoriteSubject: 'General',
    };
  }

  return profile;
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem('userProfile', JSON.stringify(profile));
};

export const calculateLevel = (xp: number): { level: number; xpForNextLevel: number; progress: number } => {
  let level = 1;
  let xpNeeded = 100;
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.2);
  }
  return { level, xpForNextLevel: xpNeeded, progress: (xp / xpNeeded) * 100 };
};

export const calculateUserStats = (): UserStats => {
    const todos = getTodos();
    const focusSessions = safeJSONParse<any[]>('focusSessions', []);
    console.log('Raw focusSessions from localStorage:', localStorage.getItem('focusSessions')); // Add this
    console.log('Parsed focusSessions:', focusSessions); // Add this
    console.log('focusSessions.length:', focusSessions.length); // Add this
    const planBoard = safeJSONParse<any[]>('planBoard', []);
    const profile = loadUserProfile();

    const completedTodos = todos.filter((todo: any) => todo.completed);
  const totalFocusSeconds = focusSessions.reduce((total: number, session: any) => total + session.duration, 0);
    
    // Calculate productive hours
    const productiveHours = Array(24).fill(0);
    focusSessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        productiveHours[hour] += session.duration / 3600; // Convert to hours
    });

    // Calculate focus sessions per day
    const sessionsByDay = focusSessions.reduce((acc: { [key: string]: number }, session) => {
        const day = new Date(session.startTime).toDateString();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {});
    const focusSessionsPerDay = Object.values(sessionsByDay) as number[];

    // Calculate weekly stats
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weeklyStats = {
        completedTodos: completedTodos.filter(todo => new Date(todo.completedAt) >= weekStart).length,
        focusTime: focusSessions
            .filter(session => new Date(session.startTime) >= weekStart)
            .reduce((total, session) => total + session.duration / 3600, 0),
        streak: profile.streak
    };

    // Calculate averages
    const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(profile.joinDate).getTime()) / (1000 * 60 * 60 * 24)));
    const averages = {
        dailyFocusTime: (totalFocusSeconds / 3600) / totalDays,
        dailyCompletedTodos: completedTodos.length / totalDays,
        sessionsPerDay: focusSessions.length / totalDays
    };

    // More accurate streak calculation
    const today = new Date().toDateString();
    const lastLogin = new Date(profile.lastLoginDate).toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let streak = profile.streak || 0;
    if (lastLogin !== today && lastLogin === yesterday) {
        streak++;
    } else if (lastLogin !== today) {
        streak = 1; // Reset if login gap is more than a day
    }
    
    // Update last login date for next time
    profile.lastLoginDate = new Date().toISOString();
    profile.streak = streak;
    saveUserProfile(profile);

    // Perfect Days Calculation
    const todosByDay: { [key: string]: { total: number; completed: number } } = {};
    todos.forEach(todo => {
        if (todo.dueDate) {
            const dueDate = new Date(todo.dueDate).toDateString();
            if (!todosByDay[dueDate]) {
                todosByDay[dueDate] = { total: 0, completed: 0 };
            }
            todosByDay[dueDate].total++;
            if (todo.completed) {
                // If completedAt exists, check if it was completed on the due date
                // If completedAt doesn't exist but todo is completed, count it anyway
                if (!todo.completedAt || new Date(todo.completedAt).toDateString() === dueDate) {
                    todosByDay[dueDate].completed++;
                }
            }
        }
    });

    let perfectDaysCount = 0;
    for (const day in todosByDay) {
        if (todosByDay[day].total > 0 && todosByDay[day].total === todosByDay[day].completed) {
            perfectDaysCount++;
        }
    }

    const earlyBirdSessions = focusSessions.filter(s => new Date(s.startTime).getHours() < 8).length;
    const nightOwlSessions = focusSessions.filter(s => new Date(s.startTime).getHours() >= 22).length;
    const weekendSessions = focusSessions.filter(s => [0, 6].includes(new Date(s.startTime).getDay())).length;
    const longestSession = focusSessions.reduce((max, s) => Math.max(max, s.duration), 0) / 60;

    const completedHighPriorityTodos = todos.filter(t => t.completed && t.priority === 'high').length;
    const plansCreatedInAdvance = planBoard.filter(p => new Date(p.date).getTime() > new Date().getTime() + 24 * 60 * 60 * 1000).length;
    const completedOnTimeTodos = todos.filter(t => 
        t.completed && t.dueDate && (!t.completedAt || new Date(t.completedAt) <= new Date(t.dueDate))
    ).length;


    return {
        totalTodos: todos.length,
        completedTodos: completedTodos.length,
        totalFocusTime: Math.round(totalFocusSeconds / 3600 * 10) / 10,
        planBoardItems: planBoard.length,
        streak: profile.streak,
        level: profile.level,
        xp: profile.xp,
        focusSessions: focusSessions.length,
        earlyBirdSessions,
        nightOwlSessions,
        perfectDays: perfectDaysCount,
        longestSession,
        weekendSessions,
        totalBreaks: profile.totalBreaks,
        completedHighPriorityTodos,
        plansCreatedInAdvance,
        completedOnTimeTodos,
        achievements: profile.achievements,
        productiveHours,
        focusSessionsPerDay,
        lastActive: new Date(profile.lastLoginDate),
        weeklyStats: {
            completedTodos: completedTodos.filter(todo => 
                todo.completedAt && new Date(todo.completedAt) >= weekStart
            ).length,
            focusTime: focusSessions
                .filter(session => new Date(session.startTime) >= weekStart)
                .reduce((total, session) => total + session.duration / 3600, 0),
            streak: profile.streak
        },
        averages: {
            dailyFocusTime: Math.round((totalFocusSeconds / 3600) / totalDays * 10) / 10,
            dailyCompletedTodos: Math.round(completedTodos.length / totalDays * 10) / 10,
            sessionsPerDay: Math.round(focusSessions.length / totalDays * 10) / 10
        },
    // Include raw timer session data so other modules can analyze real sessions
    timerSessions: focusSessions.map(s => ({
      id: s.id || `${s.startTime}-${s.duration}`,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      subject: s.subject,
      breaks: s.breaks || 0,
      focusScore: typeof s.focusScore === 'number' ? s.focusScore : 0
    })),
    // Derive per-subject stats from timer sessions and todos
    subjectStats: (() => {
      const stats: any = {};
      // Initialize from todos' subjects
      todos.forEach((t: any) => {
        if (!t.subject) return;
        if (!stats[t.subject]) {
          stats[t.subject] = { totalTime: 0, averageScore: 0, sessionsCount: 0, lastStudied: new Date().toISOString() };
        }
      });

      // Accumulate from focus sessions
      focusSessions.forEach(s => {
        if (!s.subject) return;
        if (!stats[s.subject]) {
          stats[s.subject] = { totalTime: 0, averageScore: 0, sessionsCount: 0, lastStudied: new Date().toISOString() };
        }
        stats[s.subject].totalTime += s.duration;
        stats[s.subject].averageScore = ((stats[s.subject].averageScore * stats[s.subject].sessionsCount) + (s.focusScore || 0)) / (stats[s.subject].sessionsCount + 1);
        stats[s.subject].sessionsCount += 1;
        stats[s.subject].lastStudied = s.startTime || new Date().toISOString();
      });

      return stats;
    })()
    };
};


export const awardXP = (amount: number): { levelUp: boolean; newLevel: number } => {
  const profile = loadUserProfile();
  const oldLevel = calculateLevel(profile.xp).level;
  profile.xp += amount;
  const newLevelInfo = calculateLevel(profile.xp);
  profile.level = newLevelInfo.level;
  saveUserProfile(profile);
  
  const levelUp = newLevelInfo.level > oldLevel;
  return { levelUp, newLevel: newLevelInfo.level };
};

export const checkAndUnlockAchievements = (): Achievement[] => {
  const stats = calculateUserStats();
  const profile = loadUserProfile();
  
  // Ensure profile.achievements is an array before creating a Set
  const safeAchievements = Array.isArray(profile.achievements) ? profile.achievements : [];
  const unlocked = new Set(safeAchievements);
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && achievement.condition(stats)) {
      unlocked.add(achievement.id);
      newlyUnlocked.push(achievement);
      awardXP(achievement.reward.xp);
      notificationService.scheduleImmediateNotification('🏆 Achievement Unlocked!', `You've earned the "${achievement.name}" achievement!`, 'achievements');
    }
  }

  if (newlyUnlocked.length > 0) {
    profile.achievements = Array.from(unlocked);
    saveUserProfile(profile);
  }
  
  return newlyUnlocked;
};

export const processUserAction = (action: 'complete-todo' | 'complete-focus-session' | 'create-plan') => {
    let xp = 0;
    switch(action) {
        case 'complete-todo':
            xp = 25;
            break;
        case 'complete-focus-session':
            xp = 50;
            break;
        case 'create-plan':
            xp = 10;
            break;
    }
    const { levelUp, newLevel } = awardXP(xp);
    if (levelUp) {
        notificationService.scheduleImmediateNotification('⭐ Level Up!', `Congratulations! You've reached level ${newLevel}!`, 'level_ups');
    }
    const newAchievements = checkAndUnlockAchievements();

    return { levelUp, newLevel, newAchievements };
}
