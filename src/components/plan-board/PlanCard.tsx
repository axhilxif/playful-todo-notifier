
import { useMemo } from 'react';
import { Pin, Edit, Trash2, Calendar, Star, Target, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PlanItem } from './PlanBoard';
import Color from 'color';

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

  // Function to calculate contrasting text color
  const getContrastColor = (backgroundColor: string) => {
    try {
      const color = Color(backgroundColor);
      return color.isDark() ? '#FFFFFF' : '#000000';
    } catch {
      return '#000000';
    }
  };

  const cardStyle = useMemo(() => {
    if (plan.image) {
      return { main: '#FFFFFF', muted: '#FFFFFF', bg: 'transparent' };
    }
    if (plan.color) {
      try {
        const c = Color(plan.color);
        return {
          main: c.isDark() ? '#FFFFFF' : '#000000',
          muted: c.isDark() ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
          bg: c.alpha(0.15).toString(),
        };
      } catch {
        return { main: 'var(--card-foreground)', muted: 'var(--muted-foreground)', bg: 'var(--card)' };
      }
    }
    return { main: 'var(--card-foreground)', muted: 'var(--muted-foreground)', bg: 'var(--card)' };
  }, [plan.color, plan.image]);

  // Sticky note rotation for playful look
  const rotation = plan.id ? 
    Math.max(-2, Math.min(2, (parseInt(plan.id.slice(-2), 16) % 5 - 2))) : // -2 to +2 degrees based on ID
    0;
    
  // Get type-specific styles
  const getTypeStyles = () => {
    switch (plan.type) {
      case 'special-day':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'goal':
        return 'bg-success/10 text-success border-success/30';
      default:
        return 'bg-primary/10 text-primary border-primary/30';
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 group rounded-lg shadow-md",
        plan.isPinned && "shadow-lg",
        className
      )}
      style={{
        ...style,
        backgroundColor: cardStyle.bg,
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
      {/* Pinned gradient border */}
      {plan.isPinned && (
        <div className="absolute inset-0 rounded-lg border-2 border-primary/80 animate-pulse-fast" />
      )}

      {/* Background Pattern or Image */}
      {plan.image && (
        <>
          <img src={plan.image} alt={plan.title} className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-80" />
          <div className="absolute inset-0 bg-black/50 rounded-lg" />
        </>
      )}
      
      <CardContent className="p-3 relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{plan.emoji}</div>
            <div>
              <h3 className="font-semibold leading-tight" style={{ color: cardStyle.main }}>{plan.title}</h3>
              <div className="text-xs flex items-center gap-1" style={{ color: cardStyle.muted }}>
                {getTypeIcon()}
                <span className="capitalize">{plan.type.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
          {/* Drag Handle */}
          <div className="text-muted-foreground cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>
        </div>
        
        {/* Description */}
        {plan.description && (
          <p className="text-sm line-clamp-2 flex-grow" style={{ color: cardStyle.muted }}>
            {plan.description}
          </p>
        )}
        
        {/* Spacer to push footer down */}
        <div className="flex-grow" />

        {/* Footer with Metadata & Actions */}
        <div className="mt-3 pt-2 border-t flex items-center justify-between" style={{ borderColor: Color(cardStyle.main).alpha(0.2).toString() }}>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs" style={{ borderColor: Color(cardStyle.main).alpha(0.2).toString(), color: cardStyle.muted }}>
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
            {plan.subject && (
              <Badge variant="secondary" className="text-xs">{plan.subject}</Badge>
            )}
          </div>

          <div className="flex items-center gap-0.5" style={{ color: cardStyle.muted }}>
            <Button size="icon-xs" variant="ghost" onClick={onTogglePin} className={cn(plan.isPinned && "text-primary")}><Pin className="h-4 w-4" /></Button>
            <Button size="icon-xs" variant="ghost" onClick={onEdit}><Edit className="h-4 w-4" /></Button>
            <Button size="icon-xs" variant="ghost" onClick={onDelete} className="text-destructive/80 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
