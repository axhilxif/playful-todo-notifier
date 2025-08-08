
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export class BackgroundNotificationManager {
  private static instance: BackgroundNotificationManager;
  private isInitialized = false;

  static getInstance(): BackgroundNotificationManager {
    if (!BackgroundNotificationManager.instance) {
      BackgroundNotificationManager.instance = new BackgroundNotificationManager();
    }
    return BackgroundNotificationManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions first
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Set up persistent scheduling
      await this.setupBackgroundScheduling();
      
      // Listen for app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          this.ensureBackgroundNotifications();
        }
      });

      this.isInitialized = true;
      console.log('Background notification manager initialized');
    } catch (error) {
      console.error('Failed to initialize background notifications:', error);
    }
  }

  private async setupBackgroundScheduling(): Promise<void> {
    // Clear existing notifications
    await LocalNotifications.cancel({ notifications: [] });

    // Schedule recurring notifications that work in background
    const now = new Date();
    const notifications = [];

    // Schedule break reminders for the next 24 hours
    for (let i = 1; i <= 48; i++) {
      const scheduledTime = new Date(now.getTime() + (i * 25 * 60 * 1000)); // Every 25 minutes
      notifications.push({
        id: 1000 + i,
        title: '⏰ Break Time!',
        body: 'Time to take a short break and rest your eyes! 👀',
        schedule: { at: scheduledTime },
        sound: 'default',
        actionTypeId: 'BREAK_REMINDER',
        extra: { type: 'break' }
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${notifications.length} background notifications`);
    }
  }

  private async ensureBackgroundNotifications(): Promise<void> {
    // Re-schedule notifications when app goes to background
    setTimeout(() => {
      this.setupBackgroundScheduling();
    }, 1000);
  }

  async scheduleCustomNotification(
    id: number,
    title: string,
    body: string,
    scheduledAt: Date,
    recurring: boolean = false
  ): Promise<void> {
    const notification = {
      id,
      title,
      body,
      schedule: { at: scheduledAt },
      sound: 'default',
      actionTypeId: 'CUSTOM',
      extra: { recurring }
    };

    await LocalNotifications.schedule({ notifications: [notification] });
    console.log(`Scheduled custom notification: ${title}`);
  }
}

// Initialize the background notification manager
export const backgroundNotificationManager = BackgroundNotificationManager.getInstance();
