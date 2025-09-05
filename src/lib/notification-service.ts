import { LocalNotifications, Channel } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { getTodos, getTimeSlots } from './storage';
import { getNextOccurrence } from './date-utils';
import { getAllSuggestions, AISuggestion } from './ai-suggestions'; // Import necessary types and functions
import { calculateUserStats } from './gamification'; // To get user stats for suggestions

class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      console.info('Notification service is disabled on the web platform.');
      this.isInitialized = true;
      return;
    }

    try {
      const permissionsGranted = await this.requestPermissions();
      if (!permissionsGranted) {
        throw new Error('Notification permissions not granted.');
      }
      this.isInitialized = true;
      console.log('Notification service initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  public async createChannels(channels: Channel[]): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') return;
    try {
      await LocalNotifications.createChannels({ channels });
    } catch (error) {
      console.error('Error creating notification channels:', error);
    }
  }

  public async scheduleTodoReminder(todo: any): Promise<void> {
    if (!todo.notificationTime) return;

    const notificationTime = new Date(todo.notificationTime);
    if (notificationTime > new Date()) {
      await this.schedule({
        id: this.generateId(todo.id),
        title: '📝 Todo Reminder',
        body: `Don't forget: ${todo.title}`,
        schedule: { at: notificationTime, allowWhileIdle: true },
        channelId: 'reminders',
      });
    }
  }

  public async scheduleTimetableReminder(slot: any): Promise<void> {
    const nextOccurrence = getNextOccurrence(slot.days, slot.startTime);
    if (nextOccurrence) {
      await this.schedule({
        id: this.generateId(slot.id),
        title: '📅 Scheduled Activity',
        body: `Time for: ${slot.title}`,
        schedule: { at: nextOccurrence, allowWhileIdle: true },
        channelId: 'timetable',
      });
    }
  }

  public async scheduleImmediateNotification(title: string, body: string, channelId: string): Promise<void> {
    await this.schedule({
      id: this.generateId(),
      title,
      body,
      schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
      channelId,
    });
  }

  public async cancel(id: string): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id: this.generateId(id) }] });
    } catch (error) {
      console.error(`Error canceling notification ${id}:`, error);
    }
  }

  public async scheduleAllReminders(): Promise<void> {
    const todos = getTodos();
    const timeSlots = getTimeSlots();
    const pending = await LocalNotifications.getPending();
    const scheduledIds = new Set(pending.notifications.map(n => n.id));

    for (const todo of todos) {
      if (!scheduledIds.has(this.generateId(todo.id))) {
        await this.scheduleTodoReminder(todo);
      }
    }

    for (const slot of timeSlots) {
      if (!scheduledIds.has(this.generateId(slot.id))) {
        await this.scheduleTimetableReminder(slot);
      }
    }
  }

  public async scheduleAISuggestionNotification(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      console.info('Skipping AI suggestion notification on web platform.');
      return;
    }

    try {
      const stats = calculateUserStats();
      const suggestions = getAllSuggestions(stats);

      if (suggestions.length > 0) {
        // Pick a random high or medium priority suggestion
        const relevantSuggestions = suggestions.filter(s => s.priority === 'high' || s.priority === 'medium');
        const suggestion = relevantSuggestions.length > 0
          ? relevantSuggestions[Math.floor(Math.random() * relevantSuggestions.length)]
          : suggestions[0]; // Fallback to any suggestion

        await this.schedule({
          id: this.generateId(`ai-suggestion-${suggestion.id}-${Date.now()}`), // Unique ID for each suggestion notification
          title: `💡 StudyBuddy Insight: ${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}`,
          body: suggestion.message,
          schedule: { at: new Date(Date.now() + 5000), allowWhileIdle: true }, // Schedule 5 seconds from now for testing
          channelId: 'suggestions', // New channel for suggestions
          extra: { suggestionId: suggestion.id, suggestionType: suggestion.type },
        });
        console.log(`Scheduled AI suggestion notification: ${suggestion.message}`);
      }
    } catch (error) {
      console.error('Error scheduling AI suggestion notification:', error);
    }
  }

  public async playHaptic(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
    if (Capacitor.getPlatform() === 'web') return;
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.error('Error playing haptic feedback:', error);
    }
  }

  public async requestPermissions(): Promise<boolean> {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  }

  private async schedule(notification: any): Promise<void> {
    try {
      await LocalNotifications.schedule({ notifications: [notification] });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  private generateId(entityId?: string): number {
    if (entityId) {
      // Simple hash function to convert string IDs to a number
      let hash = 0;
      for (let i = 0; i < entityId.length; i++) {
        const char = entityId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
      }
      // Ensure the ID is positive and within a reasonable range for notifications
      return Math.abs(hash % 100000000); // Max 8 digits
    }
    return Math.floor(Math.random() * 1000000); // Fallback for immediate notifications
  }
}

export const notificationService = NotificationService.getInstance();