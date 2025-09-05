import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Clock, Target, Flame, Trophy, Star, Zap, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateUserStats } from '@/lib/gamification';
import { generateSmartInsights, SmartInsight } from '@/lib/smart-insights';
import { getTodos, getPlans } from '@/lib/storage'; // Import getTodos and getPlans
import { generateSmartInsights, SmartInsight } from '@/lib/smart-insights';

interface EnhancedInsightData {
  streak: number;
  bestDay: string;
  totalHours: number;
  productivity: number;
  level: number;
  xpProgress: number;
  nextAchievement?: {
    name: string;
    progress: number;
    total: number;
  };
  weeklyGoal: {
    completed: number;
    target: number;
  };
  motivationalTip: string;
  smartInsights: SmartInsight[]; // New: Array of smart insights
}

const MOTIVATIONAL_TIPS = [
  "🚀 You're on fire! Keep up the momentum!",
  "💪 Small steps lead to big achievements!",
  "🌟 Every task completed is progress made!",
  "🎯 Focus on one thing at a time for better results!",
  "⚡ Take breaks to recharge your productivity!",
  "🌈 Celebrate your wins, no matter how small!",
  "🧠 Planning ahead saves time later!",
  "🔥 Consistency beats intensity every time!",
];

export function EnhancedInsightsCard() {
  const [insights, setInsights] = useState<EnhancedInsightData>({
    streak: 0,
    bestDay: 'No data',
    totalHours: 0,
    productivity: 0,
    level: 1,
    xpProgress: 0,
    weeklyGoal: { completed: 0, target: 10 },
    motivationalTip: '',
    smartInsights: [], // Initialize with empty array
  });

  useEffect(() => {
    const loadInsights = () => {
      const stats = calculateUserStats();
      const todos = getTodos(); // Fetch real todos
      const plans = getPlans(); // Fetch real plans

      const smartInsights = generateSmartInsights(plans, todos, stats);

      // Calculate best day from productiveHours
      const bestHour = stats.productiveHours.indexOf(Math.max(...stats.productiveHours));
      const bestDay = bestHour !== -1 ? `Around ${bestHour}:00` : 'No data';

      setInsights({
        streak: stats.streak,
        bestDay: bestDay,
        totalHours: stats.totalFocusTime,
        productivity: stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0,
        level: stats.level,
        xpProgress: (stats.xp % 100),
        weeklyGoal: {
          completed: stats.weeklyStats.completedTodos,
          target: 10 // This target could be dynamic or user-defined
        },
        motivationalTip: MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)],
        smartInsights: smartInsights,
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
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-display flex items-center gap-2 text-primary">
          <Brain className="h-6 w-6" />
          Your Insights Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-4">
        
        {/* Level Progress */}
        <div className="p-4 bg-gradient-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">Level {insights.level}</span>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {insights.xpProgress}/100 XP
            </Badge>
          </div>
          <Progress value={insights.xpProgress} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-4 bg-gradient-primary/5 rounded-xl border border-primary/10">
            <Flame className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold text-primary">{insights.streak}</div>
              <div className="text-xs text-muted-foreground font-medium">Day Streak</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gradient-success/5 rounded-xl border border-success/10">
            <Target className="h-8 w-8 text-success" />
            <div>
              <div className="text-2xl font-bold text-success">{insights.productivity}%</div>
              <div className="text-xs text-muted-foreground font-medium">Productivity</div>
            </div>
          </div>
        </div>
        
        {/* Weekly Goal */}
        <div className="p-4 bg-gradient-accent/5 rounded-xl border border-accent/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="font-semibold text-accent">Weekly Goal</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {insights.weeklyGoal.completed}/{insights.weeklyGoal.target}
            </span>
          </div>
          <Progress 
            value={(insights.weeklyGoal.completed / insights.weeklyGoal.target) * 100} 
            className="h-2" 
          />
        </div>
        
        {/* Detailed Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gradient-warning/5 rounded-lg border border-warning/10">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Best Day</span>
            </div>
            <span className="text-sm font-bold text-warning">{insights.bestDay}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-info/5 rounded-lg border border-info/10">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-info" />
              <span className="text-sm font-medium">Focus Time</span>
            </div>
            <span className="text-sm font-bold text-info">{insights.totalHours}h</span>
          </div>
        </div>

        {/* Motivational Tip */}
        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-primary mb-1">Daily Inspiration</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {insights.motivationalTip}
              </div>
            </div>
          </div>
        </div>

        {/* Smart Insights */}
        {insights.smartInsights.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary">AI Suggestions</h3>
            {insights.smartInsights.map(insight => (
              <div
                key={insight.id}
                className={`p-4 rounded-xl border ${insight.type === 'success' ? 'bg-gradient-success/5 border-success/10' : insight.type === 'warning' ? 'bg-gradient-warning/5 border-warning/10' : 'bg-gradient-info/5 border-info/10'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${insight.type === 'success' ? 'text-success' : insight.type === 'warning' ? 'text-warning' : 'text-info'}`}>
                    {insight.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`${insight.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : insight.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-info/10 text-info border-info/20'}`}
                  >
                    {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.message}</p>
                {insight.action && (
                  <a href={insight.action.route}>
                    <Button variant="outline" size="sm">
                      {insight.action.label}
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}