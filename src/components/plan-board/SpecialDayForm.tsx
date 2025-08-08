
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlanItem } from './PlanBoard';

interface SpecialDayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  title: string;
}

const SPECIAL_EMOJIS = [
  '🎉', '🎂', '💝', '🌟', '🎊', '🏆', '💖', '🌈', '✨', '🎈',
  '🎁', '🥳', '💫', '🌺', '🦋', '🌸', '🌼', '🌻', '🌷', '🎀'
];

const SPECIAL_COLORS = [
  '#FF69B4', '#FFD700', '#FF1493', '#FF6347', '#DA70D6',
  '#BA55D3', '#9370DB', '#8A2BE2', '#FF4500', '#FF69B4'
];

const SPECIAL_DAY_TYPES = [
  'Birthday', 'Anniversary', 'Holiday', 'Celebration', 'Milestone',
  'Achievement', 'Memory', 'Date Night', 'Family Time', 'Personal'
];

export function SpecialDayForm({ open, onOpenChange, onSubmit, title }: SpecialDayFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    color: SPECIAL_COLORS[0],
    emoji: SPECIAL_EMOJIS[0],
    category: SPECIAL_DAY_TYPES[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      date: formData.date.toISOString(),
      type: 'special-day',
      color: formData.color,
      isPinned: true, // Special days are always pinned
      emoji: formData.emoji,
    });
    onOpenChange(false);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: new Date(),
      color: SPECIAL_COLORS[0],
      emoji: SPECIAL_EMOJIS[0],
      category: SPECIAL_DAY_TYPES[0],
    });
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
            <Label>Choose Special Emoji</Label>
            <div className="grid grid-cols-10 gap-2">
              {SPECIAL_EMOJIS.map((emoji) => (
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
            <Label htmlFor="title">Special Day Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sarah's Birthday, Wedding Anniversary"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_DAY_TYPES.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "text-xs",
                    formData.category === category && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setFormData({ ...formData, category })}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Special Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add special memories or plans for this day..."
              rows={3}
            />
          </div>

          {/* Date */}
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
                  {format(formData.date, "EEEE, MMMM do, yyyy")}
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

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Special Color</Label>
            <div className="grid grid-cols-10 gap-2">
              {SPECIAL_COLORS.map((color) => (
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
              className="flex-1 bg-gradient-accent hover:bg-gradient-accent/90"
              disabled={!formData.title.trim()}
            >
              Create Special Day ✨
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
