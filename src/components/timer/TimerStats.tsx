import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Target, Zap, Trophy, Book } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface FocusSession {
  id: string;
  duration: number;
  date: string;
  endTime: Date;
  subject?: string;
}

interface TimeDistribution {
  morning: number;
  afternoon: number;
  evening: number;
}

interface Stats {
  todayFocusTime: number;
  weekFocusTime: number;
  totalSessions: number;
  averageSession: number;
}

const DAILY_TARGET_MINUTES = 120; // 2 hours
const WEEKLY_TARGET_MINUTES = 840; // 14 hours

export function TimerStats(): JSX.Element {
  const [stats, setStats] = useState<Stats>({
    todayFocusTime: 0,
    weekFocusTime: 0,
    totalSessions: 0,
    averageSession: 0,
  });

  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution>({
    morning: 0,
    afternoon: 0,
    evening: 0,
  });

  const [focusTimeBySubject, setFocusTimeBySubject] = useState<{[key: string]: number}>({});

  const loadStats = useCallback(() => {
    const sessions: FocusSession[] = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const now = new Date();
    const today = now.toDateString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Daily and weekly stats
    const todayFocusTime = sessions
      .filter(session => new Date(session.endTime).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0);

    const weekFocusTime = sessions
      .filter(session => new Date(session.endTime) >= oneWeekAgo)
      .reduce((total, session) => total + session.duration, 0);

    setStats({
      todayFocusTime: Math.round(todayFocusTime / 60),
      weekFocusTime: Math.round(weekFocusTime / 60),
      totalSessions: sessions.length,
      averageSession: sessions.length > 0 
        ? Math.round(sessions.reduce((t, s) => t + s.duration, 0) / sessions.length / 60)
        : 0,
    });

    // Time distribution
    let morning = 0, afternoon = 0, evening = 0, total = 0;
    sessions.forEach(session => {
      const hour = new Date(session.endTime).getHours();
      const duration = session.duration / 60;
      if (hour >= 6 && hour < 12) morning += duration;
      else if (hour >= 12 && hour < 18) afternoon += duration;
      else evening += duration;
      total += duration;
    });

    if (total > 0) {
      setTimeDistribution({
        morning: Math.round((morning / total) * 100),
        afternoon: Math.round((afternoon / total) * 100),
        evening: Math.round((evening / total) * 100),
      });
    }

    // Focus time by subject
    const subjectTotals: {[key: string]: number} = {};
    sessions.forEach(session => {
      const subject = session.subject || 'General'; // Default to 'General' if no subject
      subjectTotals[subject] = (subjectTotals[subject] || 0) + session.duration;
    });
    setFocusTimeBySubject(subjectTotals);
  }, []);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDailyProgress = (): number => {
    return Math.round(Math.min((stats.todayFocusTime / DAILY_TARGET_MINUTES) * 100, 100));
  };

  const getWeeklyProgress = (): number => {
    return Math.round(Math.min((stats.weekFocusTime / WEEKLY_TARGET_MINUTES) * 100, 100));
  };

  useEffect(() => {
    loadStats();
    window.addEventListener('storage', loadStats);
    window.addEventListener('focusSessionCompleted', loadStats);
    return () => {
      window.removeEventListener('storage', loadStats);
      window.removeEventListener('focusSessionCompleted', loadStats);
    };
  }, [loadStats]);

  return (
    <div className="space-y-6">
      <Card variant="elevated">
        <CardHeader className='p-4'>
          <CardTitle className="text-lg flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            Focus Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4">
          {/* Daily Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Today's Focus</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTime(stats.todayFocusTime)} / {formatTime(DAILY_TARGET_MINUTES)} target
              </span>
            </div>
            <Progress value={getDailyProgress()} className="h-3" />
          </div>

          {/* Weekly Progress */}
          <div>
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Weekly Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTime(stats.weekFocusTime)} / {formatTime(WEEKLY_TARGET_MINUTES)} target
              </span>
            </div>
            <Progress value={getWeeklyProgress()} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-primary p-3 rounded-xl mb-2 shadow-md">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold">{stats.totalSessions}</div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center">
                  <div className="bg-accent p-3 rounded-xl mb-2 shadow-md">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold">{formatTime(stats.averageSession)}</div>
                  <div className="text-sm text-muted-foreground">Avg. Session</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Distribution Card */}
      <Card>
        <CardHeader className='p-4'>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-warning" />
            Focus Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {stats.totalSessions === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-muted-foreground">Complete focus sessions to see your distribution</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Morning (6AM-12PM)</div>
                  <Progress value={timeDistribution.morning} className="h-3" />
                </div>
                <span className="text-sm text-muted-foreground">{timeDistribution.morning}%</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Afternoon (12PM-6PM)</div>
                  <Progress value={timeDistribution.afternoon} className="h-3" />
                </div>
                <span className="text-sm text-muted-foreground">{timeDistribution.afternoon}%</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Evening (6PM-12AM)</div>
                  <Progress value={timeDistribution.evening} className="h-3" />
                </div>
                <span className="text-sm text-muted-foreground">{timeDistribution.evening}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Focus Time by Subject */}
      <Card>
        <CardHeader className='p-4'>
          <CardTitle className="text-lg flex items-center gap-2">
            <Book className="h-5 w-5 text-info" />
            Focus by Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {Object.keys(focusTimeBySubject).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-muted-foreground">Complete focus sessions with subjects to see this breakdown</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(focusTimeBySubject).map(([subject, duration]) => (
                <div key={subject} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <span className="font-medium">{subject}</span>
                  <span className="text-muted-foreground">{formatTime(Math.round(duration / 60))}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}