export interface User {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  notificationTime?: Date;
}

export interface TimeSlot {
  id: string;
  title: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  days: number[];    // 0-6 (Sunday-Saturday)
  color: string;
  notifications: boolean;
  reminderBefore: number; // minutes before
}

export interface TimerSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isActive: boolean;
  pausedTime?: number;
}

export interface NotificationSettings {
  enabled: boolean;
  breakReminders: boolean;
  breakInterval: number; // minutes
  todoReminders: boolean;
  timetableReminders: boolean;
}