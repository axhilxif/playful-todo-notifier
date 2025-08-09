
export const getNextOccurrence = (days: number[], time: string): Date | null => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + i);
        if (days.includes(date.getDay())) {
            date.setHours(hours, minutes, 0, 0);
            if (date > now) {
                return date;
            }
        }
    }

    return null;
};
