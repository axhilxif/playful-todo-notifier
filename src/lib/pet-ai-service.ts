import { UserStats, UserProfile } from './gamification';
import { loadUserProfile } from './gamification';
import { getAllSuggestionsAuto, AISuggestion } from './ai-suggestions';

export const generatePetSuggestion = (stats: UserStats): string => {
  const profile = loadUserProfile();
  const pet = profile.pet;

  const specificSuggestions: string[] = [];

  // High-priority, specific suggestions based on user data
  // 1. Overdue Todos
  if (stats.totalTodos > 0) {
    const overdueTodos = stats.timerSessions.filter(s => s.type === 'todo' && !s.completed && s.dueDate && new Date(s.dueDate) < new Date()).length;
    if (overdueTodos > 0) {
      specificSuggestions.push(`(AI Pet says): You have ${overdueTodos} overdue tasks, ${profile.name}! Let's tackle them together to clear your plate.`);
    }
  }

  // 2. Struggling Subjects (based on exam scores)
  if (stats.subjectStats) {
    for (const subject in stats.subjectStats) {
      const subjectInfo = stats.subjectStats[subject];
      if (subjectInfo.exams > 0 && subjectInfo.avg < 60 && subjectInfo.totalTime > 0) {
        specificSuggestions.push(`(AI Pet says): I noticed your average in ${subject} is ${subjectInfo.avg}%. Maybe we can spend some extra focus time there?`);
      }
    }
  }

  // If specific suggestions are found, pick one randomly
  if (specificSuggestions.length > 0) {
    return specificSuggestions[Math.floor(Math.random() * specificSuggestions.length)];
  }

  // Fallback to general AI suggestions from ai-suggestions.ts
  const aiSuggestions = getAllSuggestionsAuto(stats);

  // Filter for high or medium priority suggestions first
  const relevantSuggestions = aiSuggestions.filter(
    (s) => s.priority === 'high' || s.priority === 'medium'
  );

  if (relevantSuggestions.length > 0) {
    const randomAISuggestion = relevantSuggestions[Math.floor(Math.random() * relevantSuggestions.length)];
    return `(AI Pet says): ${randomAISuggestion.message}`;
  }

  // Fallback to general pet care reminders or encouraging messages if no AI suggestions
  const fallbackSuggestions: string[] = [];

  if (pet.hunger > 70) {
    fallbackSuggestions.push(`I'm feeling a bit hungry, ${profile.name}! A quick snack would make me happy.`);
  }
  if (pet.happiness < 30) {
    fallbackSuggestions.push(`I'm a little down, ${profile.name}. Let's play a bit!`);
  }
  if (!pet.isAlive) {
    fallbackSuggestions.push(`It's a bit lonely here without a companion, ${profile.name}. Maybe it's time for a new pet?`);
  }

  if (fallbackSuggestions.length > 0) {
    return fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
  }

  return `You're doing great, ${profile.name}! Keep up the fantastic work!`;
};