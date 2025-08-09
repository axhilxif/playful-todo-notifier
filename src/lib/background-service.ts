
import { Capacitor } from '@capacitor/core';
import { scheduleAllReminders } from './notification-scheduler';
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
      await scheduleAllReminders();
    });
  }

  stop() {
    persistentJobScheduler.unregister('reminderScheduler');
  }
}

export const backgroundService = BackgroundService.getInstance();
