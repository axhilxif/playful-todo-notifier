import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const requestNotificationPermission = async (): Promise<boolean> => {
  const platform = (Capacitor as any)?.getPlatform ? (Capacitor as any).getPlatform() : 'web';
  if (platform === 'web') {
    console.info('Notification permissions not available on web platform');
    return false;
  }
  
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const scheduleNotification = async (
  id: number,
  title: string,
  body: string,
  scheduledAt: Date
): Promise<void> => {
  const platform = (Capacitor as any)?.getPlatform ? (Capacitor as any).getPlatform() : 'web';
  if (platform === 'web') {
    console.info('Skipping notification scheduling on web platform');
    return;
  }
  
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at: scheduledAt },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }
      ]
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

export const cancelNotification = async (id: number): Promise<void> => {
  const platform = (Capacitor as any)?.getPlatform ? (Capacitor as any).getPlatform() : 'web';
  if (platform === 'web') {
    console.info('Skipping notification cancellation on web platform');
    return;
  }
  
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

export const playHaptic = async (style: ImpactStyle = ImpactStyle.Medium): Promise<void> => {
  const platform = (Capacitor as any)?.getPlatform ? (Capacitor as any).getPlatform() : 'web';
  if (platform === 'web') {
    // On web, we can provide a subtle visual feedback instead
    console.info('Haptic feedback not available on web platform');
    return;
  }
  
  try {
    await Haptics.impact({ style });
  } catch (error) {
    console.error('Error playing haptic:', error);
  }
};

export const scheduleBreakReminder = async (intervalMinutes: number): Promise<void> => {
  const now = new Date();
  const reminderTime = new Date(now.getTime() + intervalMinutes * 60 * 1000);
  
  await scheduleNotification(
    999999, // Special ID for break reminders
    '⏰ Break Time!',
    'Time to take a short break and rest your eyes.',
    reminderTime
  );
};

export const scheduleTodoReminder = async (
  todoId: string,
  title: string,
  scheduledAt: Date
): Promise<void> => {
  const id = parseInt(todoId.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 100000);
  
  await scheduleNotification(
    id,
    '📝 Todo Reminder',
    `Don't forget: ${title}`,
    scheduledAt
  );
};

export const scheduleTimetableReminder = async (
  slotId: string,
  title: string,
  scheduledAt: Date
): Promise<void> => {
  const id = parseInt(slotId.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 100000);
  
  await scheduleNotification(
    id,
    '📅 Scheduled Activity',
    `Time for: ${title}`,
    scheduledAt
  );
};