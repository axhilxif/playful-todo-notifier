import { useState, useEffect } from 'react';
import { Clock, Bell, Palette, Calendar, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { ModalContainer } from '@/components/ui/modal-container';

interface TimeSlotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<TimeSlot, 'id'>) => void;
  initialData?: TimeSlot;
  title: string;
}

const DAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const COLOR_OPTIONS = [
  '#673AB7', // Deep Purple
  '#00BCD4', // Cyan
  '#4CAF50', // Green
  '#FFC107', // Amber
  '#F44336', // Red
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#8BC34A', // Light Green
];

export function TimeSlotForm({ open, onOpenChange, onSubmit, initialData, title }: TimeSlotFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '09:00',
    endTime: '17:00',
    days: [] as number[],
    color: COLOR_OPTIONS[0],
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
        color: COLOR_OPTIONS[0],
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
      color: COLOR_OPTIONS[0],
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
    <ModalContainer 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      className="max-w-lg rounded-2xl"
    >
      <div className="p-0">
        {/* Sticky header for mobile */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md flex items-center gap-3 px-4 py-4 border-b border-border rounded-t-2xl shadow-sm">
          <span className="text-2xl md:text-xl">📅</span>
          <h2 className="text-xl md:text-lg font-semibold flex-1 truncate">{title}</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 px-4 py-5 md:px-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Activity Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Work, Study, Exercise"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="shadow-sm"
              required
            />
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                End Time *
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="shadow-sm"
                required
              />
            </div>
          </div>

          {/* Days of Week */}
          <div className="space-y-3">
            <Label>
              Days of Week * (Select at least one)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {DAY_OPTIONS.map(day => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={formData.days.includes(day.value)}
                    onCheckedChange={() => handleDayToggle(day.value)}
                  />
                  <Label 
                    htmlFor={`day-${day.value}`} 
                    className="cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <Palette className="h-4 w-4" />
              Color Theme
            </Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <Card
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 shadow-sm cursor-pointer flex items-center justify-center",
                    formData.color === color 
                      ? "border-primary shadow-md" 
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && <Check className="h-5 w-5 text-white" />}
                </Card>
              ))}
              {/* Any color input */}
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-10 min-w-[2.5rem] min-h-[2.5rem] p-0 rounded-lg border-2 flex-shrink-0 cursor-pointer shadow-sm"
                style={{ background: 'none', border: '2px solid #ccc' }}
                title="Pick any color"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <Label htmlFor="notifications">Enable Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
              />
            </div>

            {formData.notifications && (
              <div className="space-y-2">
                <Label>
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
          <div className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 px-0 pb-4 flex gap-3">
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
              variant="default"
              className="flex-1"
              disabled={!formData.title.trim() || formData.days.length === 0}
            >
              {initialData ? 'Update Schedule' : 'Add Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
}
