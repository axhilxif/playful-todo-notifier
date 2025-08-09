
import { LocalNotifications } from '@capacitor/local-notifications';
import { getTodos, getTimeSlots } from './storage';
import { getNextOccurrence } from './date-utils';

const scheduleNotification = async (notification: any) => {
    await LocalNotifications.schedule({ notifications: [notification] });
};

const cancelNotification = async (id: number) => {
    await LocalNotifications.cancel({ notifications: [{ id }] });
};

export const scheduleAllReminders = async () => {
    const todos = getTodos();
    const timeSlots = getTimeSlots();
    const now = new Date();

    const pending = await LocalNotifications.getPending();
    const scheduledIds = new Set(pending.notifications.map(n => n.id));

    for (const todo of todos) {
        if (todo.notificationTime) {
            const notificationTime = new Date(todo.notificationTime);
            const id = parseInt(todo.id.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 100000);
            if (notificationTime > now && !scheduledIds.has(id)) {
                await scheduleNotification({
                    id,
                    title: '📝 Todo Reminder',
                    body: `Don't forget: ${todo.title}`,
                    schedule: { at: notificationTime, allowWhileIdle: true },
                    channelId: 'reminders',
                });
            }
        }
    }

    for (const slot of timeSlots) {
        const nextOccurrence = getNextOccurrence(slot.days, slot.startTime);
        const id = parseInt(slot.id.replace(/\D/g, '').slice(0, 8)) || Math.floor(Math.random() * 100000);
        if (nextOccurrence && !scheduledIds.has(id)) {
            await scheduleNotification({
                id,
                title: '📅 Scheduled Activity',
                body: `Time for: ${slot.title}`,
                schedule: { at: nextOccurrence, allowWhileIdle: true },
                channelId: 'timetable',
            });
        }
    }
};

export const sendImmediateNotification = async (title: string, body: string, channelId: string) => {
    const id = Math.floor(Math.random() * 100000);
    await scheduleNotification({
        id,
        title,
        body,
        schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
        channelId,
    });
};
