import { useState } from 'react';
import { MoreVertical, Clock, Calendar, Bell, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TimeSlot } from '@/types';
import { cn } from '@/lib/utils';

interface TimeSlotCardProps {
  timeSlot: TimeSlot;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TimeSlotCard({ timeSlot, onEdit, onDelete, className, style }: TimeSlotCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getActiveDays = () => {
    return timeSlot.days.map(day => dayNames[day]).join(', ');
  };

  return (
    <Card 
      variant="elevated" 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-[1.02] border-l-4",
        className
      )}
      style={{ 
        borderLeftColor: timeSlot.color,
        ...style 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: timeSlot.color }}
              />
              <h3 className="font-semibold text-xl">{timeSlot.title}</h3>
            </div>

            {/* Time info */}
            <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}</span>
              </div>
              
              {timeSlot.notifications && (
                <div className="flex items-center gap-1 text-primary">
                  <Bell className="h-5 w-5" />
                  <span>{timeSlot.reminderBefore}min before</span>
                </div>
              )}
            </div>

            {/* Days */}
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {timeSlot.days.map(day => (
                  <Badge 
                    key={day} 
                    variant="secondary" 
                    className="text-sm px-3 py-1"
                  >
                    {dayNames[day]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Duration info */}
            <div className="text-xs text-muted-foreground">
              {(() => {
                const start = timeSlot.startTime.split(':').map(Number);
                const end = timeSlot.endTime.split(':').map(Number);
                const startMinutes = start[0] * 60 + start[1];
                const endMinutes = end[0] * 60 + end[1];
                const duration = endMinutes - startMinutes;
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                
                if (hours > 0 && minutes > 0) {
                  return `Duration: ${hours}h ${minutes}m`;
                } else if (hours > 0) {
                  return `Duration: ${hours}h`;
                } else {
                  return `Duration: ${minutes}m`;
                }
              })()}
            </div>
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 p-0 transition-all duration-200",
                  isHovered ? "opacity-100" : "opacity-0 sm:opacity-60"
                )}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Schedule
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete} 
                className="cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Schedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}