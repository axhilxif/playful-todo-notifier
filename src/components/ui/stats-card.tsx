import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'destructive' | 'info';
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  className
}: StatsCardProps) {
  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      <CardContent className={cn("p-4 text-center", `bg-${color}/10`)}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", `text-${color}`)} />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
        <div className={cn("text-2xl font-bold", `text-${color}`)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}