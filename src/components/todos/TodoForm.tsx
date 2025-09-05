import { useState, useEffect, useRef } from 'react';
import { CalendarIcon, Bell, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Todo } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ModalContainer } from '@/components/ui/modal-container';

interface TodoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Todo, 'id' | 'createdAt'>) => void;
  initialData?: Todo;
  title: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: '📝 Low Priority', color: 'text-muted-foreground' },
  { value: 'medium', label: '⚡ Medium Priority', color: 'text-warning' },
  { value: 'high', label: '🔥 High Priority', color: 'text-destructive' },
];

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

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      titleInputRef.current?.focus();
    }
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

  return (
    <ModalContainer 
      isOpen={open} 
      onClose={() => onOpenChange(false)}
      className="max-w-lg rounded-lg"
    >
      <div className="flex flex-col h-full">
        {/* Polished sticky header */}
        <div className="flex-shrink-0 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md flex items-center gap-3 px-4 py-4 border-b border-border rounded-t-lg shadow-sm">
          <span className="text-2xl md:text-xl">📝</span>
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
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto space-y-8 px-4 py-5 md:px-6">
          <Card className="p-4 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Todo Title *</Label>
              <Input
                ref={titleInputRef}
                id="title"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing
                className={cn("shadow-sm")}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add more details..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={cn("resize-none shadow-sm")}
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Todo['priority']) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }>
                <SelectTrigger className="shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value} className={option.color}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-4 space-y-6">
            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal shadow-sm",
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
          </Card>

          <Card className="p-4 space-y-6">
            {/* Notification Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <Label htmlFor="notification">Set Reminder</Label>
              </div>
              <Switch
                id="notification"
                checked={enableNotification}
                onCheckedChange={setEnableNotification}
              />
            </div>

            {/* Notification Date & Time */}
            {enableNotification && (
              <div className="space-y-2">
                <Label>Reminder Date</Label>
                <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal shadow-sm",
                        !formData.notificationTime && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.notificationTime
                        ? format(formData.notificationTime, "PPP")
                        : "Pick a reminder date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.notificationTime}
                      onSelect={(date) => {
                        if (date) {
                          // If time is already set, preserve it
                          const prev = formData.notificationTime || new Date();
                          date.setHours(prev.getHours(), prev.getMinutes());
                        }
                        setFormData(prev => ({ ...prev, notificationTime: date }));
                        setNotificationOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Label>Reminder Time</Label>
                <Input
                  type="time"
                  value={formData.notificationTime ? format(formData.notificationTime, "HH:mm") : ''}
                  onChange={e => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    setFormData(prev => {
                      const date = prev.notificationTime ? new Date(prev.notificationTime) : new Date();
                      date.setHours(hours, minutes, 0, 0);
                      return { ...prev, notificationTime: date };
                    });
                  }}
                  className={cn("w-full")}
                />
              </div>
            )}
          </Card>
        </form>

        {/* Actions */}
        <div className="flex-shrink-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 px-4 pb-4 flex gap-3 border-t border-border rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="flex-1 shadow-sm"
              disabled={!formData.title.trim()}
            >
              {initialData ? 'Update Todo' : 'Add Todo'}
            </Button>
          </div>
      </div>
    </ModalContainer>
  );
}
