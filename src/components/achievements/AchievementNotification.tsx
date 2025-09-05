import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Achievement } from '@/lib/achievements';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/lib/notification-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { calculateLevel } from '@/lib/level-system';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AchievementNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
  xpGained?: number;
  totalXp?: number;
}

export function AchievementNotification({ 
  achievement, 
  onDismiss,
  xpGained = 0,
  totalXp = 0
}: AchievementNotificationProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const levelInfo = xpGained ? calculateLevel(totalXp) : null;
  const previousLevelInfo = xpGained ? calculateLevel(totalXp - xpGained) : null;
  
  const levelProgress = levelInfo && previousLevelInfo
    ? ((totalXp - previousLevelInfo.xpNeeded) / 
      (levelInfo.xpNeeded - previousLevelInfo.xpNeeded)) * 100
    : 0;

  useEffect(() => {
    notificationService.playHaptic();
    
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div 
      className={cn(
        "fixed z-50",
        isMobile ? "top-4 left-4 right-4" : "top-4 right-4"
      )}
      initial={{ opacity: 0, scale: 0.8, y: -50 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { 
          type: "spring",
          stiffness: 200,
          damping: 20
        }
      }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
    >
      <Card className="max-w-sm bg-warning backdrop-blur-sm border-warning/30 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 bg-background/20 rounded-xl flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, -10, 0]
                }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-2xl">{achievement.emoji}</span>
              </motion.div>
              <div className="flex-1">
                <motion.div 
                  className="flex items-center gap-2 mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Trophy className="h-4 w-4 text-warning-foreground" />
                  <Badge 
                    variant="secondary" 
                    className="bg-background/20 text-warning-foreground text-sm animate-pulse rounded-lg"
                  >
                    Achievement Unlocked!
                  </Badge>
                </motion.div>
                <motion.h4 
                  className="font-display font-semibold text-warning-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {achievement.name}
                </motion.h4>
                <motion.p 
                  className="text-sm text-warning-foreground/80 leading-snug"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {achievement.description}
                </motion.p>
                
                {xpGained > 0 && levelInfo && (
                  <motion.div 
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center gap-2 text-xs font-medium mb-1 text-warning-foreground">
                      <Star className="h-3 w-3" />
                      +{xpGained} XP
                    </div>
                    <Progress 
                      value={levelProgress} 
                      className="h-2 bg-background/20 rounded-full" 
                    />
                    <div className="text-xs mt-1 text-warning-foreground/80">
                      Level {levelInfo.level} - {levelInfo.title}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-warning-foreground/80 hover:text-warning-foreground hover:bg-white/20 rounded-full"
              onClick={onDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}