import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlanItem } from './PlanBoard';
import { ModalContainer } from '@/components/ui/modal-container';

interface SpecialDayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  initialData?: PlanItem;
  title: string;
}

const EMOJI_OPTIONS = [
  '🎉', '🎂', '💝', '🌟', '🎊', '🏆', '💖', '🌈', '✨', '🎈',
  '🎁', '🥳', '����', '🌺', '🦋', '🌸', '🌼', '🌻', '🌷', '🎀'
];

const COLOR_OPTIONS = [
  '#FF69B4', '#FFD700', '#FF1493', '#FF6347', '#DA70D6',
  '#BA55D3', '#9370DB', '#8A2BE2', '#FF4500', '#FF69B4'
];

const CATEGORY_OPTIONS = [
  'Birthday', 'Anniversary', 'Holiday', 'Celebration', 'Milestone',
  'Achievement', 'Memory', 'Date Night', 'Family Time', 'Personal'
];

export function SpecialDayForm({ open, onOpenChange, onSubmit, initialData, title }: SpecialDayFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    color: COLOR_OPTIONS[0],
    emoji: EMOJI_OPTIONS[0],
    category: CATEGORY_OPTIONS[0],
    isPinned: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        date: new Date(initialData.date),
        color: initialData.color,
        emoji: initialData.emoji,
        category: initialData.category || CATEGORY_OPTIONS[0],
        isPinned: true,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date(),
        color: COLOR_OPTIONS[0],
        emoji: EMOJI_OPTIONS[0],
        category: CATEGORY_OPTIONS[0],
        isPinned: true,
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: formData.date.toISOString(),
      type: 'special-day',
    });
    onOpenChange(false);
  };

  return (
    <ModalContainer 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      className="max-w-lg md:rounded-2xl md:my-8 p-0"
    >
      <div className="p-0 md:p-6">
        {/* Sticky header for mobile */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md flex items-center gap-3 px-4 py-4 border-b border-border md:rounded-t-2xl">
          <span className="text-3xl md:text-2xl">{formData.emoji}</span>
          <h2 className="text-lg md:text-xl font-semibold flex-1 truncate">{title}</h2>
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
        <form onSubmit={handleSubmit} className="space-y-6 px-4 py-6 md:p-0">
          {/* Emoji Selection */}
          <div className="space-y-2">
            <Label>Choose Emoji</Label>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {EMOJI_OPTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-12 w-12 min-w-[3rem] min-h-[3rem] p-0 text-2xl flex-shrink-0",
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
              className="text-base md:text-sm py-3 md:py-2"
            />
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
              className="text-base md:text-sm py-3 md:py-2"
            />
          </div>

          {/* Category and Date */}
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {CATEGORY_OPTIONS.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-xs whitespace-nowrap min-w-[4.5rem] flex-shrink-0 py-2 px-3",
                      formData.category === category && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setFormData({ ...formData, category })}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-3 md:py-2",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
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
            <Label>Special Color</Label>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {COLOR_OPTIONS.map((color) => (
                <Button
                  key={color}
                  type="button"
                  className={cn(
                    "h-10 w-10 min-w-[2.5rem] min-h-[2.5rem] p-0 rounded-full border-2 flex-shrink-0",
                    formData.color === color && "ring-2 ring-primary ring-offset-2"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
              {/* Any color input */}
              <input
                type="color"
                value={formData.color}
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-10 min-w-[2.5rem] min-h-[2.5rem] p-0 rounded-full border-2 flex-shrink-0 cursor-pointer"
                style={{ background: 'none', border: '2px solid #ccc' }}
                title="Pick any color"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full md:flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full md:flex-1 bg-gradient-accent hover:bg-gradient-accent/90 text-base md:text-sm py-3 md:py-2"
              disabled={!formData.title.trim()}
            >
              {initialData ? 'Update' : 'Create'} Special Day
            </Button>
          </div>
        </form>
      </div>
    </ModalContainer>
  );
}
