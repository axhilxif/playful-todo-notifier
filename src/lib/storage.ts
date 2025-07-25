import { User, Todo, TimeSlot, NotificationSettings, TimerSession } from '@/types';

const STORAGE_KEYS = {
  USER: 'todo-app-user',
  TODOS: 'todo-app-todos',
  TIMETABLE: 'todo-app-timetable',
  SETTINGS: 'todo-app-settings',
  TIMER: 'todo-app-timer',
} as const;

// User storage
export const getUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

export const setUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

// Todos storage
export const getTodos = (): Todo[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TODOS);
  return stored ? JSON.parse(stored) : [];
};

export const setTodos = (todos: Todo[]): void => {
  localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
};

// Timetable storage
export const getTimeSlots = (): TimeSlot[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
  return stored ? JSON.parse(stored) : [];
};

export const setTimeSlots = (timeSlots: TimeSlot[]): void => {
  localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timeSlots));
};

// Settings storage
export const getSettings = (): NotificationSettings => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : {
    enabled: true,
    breakReminders: true,
    breakInterval: 25,
    todoReminders: true,
    timetableReminders: true,
  };
};

export const setSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Timer storage
export const getTimerSession = (): TimerSession | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.TIMER);
  return stored ? JSON.parse(stored) : null;
};

export const setTimerSession = (session: TimerSession | null): void => {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.TIMER);
  }
};