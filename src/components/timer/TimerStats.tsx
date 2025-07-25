import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TimerStats() {
  // In a real app, you'd track these stats in localStorage or a database
  const stats = {
    todayFocusTime: 0,
    weekFocusTime: 0,
    totalSessions: 0,
    averageSession: 0,
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📊 Focus Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {formatTime(stats.todayFocusTime)}
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-accent">
              {formatTime(stats.weekFocusTime)}
            </div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-success">
              {stats.totalSessions}
            </div>
            <div className="text-xs text-muted-foreground">Total Sessions</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-warning">
              {formatTime(stats.averageSession)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Session</div>
          </div>
        </div>
        
        {stats.totalSessions === 0 && (
          <div className="text-center mt-4 text-muted-foreground text-sm">
            Start your first focus session to see stats! 🚀
          </div>
        )}
      </CardContent>
    </Card>
  );
}