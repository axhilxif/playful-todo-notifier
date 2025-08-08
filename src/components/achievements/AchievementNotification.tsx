import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/lib/achievements';
import { useToast } from '@/hooks/use-toast';
import { playHaptic } from '@/lib/notifications';

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementNotification({ achievement, onDismiss }: AchievementNotificationProps) {
  const { toast } = useToast();

  useEffect(() => {
    playHaptic();
    
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <Card className="bg-gradient-warning/95 backdrop-blur-sm border-warning/30 shadow-glow max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{achievement.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-warning-foreground" />
                  <Badge variant="secondary" className="bg-white/20 text-warning-foreground text-xs">
                    Achievement Unlocked!
                  </Badge>
                </div>
                <h4 className="font-display font-semibold text-warning-foreground">
                  {achievement.name}
                </h4>
                <p className="text-sm text-warning-foreground/80 leading-snug">
                  {achievement.description}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-warning-foreground/60 hover:text-warning-foreground"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}