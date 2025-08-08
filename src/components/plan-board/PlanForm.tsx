
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlanItem } from './PlanBoard';

interface PlanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  initialData?: PlanItem;
  title: string;
}

const EMOJI_OPTIONS = [
  '🎯', '🌟', '💡', '🚀', '🎨', '📚', '🏃‍♂️', '🧘', '🎵', '🍳',
  '🌱', '💪', '🎉', '🏆', '📝', '🎮', '🌈', '⭐', '🔥', '✨'
];

const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#FD79A8'
];

export function PlanForm({ open, onOpenChange, onSubmit, initialData, title }: PlanFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    type: 'activity' as 'activity' | 'special-day' | 'goal',
    color: COLOR_OPTIONS[0],
    isPinned: false,
    emoji: EMOJI_OPTIONS[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        date: new Date(initialData.date),
        type: initialData.type,
        color: initialData.color,
        isPinned: initialData.isPinned,
        emoji: initialData.emoji,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        type: 'activity',
        color: COLOR_OPTIONS[0],
        isPinned: false,
        emoji: EMOJI_OPTIONS[0],
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: formData.date.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{formData.emoji}</span>
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji Selection */}
          <div className="space-y-2">
            <Label>Choose Emoji</Label>
            <div className="grid grid-cols-10 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-10 w-10 p-0 text-lg",
                    formData.emoji === emoji && "ring-2 ring-primary"
                  )}
                  onClick={() => setFormData({ ...formData, emoji })}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What's your plan?"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          {/* Type and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'activity' | 'special-day' | 'goal') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="special-day">Special Day</SelectItem>
                  <SelectItem value="goal">Goal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-10 gap-2">
              {COLOR_OPTIONS.map((color) => (
                <Button
                  key={color}
                  type="button"
                  className={cn(
                    "h-8 w-8 p-0 rounded-full border-2",
                    formData.color === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
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
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
              disabled={!formData.title.trim()}
            >
              {initialData ? 'Update' : 'Create'} Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
