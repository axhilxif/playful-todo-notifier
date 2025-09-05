import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Clock, Target, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InsightData {
  streak: number;
  bestDay: string;
  totalHours: number;
  productivity: number;
}

import { calculateUserStats } from '@/lib/gamification';

export function InsightsCard() {
  const [insights, setInsights] = useState<InsightData>({
    streak: 0,
    bestDay: 'No data',
    totalHours: 0,
    productivity: 0,
  });

  useEffect(() => {
    const loadInsights = () => {
        const stats = calculateUserStats();
        const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');

        const dayTotals: { [key: string]: number } = {};
        sessions.forEach((session: any) => {
            const day = new Date(session.endTime).toDateString();
            dayTotals[day] = (dayTotals[day] || 0) + session.duration;
        });
        
        const bestDay = Object.keys(dayTotals).length > 0 ? Object.entries(dayTotals).reduce((a, b) => 
            dayTotals[a[0]] > dayTotals[b[0]] ? a : b
        )[0] : 'No data';

        setInsights({
            streak: stats.streak,
            bestDay: bestDay !== 'No data' ? new Date(bestDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'No data',
            totalHours: stats.totalFocusTime,
            productivity: stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0,
        });
    };

    loadInsights();
    
    const handleUpdate = () => loadInsights();
    window.addEventListener('focusSessionCompleted', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('focusSessionCompleted', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <Card variant="elevated">
      <CardHeader className='p-4'>
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          Your Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Main stats: stack on mobile, grid on desktop */}
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
          <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-2xl shadow-sm">
            <Flame className="h-10 w-10 text-primary" />
            <div>
              <div className="text-4xl font-bold text-primary">{insights.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-success/10 rounded-2xl shadow-sm">
            <Target className="h-10 w-10 text-success" />
            <div>
              <div className="text-4xl font-bold text-success">{insights.productivity}%</div>
              <div className="text-sm text-muted-foreground">Productivity</div>
            </div>
          </div>
        </div>
        {/* Details: stack vertically */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 bg-accent/10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="text-base font-medium">Best Day</span>
            </div>
            <span className="text-base font-bold text-accent">{insights.bestDay}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-warning/10 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-base font-medium">Total Hours</span>
            </div>
            <span className="text-base font-bold text-warning">{insights.totalHours}h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}