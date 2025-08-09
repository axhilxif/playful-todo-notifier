
import { ACHIEVEMENTS, Achievement, UserStats } from './achievements';
import { getTodos, setTodos } from './storage';
import { Todo } from '@/types';
import { sendImmediateNotification } from './notification-scheduler';

export interface UserProfile {
  level: number;
  xp: number;
  achievements: string[];
  lastLoginDate: string;
  streak: number;
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
    level: 1,
    xp: 0,
    achievements: [],
    lastLoginDate: new Date().toISOString(),
    streak: 0,
  });
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
    const planBoard = safeJSONParse<any[]>('planBoard', []);
    const profile = loadUserProfile();

    const completedTodos = todos.filter((todo: any) => todo.completed);
    const totalFocusSeconds = focusSessions.reduce((total: number, session: any) => total + session.duration, 0);

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


    const earlyBirdSessions = focusSessions.filter(s => new Date(s.startTime).getHours() < 8).length;
    const nightOwlSessions = focusSessions.filter(s => new Date(s.startTime).getHours() >= 22).length;
    const weekendSessions = focusSessions.filter(s => [0, 6].includes(new Date(s.startTime).getDay())).length;
    const longestSession = focusSessions.reduce((max, s) => Math.max(max, s.duration), 0) / 60;

    const completedHighPriorityTodos = todos.filter(t => t.completed && t.priority === 'high').length;
    const plansCreatedInAdvance = planBoard.filter(p => new Date(p.date).getTime() > new Date().getTime() + 24 * 60 * 60 * 1000).length;
    const completedOnTimeTodos = todos.filter(t => t.completed && t.dueDate && new Date(t.completedAt) <= new Date(t.dueDate)).length;


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
        perfectDays: 0, // Needs more complex daily tracking logic
        longestSession,
        weekendSessions,
        totalBreaks: 0, // Needs tracking
        completedHighPriorityTodos,
        plansCreatedInAdvance,
        completedOnTimeTodos,
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
  const unlocked = new Set(profile.achievements);
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && achievement.condition(stats)) {
      unlocked.add(achievement.id);
      newlyUnlocked.push(achievement);
      awardXP(achievement.reward.xp);
      sendImmediateNotification('🏆 Achievement Unlocked!', `You've earned the "${achievement.name}" achievement!`, 'achievements');
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
        sendImmediateNotification('⭐ Level Up!', `Congratulations! You've reached level ${newLevel}!`, 'level_ups');
    }
    const newAchievements = checkAndUnlockAchievements();

    return { levelUp, newLevel, newAchievements };
}
