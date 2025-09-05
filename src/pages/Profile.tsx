import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Settings, Trophy, Star, Calendar, Timer, Target, Sparkles, Camera, Edit, Save, X, Download, Upload, FileText, Shield, Brain, Award, Zap, Activity } from 'lucide-react';
import { BarChart, RadialBarChart, RadialBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
import { notificationService } from '@/lib/notification-service';
import { ACHIEVEMENTS } from '@/lib/achievements';
import { downloadBackup, handleFileImport } from '@/lib/data-export';
import { cn } from '@/lib/utils';
import { loadUserProfile, saveUserProfile, calculateLevel, calculateUserStats, checkAndUnlockAchievements, UserProfile } from '@/lib/gamification';
import { getAllSuggestions } from '@/lib/ai-suggestions';
import { useNavigate } from 'react-router-dom';

const defaultProfile: UserProfile = {
  name: 'Productivity Hero',
  bio: 'On a journey to make every day count! ✨',
  avatar: '',
  joinDate: new Date().toISOString(),
  level: 1,
  xp: 0,
  achievements: [],
  favoriteEmoji: '🚀',
  lastLoginDate: new Date().toISOString(),
  streak: 0,
  totalBreaks: 0,
  pet: {
    name: 'Buddy',
    hunger: 50,
    happiness: 50,
    isAlive: true,
    head: 'default',
    lastFed: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
  },
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile>(defaultProfile);
  const [activeView, setActiveView] = useState<'overview' | 'skills' | 'achievements'>('overview');
  
  const [stats, setStats] = useState({
    totalTodos: 0,
    completedTodos: 0,
    totalFocusTime: 0,
    planBoardItems: 0,
    weeklyProgress: 0,
    monthlyGoals: 0,
    avgDailyFocus: 0,
    productiveHours: [],
    weeklyStreak: 0,
    skillLevels: {
      focus: 0,
      planning: 0,
      consistency: 0,
      achievement: 0
    }
  });
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const StatCard = ({ icon: Icon, title, value, subtext, gradient = "bg-gradient-primary" }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {subtext && <p className="text-sm text-muted-foreground">{subtext}</p>}
            </div>
          </div>
          <div className={cn("p-2 rounded-lg", gradient)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SkillCard = ({ icon: Icon, name, level, color }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-2">
          <div className={cn("p-2 rounded-lg", `bg-${color}/10 text-${color}`)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-medium">{name}</h4>
            <p className="text-sm text-muted-foreground">Level {Math.floor(level / 10)}</p>
          </div>
        </div>
        <Progress value={level} className="h-2" />
      </CardContent>
    </Card>
  );
  
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stats = calculateUserStats();
      checkAndUnlockAchievements(); // Check for new achievements on load
      
      // Reload the profile to get any new achievements
      const loadedProfile = loadUserProfile();
      
      // Ensure we have a valid profile with achievements array
      const safeProfile: UserProfile = {
        ...defaultProfile, // Start with default values
        ...loadedProfile, // Override with loaded values
        achievements: Array.isArray(loadedProfile?.achievements) ? loadedProfile.achievements : [], // Ensure achievements is an array
      };
      
      setProfile(safeProfile);
      setEditData(safeProfile);

      const focusSessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
      const focusHours = focusSessions.reduce((acc: number[], session: any) => {
        const hour = new Date(session.startTime).getHours();
        acc[hour] = (acc[hour] || 0) + session.duration / 3600;
        return acc;
      }, Array(24).fill(0));

      setStats({
        totalTodos: stats.totalTodos || 0,
        completedTodos: stats.completedTodos || 0,
        totalFocusTime: stats.totalFocusTime || 0,
        planBoardItems: stats.planBoardItems || 0,
        weeklyProgress: 0,
        monthlyGoals: 0,
        avgDailyFocus: 0,
        productiveHours: focusHours,
        weeklyStreak: stats.streak || 0,
        skillLevels: {
          focus: Math.min((stats.totalFocusTime || 0) / 20 * 100, 100),
          planning: Math.min((stats.planBoardItems || 0) / 5 * 100, 100),
          consistency: Math.min((stats.streak || 0) / 7 * 100, 100),
          achievement: Math.min((safeProfile.achievements.length || 0) / ACHIEVEMENTS.length * 100, 100)
        }
      });

      setSuggestions(getAllSuggestions(stats));
    } catch (error) {
      console.error('Error loading profile:', error);
      // If there's an error, ensure we at least have the default profile
      setProfile(defaultProfile);
      setEditData(defaultProfile);
    }
  }, []);

  const saveProfile = () => {
    saveUserProfile(editData);
    setProfile(editData);
    setIsEditing(false);
    notificationService.playHaptic();
    
    toast({
      title: "Profile updated! ✨",
      description: "Your changes have been saved successfully.",
    });
  };

  const cancelEdit = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const levelInfo = React.useMemo(() => calculateLevel(profile?.xp || 0), [profile?.xp]);
  const getXpProgress = React.useCallback(() => levelInfo.progress, [levelInfo.progress]);

  // Calculate unlocked achievements
  const unlockedAchievements = React.useMemo(() => {
    if (!profile?.achievements) return [];
    return ACHIEVEMENTS.filter(achievement =>
      typeof achievement.id === 'string' && profile.achievements.includes(achievement.id)
    );
  }, [profile?.achievements]);

  const handleDataExport = () => {
    downloadBackup();
    notificationService.playHaptic();
    toast({
      title: "Data exported! 📁",
      description: "Your backup file has been downloaded.",
    });
  };

  const handleDataImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await handleFileImport(file);
      notificationService.playHaptic();
      
      if (result.success) {
        toast({
          title: "Import successful! ✅",
          description: result.message,
        });
      } else {
        toast({
          title: "Import failed ❌",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import error ❌",
        description: "Failed to process the backup file.",
        variant: "destructive",
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="My Profile"
        subtitle="Track your progress"
        icon={<UserIcon className="h-6 w-6" />}
        action={          
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/settings')}
              variant="secondary"
              size="icon"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={isEditing ? saveProfile : () => setIsEditing(true)}
              variant="default"
              size="sm"
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="profile" className="font-medium">Profile</TabsTrigger>
          <TabsTrigger value="achievements" className="font-medium">Achievements</TabsTrigger>
          <TabsTrigger value="planboard" className="font-medium">Plan Board</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Profile Header */}
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
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
                        <Button size="sm" onClick={saveProfile} variant="default">
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
                        <Badge variant="secondary">
                          <Trophy className="h-4 w-4 mr-1" />
                          Level {profile.level}
                        </Badge>
                        <Badge variant="secondary">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Target}
              title="Tasks Completed"
              value={`${stats.completedTodos}/${stats.totalTodos}`}
              subtext={`${Math.round((stats.completedTodos / stats.totalTodos) * 100)}%`}
              gradient="bg-primary"
            />
            <StatCard
              icon={Timer}
              title="Focus Time"
              value={`${stats.totalFocusTime}h`}
              subtext={`${stats.avgDailyFocus}h daily avg`}
              gradient="bg-accent"
            />
            <StatCard
              icon={Calendar}
              title="Weekly Streak"
              value={stats.weeklyStreak}
              subtext="days"
              gradient="bg-success"
            />
            <StatCard
              icon={Sparkles}
              title="Monthly Goals"
              value={stats.monthlyGoals}
              subtext="plans created"
              gradient="bg-warning"
            />
          </div>

          {/* Productivity Insights */}
          <Card>
            <CardHeader className="pb-2 flex items-center p-4">
              <CardTitle className="flex items-center gap-2 flex-1">
                <Activity className="h-5 w-5 text-primary flex-shrink-0" />
                Productivity Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-6">
                {/* Skill Levels - stack on mobile */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Your Skills</h4>
                  <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2">
                    <SkillCard
                      icon={Brain}
                      name="Focus Power"
                      level={stats.skillLevels.focus}
                      color="primary"
                    />
                    <SkillCard
                      icon={Target}
                      name="Planning"
                      level={stats.skillLevels.planning}
                      color="accent"
                    />
                    <SkillCard
                      icon={Award}
                      name="Consistency"
                      level={stats.skillLevels.consistency}
                      color="success"
                    />
                    <SkillCard
                      icon={Trophy}
                      name="Achievement"
                      level={stats.skillLevels.achievement}
                      color="warning"
                    />
                  </div>
                </div>

                {/* Productive Hours Chart - scrollable on mobile */}
                <div>
                  <h4 className="text-sm font-medium mb-4">Most Productive Hours</h4>
                  <div className="h-[200px] overflow-x-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.productiveHours.map((value, hour) => ({
                        hour: `${hour}:00`,
                        value
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="hour" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-background p-2 rounded-lg border shadow-lg">
                                  <p className="text-sm font-medium">{payload[0].payload.hour}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {Math.round(Number(payload[0].value) * 10) / 10}h focus time
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="value" className="fill-primary" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader className="flex items-center p-4">
                <CardTitle className="flex items-center gap-2 flex-1">
                  <Brain className="h-5 w-5 text-info flex-shrink-0" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} variant="outlined" className="p-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground flex-1">{suggestion.message}</p>
                    {suggestion.action && (
                      <Button variant="ghost" size="sm" className="ml-2">
                        {suggestion.action}
                      </Button>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          <Card>
            <CardHeader className="flex items-center p-4">
              <CardTitle className="flex items-center gap-2 flex-1">
                <Shield className="h-5 w-5 text-info flex-shrink-0" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDataExport}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <Download className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">Export Data</span>
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                >
                  <Upload className="h-5 w-5 text-info" />
                  <span className="text-sm font-medium">Import Data</span>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center leading-relaxed">
                Keep your progress safe! Export creates a backup file, import restores from backup.
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleDataImport}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Theme Selection removed */}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievement Progress */}
          <Card variant="elevated">
            <CardHeader className="flex items-center p-4">
              <CardTitle className="flex items-center gap-2 text-primary flex-1">
                <Trophy className="h-6 w-6 flex-shrink-0" />
                Achievement Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {unlockedAchievements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-bounce-in">🏆</div>
                  <h3 className="text-xl font-display font-bold mb-2">Start Your Journey!</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                    Use the app to unlock amazing achievements and track your productivity milestones.
                  </p>
                  <Badge variant="secondary">
                    {ACHIEVEMENTS.length} Achievements Available
                  </Badge>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Unlocked Achievements */}
                  <div>
                    <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-warning flex-shrink-0" />
                      Unlocked ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unlockedAchievements.map((achievement) => (
                        <Card key={achievement.id} variant="elevated">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{achievement.emoji}</div>
                              <div className="flex-1">
                                <div className="font-display font-semibold text-warning">{achievement.name}</div>
                                <div className="text-sm text-muted-foreground">{achievement.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Coming Soon Achievements */}
                  <div>
                    <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      Coming Soon
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ACHIEVEMENTS.filter(a => !profile.achievements.includes(a.id)).slice(0, 4).map((achievement) => (
                        <Card key={achievement.id} variant="elevated">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl grayscale">{achievement.emoji}</div>
                              <div className="flex-1">
                                <div className="font-display font-semibold text-muted-foreground">{achievement.name}</div>
                                <div className="text-sm text-muted-foreground">{achievement.description}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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