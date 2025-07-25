import { useState } from 'react';
import { MoreVertical, Clock, Flag, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Todo } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TodoCardProps {
  todo: Todo;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const priorityConfig = {
  high: { color: 'bg-destructive text-destructive-foreground', icon: '🔥' },
  medium: { color: 'bg-warning text-warning-foreground', icon: '⚡' },
  low: { color: 'bg-muted text-muted-foreground', icon: '📝' },
};

export function TodoCard({ todo, onToggle, onEdit, onDelete, className, style }: TodoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const priority = priorityConfig[todo.priority];

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-primary hover:scale-[1.02] cursor-pointer bg-gradient-card border-primary/10",
        todo.completed && "opacity-75 hover:opacity-100",
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={onToggle}
              className="h-5 w-5 transition-all duration-200 hover:scale-110"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn(
                  "font-semibold text-sm transition-all duration-200",
                  todo.completed && "line-through text-muted-foreground"
                )}>
                  {todo.title}
                </h3>
                
                {todo.description && (
                  <p className={cn(
                    "text-sm text-muted-foreground mt-1",
                    todo.completed && "line-through"
                  )}>
                    {todo.description}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {/* Priority badge */}
                  <Badge variant="secondary" className={cn("text-xs", priority.color)}>
                    <span className="mr-1">{priority.icon}</span>
                    {todo.priority}
                  </Badge>

                  {/* Due date */}
                  {todo.dueDate && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(todo.dueDate), 'MMM d, h:mm a')}
                    </div>
                  )}

                  {/* Notification indicator */}
                  {todo.notificationTime && (
                    <div className="flex items-center text-xs text-primary">
                      <span className="mr-1">🔔</span>
                      Reminder set
                    </div>
                  )}
                </div>
              </div>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200",
                      isHovered ? "opacity-100" : "opacity-0 sm:opacity-60"
                    )}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Todo
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={onDelete} 
                    className="cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Todo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}