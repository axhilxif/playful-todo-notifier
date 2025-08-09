import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Clock, Target, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface InsightData {
  streak: number;
  bestDay: string;
  totalHours: number;
  productivity: number;
}

export function InsightsCard() {
  const [insights, setInsights] = useState<InsightData>({
    streak: 0,
    bestDay: 'No data',
    totalHours: 0,
    productivity: 0,
  });

  useEffect(() => {
    const loadInsights = () => {
      const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      const todos = JSON.parse(localStorage.getItem('todos') || '[]');
      
      if (sessions.length === 0) return;

      // Calculate streak
      const sortedSessions = sessions
        .map((s: any) => new Date(s.endTime).toDateString())
        .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
      
      const uniqueDays = [...new Set(sortedSessions)];
      let streak = 0;
      const today = new Date().toDateString();
      
      if (uniqueDays[0] === today || uniqueDays[0] === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
        for (let i = 0; i < uniqueDays.length; i++) {
          const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
          if (uniqueDays[i] === expectedDate) {
            streak++;
          } else {
            break;
          }
        }
      }

      // Calculate best day
      const dayTotals: { [key: string]: number } = {};
      sessions.forEach((session: any) => {
        const day = new Date(session.endTime).toDateString();
        dayTotals[day] = (dayTotals[day] || 0) + session.duration;
      });
      
      const bestDay = Object.entries(dayTotals).reduce((a, b) => 
        dayTotals[a[0]] > dayTotals[b[0]] ? a : b
      )[0];

      // Calculate total hours
      const totalSeconds = sessions.reduce((total: number, session: any) => total + session.duration, 0);
      const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

      // Calculate productivity (completed todos vs total)
      const completedTodos = todos.filter((todo: any) => todo.completed).length;
      const productivity = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

      setInsights({
        streak,
        bestDay: bestDay ? new Date(bestDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'No data',
        totalHours,
        productivity,
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
    <Card className="bg-gradient-hero/10 border-primary/20 shadow-glow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <TrendingUp className="h-5 w-5" />
          Your Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats: stack on mobile, grid on desktop */}
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
          <div className="flex items-center gap-4 p-4 bg-gradient-primary/5 rounded-xl border border-primary/10">
            <Flame className="h-9 w-9 text-primary" />
            <div>
              <div className="text-3xl font-bold text-primary">{insights.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gradient-success/5 rounded-xl border border-success/10">
            <Target className="h-9 w-9 text-success" />
            <div>
              <div className="text-3xl font-bold text-success">{insights.productivity}%</div>
              <div className="text-sm text-muted-foreground">Productivity</div>
            </div>
          </div>
        </div>
        {/* Details: stack vertically */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 bg-gradient-accent/5 rounded-xl border border-accent/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="text-base font-medium">Best Day</span>
            </div>
            <span className="text-base font-bold text-accent">{insights.bestDay}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gradient-warning/5 rounded-xl border border-warning/10">
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