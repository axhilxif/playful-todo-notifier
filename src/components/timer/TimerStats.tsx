import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FocusSession {
  id: string;
  duration: number;
  date: string;
  endTime: Date;
}

export function TimerStats() {
  const [stats, setStats] = useState({
    todayFocusTime: 0,
    weekFocusTime: 0,
    totalSessions: 0,
    averageSession: 0,
  });

  useEffect(() => {
    // Load focus sessions from localStorage
    const loadStats = () => {
      const sessions: FocusSession[] = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      const now = new Date();
      const today = now.toDateString();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate today's focus time
      const todayFocusTime = sessions
        .filter(session => new Date(session.endTime).toDateString() === today)
        .reduce((total, session) => total + session.duration, 0);

      // Calculate this week's focus time
      const weekFocusTime = sessions
        .filter(session => new Date(session.endTime) >= oneWeekAgo)
        .reduce((total, session) => total + session.duration, 0);

      // Calculate total sessions
      const totalSessions = sessions.length;

      // Calculate average session length
      const averageSession = totalSessions > 0 
        ? Math.round(sessions.reduce((total, session) => total + session.duration, 0) / totalSessions)
        : 0;

      setStats({
        todayFocusTime: Math.round(todayFocusTime / 60), // Convert to minutes
        weekFocusTime: Math.round(weekFocusTime / 60),
        totalSessions,
        averageSession: Math.round(averageSession / 60),
      });
    };

    loadStats();

    // Listen for storage changes to update stats in real-time
    const handleStorageChange = () => loadStats();
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from timer completion
    window.addEventListener('focusSessionCompleted', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focusSessionCompleted', handleStorageChange);
    };
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-soft">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          Focus Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-primary/5 rounded-lg p-4 text-center border border-primary/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Today</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatTime(stats.todayFocusTime)}
            </div>
          </div>
          
          <div className="bg-gradient-accent/5 rounded-lg p-4 text-center border border-accent/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground">This Week</span>
            </div>
            <div className="text-2xl font-bold text-accent">
              {formatTime(stats.weekFocusTime)}
            </div>
          </div>
          
          <div className="bg-gradient-success/5 rounded-lg p-4 text-center border border-success/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground">Sessions</span>
            </div>
            <div className="text-2xl font-bold text-success">
              {stats.totalSessions}
            </div>
          </div>
          
          <div className="bg-gradient-warning/5 rounded-lg p-4 text-center border border-warning/10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground">Average</span>
            </div>
            <div className="text-2xl font-bold text-warning">
              {formatTime(stats.averageSession)}
            </div>
          </div>
        </div>
        
        {stats.totalSessions === 0 && (
          <div className="text-center mt-6 p-4 bg-gradient-secondary/50 rounded-lg">
            <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              Start your first focus session to see stats!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}