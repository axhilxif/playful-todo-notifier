import { useState, useEffect } from 'react';
import { Clock, Bell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { TimeSlot } from '@/types';
import { cn } from '@/lib/utils';

interface TimeSlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<TimeSlot, 'id'>) => void;
  initialData?: TimeSlot;
  title: string;
}

const dayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const colorOptions = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

export function TimeSlotForm({ open, onOpenChange, onSubmit, initialData, title }: TimeSlotFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '17:00',
    days: [] as number[],
    color: colorOptions[0],
    notifications: true,
    reminderBefore: 15,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        days: [...initialData.days],
        color: initialData.color,
        notifications: initialData.notifications,
        reminderBefore: initialData.reminderBefore,
      });
    } else {
      setFormData({
        title: '',
        startTime: '09:00',
        endTime: '17:00',
        days: [],
        color: colorOptions[0],
        notifications: true,
        reminderBefore: 15,
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.days.length === 0) return;

    onSubmit(formData);

    // Reset form
    setFormData({
      title: '',
      startTime: '09:00',
      endTime: '17:00',
      days: [],
      color: colorOptions[0],
      notifications: true,
      reminderBefore: 15,
    });
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Activity Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Work, Study, Exercise"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="transition-all duration-200 focus:shadow-soft"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="transition-all duration-200 focus:shadow-soft"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="transition-all duration-200 focus:shadow-soft"
                required
              />
            </div>
          </div>

          {/* Days of Week */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Days of Week * (Select at least one)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {dayOptions.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.days.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label 
                    htmlFor={`day-${day.value}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Color Theme
            </Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110",
                    formData.color === color 
                      ? "border-foreground shadow-lg" 
                      : "border-border hover:border-foreground/50"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label htmlFor="notifications" className="text-sm font-medium">
                  Enable Notifications
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
              />
            </div>

            {formData.notifications && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Remind me before (minutes)
                </Label>
                <Select 
                  value={formData.reminderBefore.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, reminderBefore: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-accent hover:bg-gradient-accent/90 shadow-playful"
              disabled={!formData.title.trim() || formData.days.length === 0}
            >
              {initialData ? 'Update Schedule' : 'Add Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}