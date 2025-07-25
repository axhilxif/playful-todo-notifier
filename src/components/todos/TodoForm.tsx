import { useState, useEffect } from 'react';
import { CalendarIcon, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Todo } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TodoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Todo, 'id' | 'createdAt'>) => void;
  initialData?: Todo;
  title: string;
}

export function TodoForm({ open, onOpenChange, onSubmit, initialData, title }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Todo['priority'],
    dueDate: undefined as Date | undefined,
    notificationTime: undefined as Date | undefined,
    completed: false,
  });

  const [enableNotification, setEnableNotification] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        priority: initialData.priority,
        dueDate: initialData.dueDate ? new Date(initialData.dueDate) : undefined,
        notificationTime: initialData.notificationTime ? new Date(initialData.notificationTime) : undefined,
        completed: initialData.completed,
      });
      setEnableNotification(!!initialData.notificationTime);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: undefined,
        notificationTime: undefined,
        completed: false,
      });
      setEnableNotification(false);
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      ...formData,
      notificationTime: enableNotification ? formData.notificationTime : undefined,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: undefined,
      notificationTime: undefined,
      completed: false,
    });
    setEnableNotification(false);
  };

  const priorityOptions = [
    { value: 'low', label: '📝 Low Priority', color: 'text-muted-foreground' },
    { value: 'medium', label: '⚡ Medium Priority', color: 'text-warning' },
    { value: 'high', label: '🔥 High Priority', color: 'text-destructive' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Todo Title *
            </Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="transition-all duration-200 focus:shadow-soft"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="resize-none transition-all duration-200 focus:shadow-soft"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: Todo['priority']) => 
              setFormData(prev => ({ ...prev, priority: value }))
            }>
              <SelectTrigger className="transition-all duration-200 focus:shadow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className={option.color}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Due Date</Label>
            <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal transition-all duration-200 hover:shadow-soft",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => {
                    setFormData(prev => ({ ...prev, dueDate: date }));
                    setDueDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notification Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-primary" />
              <Label htmlFor="notification" className="text-sm font-medium">
                Set Reminder
              </Label>
            </div>
            <Switch
              id="notification"
              checked={enableNotification}
              onCheckedChange={setEnableNotification}
            />
          </div>

          {/* Notification Time */}
          {enableNotification && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Reminder Time</Label>
              <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal transition-all duration-200 hover:shadow-soft",
                      !formData.notificationTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formData.notificationTime 
                      ? format(formData.notificationTime, "PPP 'at' p") 
                      : "Set reminder time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.notificationTime}
                    onSelect={(date) => {
                      if (date) {
                        // Set time to current time if only date is selected
                        const now = new Date();
                        date.setHours(now.getHours(), now.getMinutes());
                      }
                      setFormData(prev => ({ ...prev, notificationTime: date }));
                      setNotificationOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

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
              className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 shadow-playful"
              disabled={!formData.title.trim()}
            >
              {initialData ? 'Update Todo' : 'Add Todo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}