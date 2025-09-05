import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PageHeader } from '@/components/ui/page-header';

import { calculateUserStats, loadUserProfile } from '@/lib/gamification';
import { getAllSuggestionsAuto, AISuggestion } from '@/lib/ai-suggestions';
import { getTodos, getPlans } from '@/lib/storage';
import { getSubjects, addSubject } from '@/lib/subject-storage';
import {
  Brain, Sparkles, Target, Clock, ListChecks, Calendar, Trophy, BookOpen, Plus,
  BarChart3, TrendingUp, PieChart, Activity, Flame, CheckCircle2, AlertTriangle, ArrowUpRight,
  Timer as TimerIcon, Sun, Moon, Sunset, Sunrise, Grid
} from 'lucide-react';

// Local storage key for exam marks per subject
const SUBJECT_EXAMS_KEY = 'subjectExamMarks';

interface ExamMark {
  id: string;
  subject: string;
  name: string;
  date: string; // ISO
  score: number; // achieved
  total: number; // total marks
}

type SubjectExamMap = Record<string, ExamMark[]>; // subject -> exam list

function loadExamMarks(): SubjectExamMap {
  try {
    return JSON.parse(localStorage.getItem(SUBJECT_EXAMS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveExamMarks(map: SubjectExamMap) {
  localStorage.setItem(SUBJECT_EXAMS_KEY, JSON.stringify(map));
}

function calcExamStats(map: SubjectExamMap) {
  const bySubject: Record<string, { avg: number; best: number; exams: number; lastDate?: string; last5: number[] }> = {};
  for (const [subject, exams] of Object.entries(map)) {
    if (exams.length === 0) {
      bySubject[subject] = { avg: 0, best: 0, exams: 0, last5: [] };
      continue;
    }
    const percents = exams.map(e => e.total > 0 ? (e.score / e.total) * 100 : 0);
    const sumPct = percents.reduce((sum, v) => sum + v, 0);
    const lastDate = exams.map(e => e.date).sort().slice(-1)[0];
    const last5 = exams.slice(-5).map(e => e.total > 0 ? Math.round((e.score / e.total) * 100) : 0);
    bySubject[subject] = {
      avg: Math.round((sumPct / exams.length) * 10) / 10,
      best: Math.round(Math.max(...percents)),
      exams: exams.length,
      lastDate,
      last5
    };
  }
  return bySubject;
}

function useRecentDaysFocus(sessions: any[], days = 7) {
  const buckets = Array(days).fill(0);
  const now = new Date();
  sessions.forEach(s => {
    const d = new Date(s.endTime || s.startTime);
    const diff = Math.floor((now.getTime() - d.getTime()) / (24 * 3600 * 1000));
    if (diff >= 0 && diff < days) {
      buckets[days - 1 - diff] += s.duration / 3600; // hours
    }
  });
  const max = Math.max(1, ...buckets);
  return { buckets, max };
}

function useDailyHeatmap(sessions: any[], days = 28) {
  const now = new Date();
  const byDay: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    byDay[d.toDateString()] = 0;
  }
  sessions.forEach(s => {
    const d = new Date(s.endTime || s.startTime).toDateString();
    if (byDay[d] !== undefined) byDay[d] += s.duration / 3600;
  });
  const keys = Object.keys(byDay);
  const values = keys.map(k => byDay[k]);
  const max = Math.max(1, ...values);
  // chunk into weeks (rows) of 7
  const cells: number[][] = [];
  for (let i = days - 1; i >= 0; i -= 7) {
    const row: number[] = [];
    for (let j = i - 6; j <= i; j++) {
      if (j < 0) continue;
      const d = new Date();
      d.setDate(now.getDate() - j);
      row.push(byDay[d.toDateString()]);
    }
    if (row.length) cells.push(row);
  }
  return { cells, max };
}

export default function Insights() {
  const [stats, setStats] = useState<any | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [todos, setTodosState] = useState<any[]>([]);
  const [plans, setPlansState] = useState<any[]>([]);
  const [focusSessions, setFocusSessions] = useState<any[]>([]);
  const [profile, setProfile] = useState<any | null>(null);

  // Subject Manager
  const [subjects, setSubjects] = useState<string[]>(getSubjects());
  const [examMap, setExamMap] = useState<SubjectExamMap>(loadExamMarks());
  const [isAddMarkOpen, setIsAddMarkOpen] = useState(false);
  const [markSubject, setMarkSubject] = useState<string>(subjects[0] || 'General');
  const [markName, setMarkName] = useState('');
  const [markDate, setMarkDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [markScore, setMarkScore] = useState<string>('');
  const [markTotal, setMarkTotal] = useState<string>('100');

  useEffect(() => {
    const load = () => {
      const s = calculateUserStats();
      setStats(s);
      setSuggestions(getAllSuggestionsAuto(s));
      setTodosState(getTodos());
      setPlansState(getPlans());
      try {
        const fs = JSON.parse(localStorage.getItem('focusSessions') || '[]');
        setFocusSessions(fs);
      } catch {
        setFocusSessions([]);
      }
      setProfile(loadUserProfile());
      setSubjects(getSubjects());
      setExamMap(loadExamMarks());
    };

    load();

    const handleUpdate = () => load();
    window.addEventListener('focusSessionCompleted', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('focusSessionCompleted', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const xpProgress = profile ? profile.xp % 100 : 0;
  const subjectExamStats = useMemo(() => calcExamStats(examMap), [examMap]);
  const { buckets: recentBuckets, max: recentMax } = useRecentDaysFocus(focusSessions, 7);
  const { cells: heatmapCells, max: heatmapMax } = useDailyHeatmap(focusSessions, 28);

  // Derived analytics
  const focusBySubject = useMemo(() => {
    if (!stats?.timerSessions) return [] as { subject: string; hours: number }[];
    const map: Record<string, number> = {};
    stats.timerSessions.forEach((s: any) => {
      const subj = s.subject || 'General';
      map[subj] = (map[subj] || 0) + (s.duration || 0);
    });
    const arr = Object.entries(map).map(([subject, secs]) => ({ subject, hours: Math.round((secs / 3600) * 10) / 10 }));
    arr.sort((a, b) => b.hours - a.hours);
    return arr.slice(0, 5);
  }, [stats]);

  const timeOfDaySplit = useMemo(() => {
    if (!stats?.timerSessions) return { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const sum = { morning: 0, afternoon: 0, evening: 0, night: 0 } as any;
    stats.timerSessions.forEach((s: any) => {
      const hour = new Date(s.startTime).getHours();
      const h = (s.duration || 0) / 3600;
      if (hour >= 5 && hour < 12) sum.morning += h;
      else if (hour >= 12 && hour < 17) sum.afternoon += h;
      else if (hour >= 17 && hour < 22) sum.evening += h;
      else sum.night += h;
    });
    const total = Math.max(1, sum.morning + sum.afternoon + sum.evening + sum.night);
    return {
      morning: Math.round((sum.morning / total) * 100),
      afternoon: Math.round((sum.afternoon / total) * 100),
      evening: Math.round((sum.evening / total) * 100),
      night: Math.round((sum.night / total) * 100),
    };
  }, [stats]);

  const todoAnalytics = useMemo(() => {
    const now = new Date();
    const overdue = todos.filter((t: any) => !t.completed && t.dueDate && new Date(t.dueDate) < now).length;
    const total = todos.length;
    const completed = todos.filter((t: any) => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorities = ['high', 'medium', 'low'];
    const byPriority = priorities.map(p => {
      const list = todos.filter((t: any) => t.priority === p);
      const comp = list.filter((t: any) => t.completed).length;
      return { priority: p, total: list.length, completed: comp, rate: list.length ? Math.round((comp / list.length) * 100) : 0 };
    });

    // avg completion time in hours (createdAt -> completedAt); fallback to dueDate if createdAt missing
    const completedWithTimes = todos.filter((t: any) => t.completed && (t.createdAt || t.dueDate) && t.completedAt);
    let avgHours = 0;
    if (completedWithTimes.length > 0) {
      const sum = completedWithTimes.reduce((acc: number, t: any) => {
        const start = new Date(t.createdAt || t.dueDate).getTime();
        const end = new Date(t.completedAt).getTime();
        return acc + Math.max(0, (end - start) / 3600000);
      }, 0);
      avgHours = Math.round((sum / completedWithTimes.length) * 10) / 10;
    }

    return { overdue, completionRate, byPriority, avgHours };
  }, [todos]);

  // Extended AI suggestions (exam + patterns)
  const extendedSuggestions: AISuggestion[] = useMemo(() => {
    if (!stats) return [] as AISuggestion[];
    const ext: AISuggestion[] = [];

    for (const [subj, info] of Object.entries(subjectExamStats)) {
      const focusSeconds = (stats.timerSessions || []).filter((s: any) => s.subject === subj).reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
      const focusHours = focusSeconds / 3600;
      if (info.exams >= 2 && info.avg < 60 && focusHours > 3) {
        ext.push({
          id: `improve-${subj}`,
          message: `Target ${subj}: average ${info.avg}%. Convert your ${Math.round(focusHours)}h focus into results with spaced repetition and past papers.`,
          type: 'productivity',
          priority: 'high'
        });
      }
      if (info.exams >= 2 && info.avg >= 85 && focusHours >= 2) {
        ext.push({
          id: `maintain-${subj}`,
          message: `${subj} is strong (avg ${info.avg}%). Maintain with short periodic review sessions (30 min/week).`,
          type: 'achievement',
          priority: 'low'
        });
      }
    }

    const afternoon = (stats.productiveHours || []).slice(13, 17).reduce((a: number, b: number) => a + b, 0);
    if (afternoon < 1 && stats.completedTodos < stats.totalTodos / 2) {
      ext.push({ id: 'afternoon-plan', message: 'Afternoon dip detected. Schedule lighter todos or 5–10 min breaks after 2 PM.', type: 'planning', priority: 'medium' });
    }

    if (todoAnalytics.overdue > 0) {
      ext.push({ id: 'clear-overdues', message: `You have ${todoAnalytics.overdue} overdue task(s). Do a quick sweep to reset momentum.`, type: 'planning', priority: 'high' });
    }

    return ext;
  }, [stats, subjectExamStats, todoAnalytics]);

  // Composite productivity score (0-100) from several normalized factors
  const productivityScore = useMemo(() => {
    if (!stats) return 0;
    const focus = Math.min(100, Math.round((stats.totalFocusTime / 10) * 100)); // cap at 10h/day avg
    const todoRate = stats.totalTodos > 0 ? Math.round((stats.completedTodos / stats.totalTodos) * 100) : 0;
    const streak = Math.min(100, stats.streak * 10);
    const balancedHours = 100 - Math.abs(50 - timeOfDaySplit.afternoon) - Math.abs(30 - timeOfDaySplit.morning) / 2; // heuristic
    const avg = Math.round((focus * 0.35 + todoRate * 0.35 + streak * 0.15 + balancedHours * 0.15));
    return Math.max(0, Math.min(100, avg));
  }, [stats, timeOfDaySplit]);

  if (!stats || !profile) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-6 w-40 bg-muted rounded mb-4" />
        <div className="animate-pulse h-32 w-full bg-muted rounded" />
      </div>
    );
  }

  // Subject Manager handlers
  const handleAddSubject = () => {
    const name = prompt('New subject name');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    addSubject(trimmed);
    setSubjects(getSubjects());
    if (!examMap[trimmed]) {
      const next = { ...examMap, [trimmed]: [] };
      setExamMap(next);
      saveExamMarks(next);
    }
  };

  const handleAddExamMark = () => {
    const score = parseFloat(markScore);
    const total = parseFloat(markTotal);
    if (!markSubject || !markName || isNaN(score) || isNaN(total) || total <= 0) return;
    const newMark: ExamMark = {
      id: `${Date.now()}`,
      subject: markSubject,
      name: markName,
      date: new Date(markDate).toISOString(),
      score,
      total,
    };
    const map = loadExamMarks();
    map[markSubject] = [...(map[markSubject] || []), newMark];
    saveExamMarks(map);
    setExamMap(map);
    setIsAddMarkOpen(false);
    setMarkName('');
    setMarkScore('');
  };

  const removeExam = (subject: string, id: string) => {
    const map = loadExamMarks();
    map[subject] = (map[subject] || []).filter(e => e.id !== id);
    saveExamMarks(map);
    setExamMap(map);
  };

  return (
    <div className="pb-20 px-4 pt-6 space-y-6">
      <PageHeader
        title="Insights"
        subtitle="It reflects you"
        icon={<Brain className="h-6 w-6" />}
      />

      {/* Summary */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 flex items-center">
          <CardTitle className="text-lg flex items-center gap-2 flex-1">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" /> Your Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Total Focus</div>
            <div className="text-xl font-bold text-primary">{stats.totalFocusTime}h</div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Completed Todos</div>
            <div className="text-xl font-bold text-success">{stats.completedTodos}</div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Current Streak</div>
            <div className="text-xl font-bold text-accent">{stats.streak} days</div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Productivity Score</div>
            <div className="text-xl font-bold text-warning">{productivityScore}/100</div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Level</div>
            <div className="text-xl font-bold text-primary">{profile.level}</div>
            <div className="mt-2">
              <Progress value={xpProgress} className="h-1.5" />
              <div className="text-[11px] text-muted-foreground mt-1">{xpProgress}/100 XP</div>
            </div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Perfect Days</div>
            <div className="text-xl font-bold text-success">{stats.perfectDays}</div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Longest Session</div>
            <div className="text-xl font-bold text-accent">{stats.longestSession}m</div>
          </Card>
          <Card variant="outlined" className="p-3">
            <div className="text-xs text-muted-foreground">Total Breaks</div>
            <div className="text-xl font-bold text-warning">{stats.totalBreaks}</div>
          </Card>
        </CardContent>
      </Card>

      {/* Heatmap + Focus by Subject */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 flex items-center">
            <CardTitle className="text-base flex items-center gap-2 flex-1"><Grid className="h-5 w-5 text-primary flex-shrink-0" /> 4 Weeks Focus Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {heatmapCells.map((row, i) => (
                <div key={i} className="flex items-center gap-1">
                  {row.map((v, j) => {
                    const intensity = heatmapMax > 0 ? v / heatmapMax : 0;
                    const opacity = Math.max(0.05, Math.min(1, intensity));
                    return (
                      <div key={j} title={`${v.toFixed(1)}h`} className="h-4 w-4 rounded-sm border border-border" style={{ backgroundColor: `rgba(99,102,241,${opacity})` }} />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">Darker = more focus hours</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 p-4"><BarChart3 className="h-5 w-5 text-primary" /> Top Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {focusBySubject.map((s) => (
              <div key={s.subject} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{s.subject}</span>
                  <span className="text-muted-foreground">{s.hours}h</span>
                </div>
                <Progress value={Math.min(100, (s.hours / Math.max(1, focusBySubject[0]?.hours || 1)) * 100)} className="h-2" />
              </div>
            ))}
            {focusBySubject.length === 0 && <div className="text-sm text-muted-foreground">No focus sessions yet</div>}
          </CardContent>
        </Card>
      </div>

      {/* Time of Day + Last 7 days bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="p-4 flex items-center">
            <CardTitle className="text-base flex items-center gap-2 flex-1"><PieChart className="h-5 w-5 text-primary flex-shrink-0" /> Time of Day Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Card variant="outlined" className="p-3 flex items-center gap-2"><Sunrise className="h-4 w-4 text-primary" /> Morning <span className="ml-auto font-semibold">{timeOfDaySplit.morning}%</span></Card>
              <Card variant="outlined" className="p-3 flex items-center gap-2"><Sun className="h-4 w-4 text-primary" /> Afternoon <span className="ml-auto font-semibold">{timeOfDaySplit.afternoon}%</span></Card>
              <Card variant="outlined" className="p-3 flex items-center gap-2"><Sunset className="h-4 w-4 text-primary" /> Evening <span className="ml-auto font-semibold">{timeOfDaySplit.evening}%</span></Card>
              <Card variant="outlined" className="p-3 flex items-center gap-2"><Moon className="h-4 w-4 text-primary" /> Night <span className="ml-auto font-semibold">{timeOfDaySplit.night}%</span></Card>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-end gap-2 h-28">
              {recentBuckets.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full bg-white rounded-t transition-all duration-500" style={{ height: `${(v / recentMax) * 100}%` }} />
                  <span className="text-[10px] text-muted-foreground">D{i+1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions (combined) */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 flex items-center">
          <CardTitle className="text-lg flex items-center gap-2 flex-1">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" /> AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {[...suggestions, ...extendedSuggestions].length === 0 && (
            <div className="text-sm text-muted-foreground">No suggestions yet. Use the app to generate insights.</div>
          )}
          {[...suggestions, ...extendedSuggestions].map(s => (
            <Card key={s.id} variant="outlined" className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-sm font-medium">{s.message}</div>
                <Badge variant="outline" className={
                  s.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                  s.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                  'bg-info/10 text-info border-info/20'}>
                  {s.priority}
                </Badge>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Subject Manager & Exam Marks */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 flex items-center">
          <CardTitle className="text-lg flex items-center gap-2 flex-1">
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0" /> Subject Manager & Exam Marks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Select value={markSubject} onValueChange={setMarkSubject}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="secondary" className="gap-2" onClick={() => setIsAddMarkOpen(true)}>
              <Plus className="h-4 w-4" /> Add Mark
            </Button>
          </div>

          {/* Per-subject summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map((s) => {
              const info = subjectExamStats[s] || { avg: 0, exams: 0, best: 0, last5: [] };
              const exams = examMap[s] || [];
              return (
                <Card key={s} variant="outlined" className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{s}</div>
                    <Badge variant="outline">{info.exams} exams</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Average</div>
                      <div className="font-medium">{info.avg}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Best</div>
                      <div className="font-medium">{info.best}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last</div>
                      <div className="font-medium">{info.lastDate ? new Date(info.lastDate).toLocaleDateString() : '-'}</div>
                    </div>
                  </div>

                  {/* Last 5 exam trend bars */}
                  <div className="mt-2">
                    <div className="text-[11px] text-muted-foreground mb-1">Recent</div>
                    <div className="flex items-end gap-1 h-10">
                      {info.last5.length > 0 ? info.last5.map((p, idx) => (
                        <div key={idx} className="w-4 bg-primary/20 rounded" style={{ height: `${Math.max(5, p)}%` }} title={`${p}%`} />
                      )) : <div className="text-xs text-muted-foreground">No exams recorded</div>}
                    </div>
                  </div>

                  {/* Recent exams list */}
                  <div className="mt-2 space-y-1 max-h-28 overflow-auto pr-1">
                    {exams.slice().reverse().slice(0, 5).map(e => (
                      <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded border bg-background/50">
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-muted-foreground">{new Date(e.date).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{e.score}/{e.total}</span>
                          <Button size="xs" variant="ghost" onClick={() => removeExam(s, e.id)}>Delete</Button>
                        </div>
                      </div>
                    ))}
                    {exams.length === 0 && (
                      <div className="text-xs text-muted-foreground">No exams recorded</div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Add Mark Sheet */}
          <Sheet open={isAddMarkOpen} onOpenChange={setIsAddMarkOpen}>
            <SheetContent side="bottom" className="space-y-4">
              <SheetHeader>
                <SheetTitle>Add Exam Mark</SheetTitle>
                <SheetDescription>Record an exam/quiz/test result for a subject.</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Subject</div>
                  <Select value={markSubject} onValueChange={setMarkSubject}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Exam Name</div>
                  <Input placeholder="e.g., Midterm" value={markName} onChange={(e) => setMarkName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Date</div>
                  <Input type="date" value={markDate} onChange={(e) => setMarkDate(e.target.value)} />
                </div>
                <div className="space-y-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Score</div>
                    <Input placeholder="e.g., 78" value={markScore} onChange={(e) => setMarkScore(e.target.value)} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Total</div>
                    <Input placeholder="e.g., 100" value={markTotal} onChange={(e) => setMarkTotal(e.target.value)} />
                  </div>
                </div>
              </div>
              <SheetFooter className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsAddMarkOpen(false)}>Cancel</Button>
                <Button onClick={handleAddExamMark}>Save</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Detailed Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Focus Sessions */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 flex items-center">
            <CardTitle className="text-lg flex items-center gap-2 flex-1">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" /> Focus Sessions ({focusSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4">
            {focusSessions.length === 0 && (
              <div className="text-sm text-muted-foreground">No focus sessions yet</div>
            )}
            {focusSessions.slice(-10).reverse().map((s) => (
              <Card key={s.id} variant="outlined" className="flex items-center justify-between p-2 text-sm">
                <div className="flex flex-col">
                  <span className="font-medium">{s.subject || 'General'}</span>
                  <span className="text-xs text-muted-foreground">{new Date(s.endTime || s.startTime).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{Math.round(s.duration / 60)}m</div>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Todos & Plans */}
        <Card className="shadow-sm">
          <CardHeader className="p-4 flex items-center">
            <CardTitle className="text-lg flex items-center gap-2 flex-1">
              <ListChecks className="h-5 w-5 text-primary flex-shrink-0" /> Todos & Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <Card variant="outlined" className="p-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">Todos</div>
                <Badge variant="outline">{stats.completedTodos}/{stats.totalTodos}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="p-2 rounded border bg-background/50 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Overdue <span className="ml-auto font-semibold">{todoAnalytics.overdue}</span></div>
                <div className="p-2 rounded border bg-background/50 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Completion <span className="ml-auto font-semibold">{todoAnalytics.completionRate}%</span></div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Avg completion time: {todoAnalytics.avgHours}h</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {todoAnalytics.byPriority.map(p => (
                  <div key={p.priority} className="p-2 rounded border bg-background/50 text-xs">
                    <div className="flex items-center justify-between"><span className="capitalize">{p.priority}</span><Badge variant="outline">{p.completed}/{p.total}</Badge></div>
                    <div className="h-1.5 bg-muted rounded mt-1 overflow-hidden"><div className={`h-full ${p.priority==='high'?'bg-destructive':p.priority==='medium'?'bg-warning':'bg-success'}`} style={{ width: `${p.rate}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
            <Card variant="outlined" className="p-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">Plans</div>
                <Badge variant="outline">{plans.length}</Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">Upcoming</div>
              <ul className="mt-1 space-y-1 max-h-28 overflow-auto pr-1">
                {plans.slice(-5).reverse().map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="truncate mr-2">{p.title || p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.date ? new Date(p.date).toLocaleDateString() : ''}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="shadow-sm">
        <CardHeader className="p-4 flex items-center">
          <CardTitle className="text-lg flex items-center gap-2 flex-1">
            <Trophy className="h-5 w-5 text-primary flex-shrink-0" /> Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {Array.isArray(stats.achievements) && stats.achievements.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.achievements.map((a: string) => (
                <Badge key={a} variant="outline" className="bg-primary/5 border-primary/20 text-primary">{a}</Badge>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No achievements unlocked yet</div>
          )}
        </CardContent>
      </Card>

            
      <div className="text-[11px] text-muted-foreground text-center">Last updated: {new Date().toLocaleString()}</div>
    </div>
  );
}
