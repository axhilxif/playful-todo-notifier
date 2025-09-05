import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartLine, Clock, Target, Trophy } from 'lucide-react';
import { UserStats } from '@/lib/achievements';
import { cn } from '@/lib/utils';

interface SubjectStatsProps {
  subject: string;
  stats: UserStats;
  className?: string;
}

export function SubjectStats({ subject, stats, className }: SubjectStatsProps) {
  const subjectStats = stats.subjectStats[subject] || {
    totalTime: 0,
    averageScore: 0,
    sessionsCount: 0,
    lastStudied: new Date().toISOString(),
  };

  const recentSessions = stats.timerSessions
    .filter(session => session.subject === subject)
    .slice(-5);

  const todayTime = recentSessions
    .filter(session => {
      const sessionDate = new Date(session.startTime);
      const today = new Date();
      return (
        sessionDate.getDate() === today.getDate() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((total, session) => total + session.duration, 0);

  const averageTimePerSession = subjectStats.totalTime / (subjectStats.sessionsCount || 1);
  const bestScore = Math.max(...recentSessions.map(s => s.focusScore));

  return (
    <div className={cn("grid gap-4", className)}>
      {/* Time stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Today</span>
                <span className="text-2xl font-bold">
                  {Math.round(todayTime / 60)}m
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-success" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Avg. Session</span>
                <span className="text-2xl font-bold">
                  {Math.round(averageTimePerSession / 60)}m
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Best Score</span>
                <span className="text-2xl font-bold">
                  {Math.round(bestScore * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Focus Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            {recentSessions.map((session, index) => (
              <div key={session.id} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(session.startTime).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span>{Math.round(session.duration / 60)}m</span>
                </div>
                <Progress value={session.focusScore * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <ChartLine className="h-8 w-8 text-primary" />
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {Math.round(subjectStats.averageScore * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average Focus Score
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Last studied: {new Date(subjectStats.lastStudied).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
