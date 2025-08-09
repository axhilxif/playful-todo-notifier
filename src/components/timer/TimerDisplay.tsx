import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  time: string;
  isRunning: boolean;
  mode?: string;
}

export function TimerDisplay({ time, isRunning, mode }: TimerDisplayProps) {
  return (
    <div className="relative">
      {mode && (
        <div className="text-sm text-muted-foreground mb-2">
          {mode} Mode
        </div>
      )}
      <div 
        className={cn(
          "text-6xl md:text-7xl font-bold text-center transition-all duration-300 font-mono",
          isRunning 
            ? "animate-pulse-glow" 
            : "text-muted-foreground"
        )}
      >
        {time}
      </div>
      
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 border-t-primary animate-spin",
            {
              "border-accent/20 border-t-accent": mode === "Deep Focus",
              "border-success/20 border-t-success": mode === "Short Break",
              "border-warning/20 border-t-warning": mode === "Long Break"
            }
          )} />
        </div>
      )}
    </div>
  );
}