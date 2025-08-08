
import { Pin, Edit, Trash2, Calendar, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlanItem } from './PlanBoard';

interface PlanCardProps {
  plan: PlanItem;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function PlanCard({ 
  plan, 
  onTogglePin, 
  onEdit, 
  onDelete, 
  className,
  style 
}: PlanCardProps) {
  const getTypeIcon = () => {
    switch (plan.type) {
      case 'special-day':
        return <Star className="h-4 w-4" />;
      case 'goal':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (plan.type) {
      case 'special-day':
        return 'bg-gradient-accent/10 text-accent border-accent/20';
      case 'goal':
        return 'bg-gradient-success/10 text-success border-success/20';
      default:
        return 'bg-gradient-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg group",
        plan.isPinned && "ring-2 ring-primary/50 shadow-glow",
        className
      )}
      style={style}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ backgroundColor: plan.color }}
      />
      
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{plan.emoji}</span>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {plan.title}
              </h3>
              {plan.isPinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
            </div>
            
            {/* Description */}
            {plan.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {plan.description}
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", getTypeColor())}>
                {getTypeIcon()}
                <span className="ml-1 capitalize">{plan.type.replace('-', ' ')}</span>
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(plan.date).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={onTogglePin}
              className={cn(
                "h-8 w-8 p-0",
                plan.isPinned && "text-primary"
              )}
            >
              <Pin className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Indicator for Goals */}
        {plan.type === 'goal' && (
          <div className="mt-3 w-full bg-secondary rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-success transition-all duration-500"
              style={{ width: `${Math.random() * 100}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
