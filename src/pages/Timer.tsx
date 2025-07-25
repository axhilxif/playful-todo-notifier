import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerStats } from '@/components/timer/TimerStats';
import { InsightsCard } from '@/components/insights/InsightsCard';
import { TimerSession } from '@/types';
import { getTimerSession, setTimerSession } from '@/lib/storage';
import { playHaptic } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { App } from '@capacitor/app';

export default function Timer() {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Load saved session on mount
  useEffect(() => {
    const savedSession = getTimerSession();
    if (savedSession && savedSession.isActive) {
      setSession(savedSession);
      setIsRunning(true);
      
      // Calculate current time based on saved session
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - new Date(savedSession.startTime).getTime()) / 1000);
      setCurrentTime((savedSession.pausedTime || 0) + elapsed);
    }
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && session) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, session]);

  // Save session when it changes
  useEffect(() => {
    if (session) {
      setTimerSession(session);
    }
  }, [session]);

  // Handle app state changes to pause timer when app goes to background
  useEffect(() => {
    const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
      if (session && session.isActive && !isActive) {
        // App went to background - pause timer
        handlePause();
        toast({
          title: "Timer paused ⏸️",
          description: "Timer stopped when you switched apps",
        });
      }
    };

    App.addListener('appStateChange', handleAppStateChange);
    
    return () => {
      App.removeAllListeners();
    };
  }, [session]);

  const handleStart = useCallback(() => {
    const now = new Date();
    const newSession: TimerSession = {
      id: Date.now().toString(),
      startTime: now,
      duration: currentTime,
      isActive: true,
      pausedTime: currentTime,
    };
    
    setSession(newSession);
    setIsRunning(true);
    playHaptic();
    
    toast({
      title: "Timer started! ⏰",
      description: "Focus mode activated. Timer will pause if you switch apps.",
    });
  }, [currentTime, toast]);

  const handlePause = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        isActive: false,
        pausedTime: currentTime,
      };
      setSession(updatedSession);
      setIsRunning(false);
      playHaptic();
      
      toast({
        title: "Timer paused ⏸️",
        description: "Take a break! Resume when you're ready.",
      });
    }
  }, [session, currentTime, toast]);

  const handleStop = useCallback(() => {
    if (session) {
      const finalSession = {
        ...session,
        endTime: new Date(),
        duration: currentTime,
        isActive: false,
      };
      
      // Save completed session to localStorage for statistics
      const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      focusSessions.push({
        id: finalSession.id,
        duration: finalSession.duration,
        date: finalSession.endTime.toDateString(),
        endTime: finalSession.endTime,
      });
      localStorage.setItem('focusSessions', JSON.stringify(focusSessions));
      
      // Dispatch custom event to update stats
      window.dispatchEvent(new CustomEvent('focusSessionCompleted'));
      
      setSession(null);
      setTimerSession(null);
      setCurrentTime(0);
      setIsRunning(false);
      playHaptic();
      
      const hours = Math.floor(currentTime / 3600);
      const minutes = Math.floor((currentTime % 3600) / 60);
      const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      toast({
        title: "Session completed! 🎉",
        description: `Great work! You focused for ${timeText}.`,
      });
    }
  }, [session, currentTime, toast]);

  const handleReset = useCallback(() => {
    setSession(null);
    setTimerSession(null);
    setCurrentTime(0);
    setIsRunning(false);
    playHaptic();
    
    toast({
      title: "Timer reset 🔄",
      description: "Ready for a new session!",
    });
  }, [toast]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="Focus Timer"
        subtitle="Stay productive and track your focus time"
        icon={<Play className="h-6 w-6" />}
      />

      {/* Main Timer Card */}
      <Card className="mb-6 bg-gradient-hero/10 border-primary/20 shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {session ? (isRunning ? '🎯 Focusing...' : '⏸️ Paused') : '⏰ Ready to Focus'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Timer Display */}
          <TimerDisplay time={formatTime(currentTime)} isRunning={isRunning} />
          
          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!session ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-primary px-8 animate-pulse-glow"
                >
                <Play className="h-5 w-5 mr-2" />
                Start Timer
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button
                    onClick={handlePause}
                    size="lg"
                    variant="outline"
                    className="px-6"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={handleStart}
                    size="lg"
                    className="bg-gradient-primary hover:bg-gradient-primary/90 px-6 shadow-primary"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Resume
                  </Button>
                )}
                
                <Button
                  onClick={handleStop}
                  size="lg"
                  variant="outline"
                  className="px-6"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
                
                <Button
                  onClick={handleReset}
                  size="lg"
                  variant="outline"
                  className="px-6"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timer Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            ℹ️ How it Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>🎯 <strong>Focus Mode:</strong> Timer automatically pauses when you switch to another app</p>
          <p>😴 <strong>Sleep Friendly:</strong> Timer continues running when your device sleeps</p>
          <p>📱 <strong>Background Safe:</strong> No background processing - stays paused until you return</p>
          <p>⏰ <strong>Session Tracking:</strong> Keep track of your productive focus sessions</p>
        </CardContent>
      </Card>

      {/* Stats Card */}
      <TimerStats />
      
      {/* Insights Card */}
      <div className="mt-6">
        <InsightsCard />
      </div>
    </div>
  );
}