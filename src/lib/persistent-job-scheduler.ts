
import { Capacitor } from '@capacitor/core';

class PersistentJobScheduler {
  private static instance: PersistentJobScheduler;
  private jobs: { [key: string]: any } = {};

  static getInstance(): PersistentJobScheduler {
    if (!PersistentJobScheduler.instance) {
      PersistentJobScheduler.instance = new PersistentJobScheduler();
    }
    return PersistentJobScheduler.instance;
  }

  register(jobName: string, interval: number, task: () => Promise<void>) {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    this.jobs[jobName] = setInterval(task, interval);
    console.log(`Job registered: ${jobName}`);
  }

  unregister(jobName: string) {
    if (this.jobs[jobName]) {
      clearInterval(this.jobs[jobName]);
      delete this.jobs[jobName];
      console.log(`Job unregistered: ${jobName}`);
    }
  }
}

export const persistentJobScheduler = PersistentJobScheduler.getInstance();
