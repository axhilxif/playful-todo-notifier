
import { useState, useEffect } from 'react';
import { User as UserIcon, Settings, Trophy, Star, Calendar, Timer, Target, Sparkles, Camera, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/ui/page-header';
import { PlanBoard } from '@/components/plan-board/PlanBoard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { playHaptic } from '@/lib/notifications';

interface UserProfile {
  name: string;
  bio: string;
  avatar: string;
  joinDate: string;
  level: number;
  xp: number;
  streak: number;
  achievements: string[];
  favoriteEmoji: string;
  theme: string;
}

const ACHIEVEMENT_BADGES = [
  { id: 'first-todo', name: 'First Steps', emoji: '👶', description: 'Created your first todo' },
  { id: 'week-streak', name: 'Consistent', emoji: '🔥', description: '7 day streak' },
  { id: 'focus-master', name: 'Focus Master', emoji: '🎯', description: '10 hours of focus time' },
  { id: 'planner', name: 'Planner', emoji: '📋', description: 'Created 10 schedule items' },
  { id: 'early-bird', name: 'Early Bird', emoji: '🌅', description: 'Used timer before 8 AM' },
  { id: 'night-owl', name: 'Night Owl', emoji: '🦉', description: 'Used timer after 10 PM' },
  { id: 'productivity-guru', name: 'Productivity Guru', emoji: '⚡', description: 'Completed 50 todos' },
  { id: 'zen-master', name: 'Zen Master', emoji: '🧘', description: '100 break reminders taken' },
];

const THEME_OPTIONS = [
  { id: 'default', name: 'Default', gradient: 'bg-gradient-to-r from-primary to-accent' },
  { id: 'ocean', name: 'Ocean', gradient: 'bg-gradient-to-r from-blue-500 to-cyan-400' },
  { id: 'sunset', name: 'Sunset', gradient: 'bg-gradient-to-r from-orange-500 to-pink-500' },
  { id: 'forest', name: 'Forest', gradient: 'bg-gradient-to-r from-green-500 to-teal-400' },
  { id: 'galaxy', name: 'Galaxy', gradient: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
];

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Productivity Hero',
    bio: 'On a journey to make every day count! ✨',
    avatar: '',
    joinDate: new Date().toISOString(),
    level: 1,
    xp: 250,
    streak: 5,
    achievements: ['first-todo', 'week-streak'],
    favoriteEmoji: '🚀',
    theme: 'default',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);
  const [stats, setStats] = useState({
    totalTodos: 0,
    completedTodos: 0,
    totalFocusTime: 0,
    planBoardItems: 0,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Load profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setEditData(parsed);
    }

    // Calculate stats
    const todos = JSON.parse(localStorage.getItem('todo-app-todos') || '[]');
    const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    const planBoard = JSON.parse(localStorage.getItem('planBoard') || '[]');

    const totalFocusSeconds = focusSessions.reduce((total: number, session: any) => total + session.duration, 0);

    setStats({
      totalTodos: todos.length,
      completedTodos: todos.filter((todo: any) => todo.completed).length,
      totalFocusTime: Math.round(totalFocusSeconds / 3600 * 10) / 10, // hours
      planBoardItems: planBoard.length,
    });
  }, []);

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(editData));
    setProfile(editData);
    setIsEditing(false);
    playHaptic();
    
    toast({
      title: "Profile updated! ✨",
      description: "Your changes have been saved successfully.",
    });
  };

  const cancelEdit = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const calculateLevel = (xp: number) => Math.floor(xp / 100) + 1;
  const getXpForNextLevel = (level: number) => level * 100;
  const getXpProgress = () => (profile.xp % 100);

  const unlockedAchievements = ACHIEVEMENT_BADGES.filter(badge => 
    profile.achievements.includes(badge.id)
  );

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="My Profile"
        subtitle="Track your progress and customize your experience"
        icon={<UserIcon className="h-6 w-6" />}
        action={
          <Button
            onClick={isEditing ? saveProfile : () => setIsEditing(true)}
            className="bg-gradient-primary hover:bg-gradient-primary/90"
            size="sm"
          >
            {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile & Stats</TabsTrigger>
          <TabsTrigger value="planboard">My Plan Board</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card className="bg-gradient-hero/10 border-primary/20 shadow-glow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                      {profile.favoriteEmoji}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="text-xl font-bold"
                        placeholder="Your name"
                      />
                      <Textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveProfile} className="bg-gradient-success">
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-primary">{profile.name}</h2>
                      <p className="text-muted-foreground mt-1">{profile.bio}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="outline" className="bg-gradient-primary/10">
                          <Trophy className="h-4 w-4 mr-1" />
                          Level {profile.level}
                        </Badge>
                        <Badge variant="outline" className="bg-gradient-accent/10">
                          <Star className="h-4 w-4 mr-1" />
                          {profile.streak} day streak
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* XP Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Level {profile.level}</span>
                  <span>{getXpProgress()}/100 XP</span>
                </div>
                <Progress value={getXpProgress()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{stats.totalTodos}</div>
                <div className="text-sm text-muted-foreground">Total Todos</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-success/5 border-success/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-success">{stats.completedTodos}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-accent/5 border-accent/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-accent">{stats.totalFocusTime}h</div>
                <div className="text-sm text-muted-foreground">Focus Time</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-warning/5 border-warning/20">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-warning">{stats.planBoardItems}</div>
                <div className="text-sm text-muted-foreground">Plans Created</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-warning" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unlockedAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-muted-foreground">Start using the app to unlock achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {unlockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-warning/5 rounded-lg border border-warning/10">
                      <div className="text-2xl">{achievement.emoji}</div>
                      <div>
                        <div className="font-semibold text-sm">{achievement.name}</div>
                        <div className="text-xs text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Customize Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <Button
                    key={theme.id}
                    variant="outline"
                    className={`h-16 ${theme.gradient} text-white relative ${
                      profile.theme === theme.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      const newProfile = { ...profile, theme: theme.id };
                      setProfile(newProfile);
                      localStorage.setItem('userProfile', JSON.stringify(newProfile));
                      playHaptic();
                      toast({
                        title: "Theme updated! 🎨",
                        description: `Switched to ${theme.name} theme.`,
                      });
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 rounded-md" />
                    <span className="relative font-semibold">{theme.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planboard" className="space-y-6">
          <PlanBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
