import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, RotateCcw, Trophy, Clock, Zap, Coffee, Music, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerStats } from '@/components/timer/TimerStats';
import { InsightsCard } from '@/components/insights/InsightsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimerSession } from '@/types';
import { getTimerSession, setTimerSession } from '@/lib/storage';
import { notificationService } from '@/lib/notification-service';
import { useToast } from '@/hooks/use-toast';
import { App } from '@capacitor/app';
import { processUserAction, loadUserProfile, saveUserProfile, calculateUserStats, calculateLevel } from '@/lib/gamification';
import { getSubjects, addSubject } from '@/lib/subject-storage';
import { FunTimerFeatures, MOTIVATIONAL_QUOTES, FUN_FEATURES } from '@/components/timer/FunTimerFeatures';

interface TimerMode {
  id: string;
  name: string;
  duration: number;
  icon: JSX.Element;
  gradient: string;
}

const TIMER_MODES: TimerMode[] = [
  { id: 'stopwatch', name: 'Stopwatch', duration: 0, icon: <Clock className="h-4 w-4" />, gradient: 'bg-gradient-to-br from-stone-500 to-stone-700' }, // New mode
  { id: 'focus-25', name: 'Focus', duration: 25 * 60, icon: <Play className="h-4 w-4" />, gradient: 'bg-gradient-to-br from-sky-500 to-blue-600' },
  { id: 'focus-45', name: 'Deep Focus', duration: 45 * 60, icon: <Zap className="h-4 w-4" />, gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600' },
  { id: 'break-5', name: 'Short Break', duration: 5 * 60, icon: <Coffee className="h-4 w-4" />, gradient: 'bg-gradient-to-br from-emerald-400 to-green-600' },
  { id: 'break-15', name: 'Long Break', duration: 15 * 60, icon: <Music className="h-4 w-4" />, gradient: 'bg-gradient-to-br from-amber-400 to-orange-500' },
];

export default function Timer() {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMode, setSelectedMode] = useState<TimerMode>(TIMER_MODES[0]); // Set stopwatch as default
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(getSubjects());
  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0] || "General");
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyFocusTime, setDailyFocusTime] = useState(0);
  const { toast } = useToast();
  const [newSubject, setNewSubject] = useState<string>('');
  const [isAddSubjectDialogOpen, setIsAddSubjectDialogOpen] = useState(false);

  // FunTimerFeatures state
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);

  useEffect(() => {
    setAvailableSubjects(getSubjects());
  }, [newSubject]);


  // Calculate and update daily focus time and other stats
  useEffect(() => {
    const updateStats = () => {
      const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]') as any[];
      const today = new Date().toDateString();
      const dailyTotal = focusSessions.reduce((sum: number, session: any) => {
        if (new Date(session.date).toDateString() === today) {
          return sum + session.duration;
        }
        return sum;
      }, 0);
      setDailyFocusTime(dailyTotal);
      const stats = calculateUserStats();
      setDailyStreak(stats.streak);

      console.log('Total Sessions:', stats.focusSessions.length); // Add this line

      // Productivity Pet logic
      const recentSessions = focusSessions
        .filter(s => s.endTime && new Date(s.endTime).getTime() > Date.now() - 24 * 3600 * 1000);
      const happiness = 50 + recentSessions.length * 10 - stats.streak * 2;
    };

    updateStats(); // Call on mount

    // Listen for custom event to update stats
    window.addEventListener('focusSessionCompleted', updateStats);

    return () => {
      window.removeEventListener('focusSessionCompleted', updateStats);
    };
  }, []); // Empty dependency array to run once on mount and clean up on unmount

  const handleStart = useCallback(() => {
    const now = new Date();
    let initialTime = currentTime; // Use current time for resuming

    if (!session) { // If starting a new session
      if (selectedMode.id === 'stopwatch') {
        initialTime = 0; // Start from 0 for stopwatch
        setCurrentTime(0);
      } else {
        initialTime = selectedMode.duration;
        setCurrentTime(selectedMode.duration); // Set currentTime for display
      }
    }

    const newSession: TimerSession = {
      id: Date.now().toString(),
      startTime: now,
      duration: selectedMode.duration,
      isActive: true,
      pausedTime: initialTime, // Store the initial time (remaining time)
      subject: selectedSubject,
      breaks: 0, // Added missing property
      focusScore: 0, // Added missing property
    };
    
    setSession(newSession);
    setTimerSession(newSession);
    setIsRunning(true);
    notificationService.playHaptic();
    
    toast({
      title: "Timer started! ⏰",
      description: "Focus mode activated. Timer will pause if you switch apps.",
    });
  }, [currentTime, toast, selectedMode, session, selectedSubject]);

  const handlePause = useCallback(() => {
    if (session) {
      const updatedSession = {
        ...session,
        isActive: false,
        pausedTime: currentTime,
      };
      setSession(updatedSession);
      setTimerSession(updatedSession);
      setIsRunning(false);
      notificationService.playHaptic();
      
      toast({
        title: "Timer paused ⏸️",
        description: "Take a break! Resume when you're ready.",
      });
    }
  }, [session, currentTime, toast]);

  const handleStop = useCallback(() => {
    if (session) {
      let actualDuration;
      if (selectedMode.id === 'stopwatch') {
        actualDuration = currentTime; // Elapsed time is current time for stopwatch
      } else {
        actualDuration = selectedMode.duration - currentTime; // Remaining time for countdown
      }

      const finalSession = {
        ...session,
        endTime: new Date(),
        duration: actualDuration, // Use actual elapsed time
        isActive: false,
      };
      
      // Save completed session to localStorage for statistics
      const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      focusSessions.push({
        id: finalSession.id,
        duration: finalSession.duration, // Use actual elapsed time
        date: finalSession.endTime.toDateString(),
        endTime: finalSession.endTime,
        subject: finalSession.subject,
      });
      localStorage.setItem('focusSessions', JSON.stringify(focusSessions));

      // Increment totalBreaks if it was a break session
      if (selectedMode.id.startsWith('break-')) {
        const userProfile = loadUserProfile(); // Load current profile
        userProfile.totalBreaks = (userProfile.totalBreaks || 0) + 1;
        saveUserProfile(userProfile); // Save updated profile
      }
      
      // Dispatch custom event to update stats
      window.dispatchEvent(new CustomEvent('focusSessionCompleted'));
      
      setSession(null);
      setTimerSession(null);
      setCurrentTime(0);
      setIsRunning(false);
      notificationService.playHaptic();
      
      const hours = Math.floor(actualDuration / 3600);
      const minutes = Math.floor((actualDuration % 3600) / 60);
      const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      const { levelUp, newLevel, newAchievements } = processUserAction('complete-focus-session');

      toast({
        title: "Session completed! 🎉",
        description: `Great work! You focused for ${timeText}. +50 XP`,
      });

      if (levelUp) {
        toast({ title: 'Level Up!', description: `You reached level ${newLevel}!` });
      }
      newAchievements.forEach(ach => {
        toast({ title: 'Achievement Unlocked!', description: `🎉 ${ach.name}` });
      });
    }
  }, [session, toast, selectedMode, currentTime]);

  const handleReset = useCallback(() => {
    setSession(null);
    setTimerSession(null);
    setCurrentTime(0);
    setIsRunning(false);
    notificationService.playHaptic();
    
    toast({
      title: "Timer reset 🔄",
      description: "Ready for a new session!",
    });
  }, [toast]);

  // Load saved session on mount
  useEffect(() => {
    const savedSession = getTimerSession();
    if (savedSession) {
      setSession(savedSession);
      if (savedSession.isActive) {
        setIsRunning(true);
      }
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - new Date(savedSession.startTime).getTime()) / 1000);
      const base = typeof savedSession.pausedTime === 'number' ? savedSession.pausedTime : savedSession.duration;
      const isStopwatch = savedSession.duration === 0;
      if (isStopwatch) {
        setCurrentTime(Math.max(0, base + elapsed));
      } else {
        setCurrentTime(Math.max(0, base - elapsed));
      }
    }
  }, []);

  // Countdown/Count-up effect computed from startTime + pausedTime (robust across sleep)
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning && session) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
        const base = typeof session.pausedTime === 'number' ? session.pausedTime : selectedMode.duration;
        if (selectedMode.id === 'stopwatch') {
          setCurrentTime(base + elapsed);
        } else {
          const remaining = Math.max(0, base - elapsed);
          setCurrentTime(remaining);
          if (remaining <= 0) {
            handleStop();
          }
        }
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRunning, session, selectedMode, handleStop]);

  // Pause when app goes to background or window loses focus (switch/minimize). Continue through device sleep via time-based calc.
  useEffect(() => {
    const unsub = App.addListener('appStateChange', ({ isActive }) => {
      if (!isActive && isRunning) {
        // Compute current time snapshot and pause
        const now = new Date();
        if (session) {
          const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
          const base = typeof session.pausedTime === 'number' ? session.pausedTime : selectedMode.duration;
          const newCurrent = selectedMode.id === 'stopwatch' ? (base + elapsed) : Math.max(0, base - elapsed);
          setCurrentTime(newCurrent);
          const updated = { ...session, isActive: false, pausedTime: newCurrent } as any;
          setSession(updated);
          setTimerSession(updated);
          setIsRunning(false);
        } else {
          handlePause();
        }
      }
    });

    const onBlur = () => {
      if (isRunning) {
        // Pause on explicit app switch/minimize
        handlePause();
      }
    };

    window.addEventListener('blur', onBlur);

    return () => {
      unsub && (unsub as any).remove && (unsub as any).remove();
      window.removeEventListener('blur', onBlur);
    };
  }, [isRunning, handlePause, session, selectedMode]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeatureClick = (featureId: string) => {
    toast({ title: 'Feature Clicked!', description: `You clicked on ${featureId}` });
    // Here you would add logic to navigate or open a modal based on the featureId
  };

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="Focus Timer"
        subtitle="Stay productive and track your focus time"
        icon={<Play className="h-6 w-6" />}
      />
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-warning/20 rounded-xl px-4 py-2 text-warning text-sm font-medium shadow-sm">
          <Trophy className="h-4 w-4" />
          {dailyStreak} day streak
        </div>
        <div className="flex items-center gap-2 bg-primary/20 rounded-xl px-4 py-2 text-primary text-sm font-medium shadow-sm">
          <Clock className="h-4 w-4" />
          {Math.round(dailyFocusTime / 60)} mins today
        </div>
      </div>

      

      {/* Subject Selection */}
      <Card className="mb-6">
        <CardHeader className='p-4'>
          <CardTitle className="text-lg flex items-center gap-2">
            📚 Subject Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Select 
              value={selectedSubject} 
              onValueChange={(val) => {
                if (val === '__add__') {
                  setIsAddSubjectDialogOpen(true);
                  return;
                }
                setSelectedSubject(val);
              }}
              disabled={isRunning}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
                <SelectItem value="__add__">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add new subject
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

          {/* Add Subject Sheet */}
          <Sheet open={isAddSubjectDialogOpen} onOpenChange={setIsAddSubjectDialogOpen}>
            <SheetContent side="bottom" className="space-y-4">
              <SheetHeader>
                <SheetTitle>Add a new subject</SheetTitle>
                <SheetDescription>Type the subject name to add it to your list.</SheetDescription>
              </SheetHeader>
              <div className="space-y-3">
                <Input
                  placeholder="e.g., Mathematics"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  disabled={isRunning}
                />
              </div>
              <SheetFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddSubjectDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    const name = newSubject.trim();
                    if (!name) {
                      toast({ title: 'Subject name required', description: 'Please enter a subject name.' });
                      return;
                    }
                    addSubject(name);
                    setSelectedSubject(name);
                    setNewSubject('');
                    setIsAddSubjectDialogOpen(false);
                    toast({ title: 'Subject added', description: `Added "${name}" to your subjects.` });
                  }}
                >
                  Add
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          </div>
        </CardContent>
      </Card>

      {/* Main Timer Card */}
      <Card className={cn(
        "mb-6 rounded-2xl shadow-lg transition-all duration-500",
        isRunning ? selectedMode.gradient : "bg-card",
        isRunning ? "border-transparent shadow-lg animate-pulse ring-1 ring-white/20" : "border-border"
      )}>
        <CardHeader className="text-center p-4">
          <CardTitle className={cn(
            "text-3xl font-bold transition-colors",
            isRunning ? "text-white" : "text-primary"
          )}>
            {session ? 
              (isRunning ? 
                `🎯 Focus Mode` : 
                '⏸️ Paused') : 
              '⏰ Ready to Focus'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
          {/* Timer Display */}
          <TimerDisplay
            time={formatTime(currentTime)}
            isRunning={isRunning}
            mode={selectedMode.name}
            totalTime={selectedMode.duration}
            remainingTime={currentTime}
          />
          
          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!session ? (
                <Button
                  onClick={handleStart}
                  size="lg"
                  variant="default"
                >
                <Play className="h-5 w-5 mr-2" />
                Start Timer
              </Button>
            ) : (
              <>
                {isRunning ? (
                  <Button
                    onClick={handlePause}
                    size="default"
                    variant="outline"
                    className="px-4"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    onClick={handleStart}
                    size="default"
                    variant="default"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Resume
                  </Button>
                )}
                
                <Button
                  onClick={handleStop}
                  size="default"
                  variant="outline"
                  className="px-4"
                >
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
                
                <Button
                  onClick={handleReset}
                  size="default"
                  variant="outline"
                  className="px-4"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timer Modes */}
      <div className="flex flex-nowrap overflow-x-auto gap-3 mb-6 pb-2">
        {TIMER_MODES.map(mode => (
          <Button
            key={mode.id}
            variant={selectedMode.id === mode.id ? "default" : "outline"}
            disabled={isRunning}
            className="flex-shrink-0"
            onClick={() => {
              setSelectedMode(mode);
              setCurrentTime(mode.duration);
              notificationService.playHaptic();
            }}
          >
            <div className="flex items-center gap-2">
              {mode.icon}
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-medium flex items-center gap-1">
                  {mode.name}
                  {selectedMode.id === mode.id && <Check className="h-4 w-4" />}
                </span>
                <span className="text-xs opacity-85">{Math.round(mode.duration / 60)} min</span>
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Fun Timer Features */}
      <FunTimerFeatures
        currentQuote={currentQuote}
        onFeatureClick={handleFeatureClick}
      />

      {/* Stats Card */}
      <TimerStats />
      
      {/* Insights Card */}
      <div className="mt-6">
        <InsightsCard />
      </div>
    </div>
  );
}