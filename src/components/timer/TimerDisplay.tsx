import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  time: string;
  isRunning: boolean;
}

export function TimerDisplay({ time, isRunning }: TimerDisplayProps) {
  return (
    <div className="relative">
      <div 
        className={cn(
          "text-6xl md:text-7xl font-bold text-center transition-all duration-300 font-mono",
          isRunning 
            ? "text-primary animate-pulse-glow" 
            : "text-muted-foreground"
        )}
      >
        {time}
      </div>
      
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      )}
    </div>
  );
}