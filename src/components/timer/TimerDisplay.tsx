import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  time: string;
  isRunning: boolean;
  mode?: string;
  totalTime: number; // Add total time
  remainingTime: number; // Add remaining time
}

export function TimerDisplay({ time, isRunning, mode, totalTime, remainingTime }: TimerDisplayProps) {
  const progress = totalTime > 0 ? (remainingTime / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 40; // For r=40

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full"> {/* Changed to flex-col */}
      {/* Circular Progress Bar (conditional) */}
      {mode !== 'Stopwatch' && (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-muted-foreground"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className={cn(
              "transition-all duration-300 ease-out",
              {
                "text-primary": mode === "Focus",
                "text-accent": mode === "Deep Focus",
                "text-success": mode === "Short Break",
                "text-warning": mode === "Long Break",
              }
            )}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * progress) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="40"
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
      )}

      <div className="relative z-10"> {/* Added relative and z-10 to ensure it's above SVG */}
        {mode && (
          <div className="text-lg font-semibold text-center text-muted-foreground mb-2"> {/* Increased font size */}
            {mode} Mode
          </div>
        )}
        <div 
          className={cn(
            "text-7xl md:text-8xl font-bold text-center transition-all duration-300 font-mono",
            isRunning 
              ? "text-foreground" 
              : "text-muted-foreground"
          )}
        >
          {time}
        </div>
      </div>
    </div>
  );
}