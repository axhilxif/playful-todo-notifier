
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

  // Sticky note rotation for playful look
  const rotation = plan.type === 'special-day' ? -2 : plan.type === 'goal' ? 2 : 0;

  // Utility to determine if a color is light or dark
  function isColorDark(hex: string) {
    if (!hex) return false;
    const c = hex.substring(1); // strip #
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    // Perceived brightness
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  const textColor = isColorDark(plan.color) ? 'text-white' : 'text-gray-900';
  const mutedColor = isColorDark(plan.color) ? 'text-gray-100/80' : 'text-gray-700/80';

  return (
    <Card 
      className={cn(
        "relative overflow-visible transition-all duration-300 group rounded-xl border-none shadow-xl",
        plan.isPinned && "ring-2 ring-primary/50 shadow-glow",
        className
      )}
      style={{
        ...style,
        transform: `rotate(${rotation}deg)`
      }}
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', plan.id);
        e.currentTarget.classList.add('opacity-50');
      }}
      onDragEnd={e => {
        e.currentTarget.classList.remove('opacity-50');
      }}
    >
      {/* Pin or tape effect */}
      <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-20">
        <div className="w-8 h-4 bg-yellow-300 rounded-b-lg shadow-tape border border-yellow-400" />
      </div>
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-80 rounded-xl"
        style={{ backgroundColor: plan.color }}
      />
      
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">{plan.emoji}</span>
              <h3 className={cn("font-semibold group-hover:text-primary transition-colors", textColor)}>
                {plan.title}
              </h3>
              {plan.isPinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
            </div>
            
            {/* Description */}
            {plan.description && (
              <p className={cn("text-sm line-clamp-2", mutedColor)}>
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
