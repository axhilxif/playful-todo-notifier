import { ACHIEVEMENTS, Achievement, UserStats } from './achievements';

// Utility to compute user stats from localStorage (simplified for demo)
function getUserStats(): UserStats {
  const todos = JSON.parse(localStorage.getItem('todo-app-todos') || '[]');
  const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
  const planBoard = JSON.parse(localStorage.getItem('planBoard') || '[]');
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

  // Calculate streak
  let streak = 0;
  const today = new Date();
  const dailyActivity = new Array(7).fill(false);
  todos.forEach((todo: any) => {
    if (todo.completed) {
      const completedDate = new Date(todo.completedAt);
      const dayDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff < 7) {
        dailyActivity[dayDiff] = true;
      }
    }
  });
  for (const active of dailyActivity) {
    if (active) streak++;
    else break;
  }

  // Calculate perfect days
  let perfectDays = 0;
  // ... (implement as needed)

  // Calculate longest session
  let longestSession = 0;
  focusSessions.forEach((s: any) => {
    if (s.duration > longestSession) longestSession = s.duration / 60;
  });

  return {
    totalTodos: todos.length,
    completedTodos: todos.filter((t: any) => t.completed).length,
    totalFocusTime: Math.round(focusSessions.reduce((acc: number, s: any) => acc + s.duration, 0) / 3600),
    planBoardItems: planBoard.length,
    streak,
    level: userProfile.level || 1,
    xp: userProfile.xp || 0,
    focusSessions: focusSessions.length,
    earlyBirdSessions: 0, // implement as needed
    nightOwlSessions: 0, // implement as needed
    perfectDays,
    longestSession,
    weekendSessions: 0, // implement as needed
    totalBreaks: 0, // implement as needed
  };
}

export function checkAndUnlockAchievements() {
  const stats = getUserStats();
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const unlocked = new Set(userProfile.achievements || []);
  let unlockedNew = false;

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && achievement.condition(stats)) {
      unlocked.add(achievement.id);
      unlockedNew = true;
      // Optionally: show toast/notification here
    }
  }

  if (unlockedNew) {
    userProfile.achievements = Array.from(unlocked);
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    // Optionally: trigger UI update/event
  }
}
