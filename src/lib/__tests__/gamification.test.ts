import { describe, it, expect, beforeEach } from 'vitest';
import { calculateUserStats } from '../gamification';

beforeEach(() => {
  // Clear localStorage keys used by calculateUserStats
  localStorage.removeItem('focusSessions');
  localStorage.removeItem('todos');
  localStorage.removeItem('planBoard');
  localStorage.removeItem('userProfile');
});

describe('calculateUserStats', () => {
  it('returns sensible defaults when no data is present', () => {
    const stats = calculateUserStats();
    expect(stats).toBeDefined();
    expect(stats.totalTodos).toBe(0);
    expect(typeof stats.totalFocusTime).toBe('number');
    expect(Array.isArray(stats.productiveHours)).toBe(true);
  });

  it('uses real stored focusSessions and todos data', () => {
    const now = Date.now();
    const focusSessions = [
      { id: 's1', startTime: new Date(now - 3600 * 1000).toISOString(), endTime: new Date(now).toISOString(), duration: 3600, subject: 'math', focusScore: 0.8 },
      { id: 's2', startTime: new Date(now - 7200 * 1000).toISOString(), endTime: new Date(now - 3600 * 1000).toISOString(), duration: 3600, subject: 'physics', focusScore: 0.6 }
    ];

    const todos = [
      { id: 't1', title: 'Test Todo', completed: true, priority: 'high', subject: 'math', createdAt: new Date().toISOString() }
    ];

    localStorage.setItem('focusSessions', JSON.stringify(focusSessions));
    localStorage.setItem('todos', JSON.stringify(todos));

    const stats = calculateUserStats();
    expect(stats.timerSessions.length).toBe(2);
    expect(stats.subjectStats['math']).toBeDefined();
    expect(stats.totalTodos).toBe(1);
    expect(stats.completedTodos).toBe(1);
  });
});
