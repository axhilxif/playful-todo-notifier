
import { Capacitor } from '@capacitor/core';
import { notificationService } from './notification-service';
import { persistentJobScheduler } from './persistent-job-scheduler';

class BackgroundService {
  private static instance: BackgroundService;

  static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  start() {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    persistentJobScheduler.register('reminderScheduler', 5 * 60 * 1000, async () => {
      console.log('Running reminder scheduler job');
      await notificationService.scheduleAllReminders();
    });

    persistentJobScheduler.register('aiSuggestionScheduler', 24 * 60 * 60 * 1000, async () => {
      console.log('Running AI suggestion scheduler job');
      await notificationService.scheduleAISuggestionNotification();
    });
  }

  stop() {
    persistentJobScheduler.unregister('reminderScheduler');
    persistentJobScheduler.unregister('aiSuggestionScheduler');
  }
}

export const backgroundService = BackgroundService.getInstance();
