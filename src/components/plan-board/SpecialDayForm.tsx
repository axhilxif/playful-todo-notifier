import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Pin, ImagePlus, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PlanItem } from './PlanBoard';
import { ModalContainer } from '@/components/ui/modal-container';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Card, CardContent } from '@/components/ui/card';

interface SpecialDayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  initialData?: PlanItem;
  title: string;
}

const EMOJI_OPTIONS = [
  '🎉', '🎂', '💝', '🌟', '🎊', '🏆', '💖', '🌈', '✨', '🎈',
  '🎁', '🥳', '', '🌺', '🦋', '🌸', '🌼', '🌻', '🌷', '🎀'
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
    image: '' as string, // New field for image
  });

  const [isLoading, setIsLoading] = useState(false);

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
        image: (initialData as any).image || '', // Load existing image
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
        image: '',
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        date: formData.date.toISOString(),
        type: 'special-day',
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async () => {
    setIsLoading(true);
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (photo.dataUrl) {
        setFormData(prev => ({ ...prev, image: photo.dataUrl! }));
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalContainer 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      className="max-w-lg rounded-3xl"
    >
      <div className="flex flex-col h-full">
        {/* Header - always visible */}
        <div className="flex-shrink-0 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md flex items-center gap-3 px-4 py-4 border-b border-border rounded-t-lg shadow-sm">
          <span className="text-2xl md:text-xl">{formData.emoji}</span>
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-8 px-4 py-5 md:px-6">
          <Card className="p-4 space-y-6">
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
                      "h-14 w-14 min-w-[3.5rem] min-h-[3.5rem] p-0 text-3xl flex-shrink-0 rounded-lg shadow-md",
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
                className="text-base py-3"
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
                className="text-base py-3"
              />
            </div>
          </Card>

          <Card className="p-4 space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Add Image (Optional)</Label>
              {formData.image && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden shadow-md">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 text-foreground/70 hover:text-destructive"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleImageUpload}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formData.image ? 'Change Image' : 'Upload Image'}
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-6">
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
                        "text-sm whitespace-nowrap min-w-[4.5rem] flex-shrink-0 py-2 px-3 rounded-lg shadow-sm",
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
                        "w-full justify-start text-left font-normal py-3",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-6 w-6" />
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
          </Card>

          <Card className="p-4 space-y-6">
            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Special Color</Label>
              <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                {COLOR_OPTIONS.map((color) => (
                  <Button
                    key={color}
                    type="button"
                    className={cn(
                      "h-12 w-12 min-w-[3rem] min-h-[3rem] p-0 rounded-lg border-2 flex-shrink-0 shadow-sm",
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
                  className="h-12 w-12 min-w-[3rem] min-h-[3rem] p-0 rounded-lg border-2 flex-shrink-0 cursor-pointer shadow-sm"
                  style={{ background: 'none', border: '2px solid #ccc' }}
                  title="Pick any color"
                />
              </div>
            </div>
          </Card>
        </form>

        {/* Footer - always visible */}
        <div className="flex-shrink-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 px-4 pb-4 flex flex-col md:flex-row gap-3 border-t border-border rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full md:flex-1 shadow-sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full md:flex-1 shadow-sm"
              variant="default"
              disabled={!formData.title.trim() || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update' : 'Create'} Special Day
            </Button>
          </div>
      </div>
    </ModalContainer>
  );
}
