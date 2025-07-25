import { TimeSlot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WeeklyCalendarProps {
  timeSlots: TimeSlot[];
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourSlots = Array.from({ length: 24 }, (_, i) => i);

export function WeeklyCalendar({ timeSlots }: WeeklyCalendarProps) {
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  const getTimeSlotPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startPosition = (startHour + startMin / 60) * 60; // Convert to minutes from midnight
    const endPosition = (endHour + endMin / 60) * 60;
    const duration = endPosition - startPosition;
    
    return {
      top: `${(startPosition / 60) * 4}rem`, // 4rem per hour
      height: `${(duration / 60) * 4}rem`,
    };
  };

  const getSlotsForDay = (dayIndex: number) => {
    return timeSlots.filter(slot => slot.days.includes(dayIndex));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📅 Weekly Calendar View
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          <div className="grid grid-cols-8 min-w-[700px]">
            {/* Time column */}
            <div className="border-r border-border">
              <div className="h-12 border-b border-border flex items-center justify-center font-medium text-sm bg-muted">
                Time
              </div>
              {hourSlots.map(hour => (
                <div 
                  key={hour} 
                  className="h-16 border-b border-border flex items-start justify-center text-xs text-muted-foreground pt-1"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {dayNames.map((dayName, dayIndex) => (
              <div key={dayIndex} className="border-r border-border last:border-r-0 relative">
                {/* Day header */}
                <div className="h-12 border-b border-border flex items-center justify-center font-medium text-sm bg-muted">
                  {dayName}
                </div>
                
                {/* Hour slots */}
                <div className="relative">
                  {hourSlots.map(hour => (
                    <div 
                      key={hour} 
                      className="h-16 border-b border-border"
                    />
                  ))}
                  
                  {/* Time slots for this day */}
                  {getSlotsForDay(dayIndex).map((slot, index) => {
                    const position = getTimeSlotPosition(slot.startTime, slot.endTime);
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-md p-2 text-white text-xs overflow-hidden",
                          "shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                          index > 0 && "opacity-90" // Slightly transparent if overlapping
                        )}
                        style={{
                          backgroundColor: slot.color,
                          top: position.top,
                          height: position.height,
                          minHeight: '2rem',
                          zIndex: 10 - index, // Lower z-index for later items
                        }}
                        title={`${slot.title}\n${slot.startTime} - ${slot.endTime}`}
                      >
                        <div className="font-medium truncate">
                          {slot.title}
                        </div>
                        <div className="text-xs opacity-90 truncate">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {timeSlots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">📅</div>
            <p>No time slots to display</p>
            <p className="text-sm">Add some schedules to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}