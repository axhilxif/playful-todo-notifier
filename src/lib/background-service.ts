
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

class BackgroundService {
  private static instance: BackgroundService;
  private isRunning = false;

  static getInstance(): BackgroundService {
    if (!BackgroundService.instance) {
      BackgroundService.instance = new BackgroundService();
    }
    return BackgroundService.instance;
  }

  start() {
    if (this.isRunning || Capacitor.getPlatform() !== 'android') {
      return;
    }

    this.isRunning = true;
    console.log('Background service started');

    setInterval(async () => {
      console.log('Background service running');
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        console.log(`${pending.notifications.length} pending notifications found. Re-scheduling...`);
        await LocalNotifications.schedule({ notifications: pending.notifications });
      }
    }, 60 * 1000); // Run every minute
  }

  stop() {
    this.isRunning = false;
    console.log('Background service stopped');
  }
}

export const backgroundService = BackgroundService.getInstance();
