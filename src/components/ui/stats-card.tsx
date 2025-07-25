import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  textColor?: string;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  gradient = "bg-gradient-primary/5", 
  textColor = "text-primary",
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      <CardContent className={cn("p-4 text-center", gradient)}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", textColor)} />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
        <div className={cn("text-2xl font-bold", textColor)}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}