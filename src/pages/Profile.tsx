import { useState, useEffect } from 'react';
import { User as UserIcon, Edit2, Save, Calendar, Clock, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/types';
import { getUser, setUser, getTodos, getTimeSlots } from '@/lib/storage';
import { playHaptic } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const [user, setUserState] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUserState(storedUser);
      setName(storedUser.name);
    } else {
      // First time user - show editing mode
      setIsEditing(true);
    }
  }, []);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    const userData: User = user 
      ? { ...user, name: name.trim() }
      : { id: Date.now().toString(), name: name.trim(), createdAt: new Date() };

    setUser(userData);
    setUserState(userData);
    setIsEditing(false);
    playHaptic();

    toast({
      title: user ? "Profile updated! ✨" : "Welcome! 🎉",
      description: user 
        ? "Your profile has been updated successfully."
        : `Welcome to your todo app, ${userData.name}!`,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStats = () => {
    const todos = getTodos();
    const timeSlots = getTimeSlots();
    
    const completedTodos = todos.filter(todo => todo.completed).length;
    const totalTodos = todos.length;
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return {
      totalTodos,
      completedTodos,
      completionRate,
      timeSlots: timeSlots.length,
    };
  };

  const stats = getStats();

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your account and view your progress"
        icon={<UserIcon className="h-6 w-6" />}
        action={
          !isEditing && user && (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )
        }
      />

      {/* Profile Card */}
      <Card className="mb-6 bg-gradient-card border-primary/20 shadow-soft">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar */}
            <Avatar className="h-24 w-24 bg-gradient-hero text-primary-foreground text-2xl shadow-glow border-4 border-primary/20">
              <AvatarFallback>
                {user ? getInitials(user.name) : '?'}
              </AvatarFallback>
            </Avatar>

            {/* Name */}
            {isEditing ? (
              <div className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-center transition-all duration-200 focus:shadow-soft"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  {user && (
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
                    disabled={!name.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center">
                  {user?.name || 'Anonymous User'}
                </h2>
                {user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {user && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Todo Stats */}
            <Card className="bg-gradient-primary/5 border-primary/20 shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" />
                  Todos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary mb-1">
                  {stats.completedTodos}/{stats.totalTodos}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.completionRate}% completion rate
                </div>
              </CardContent>
            </Card>

            {/* Schedule Stats */}
            <Card className="bg-gradient-accent/5 border-accent/20 shadow-soft">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent mb-1">
                  {stats.timeSlots}
                </div>
                <div className="text-xs text-muted-foreground">
                  time slots configured
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Focus Time Card */}
          <Card className="bg-gradient-success/5 border-success/20 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-success" />
                Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">0h 0m</div>
                <div className="text-sm text-muted-foreground">
                  Total focus time this week
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Start using the timer to track your productivity! 🚀
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievement Card */}
          <Card className="bg-gradient-warning/5 border-warning/20 shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🏆 Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-4xl">🎯</div>
                <div className="text-sm font-medium">Getting Started</div>
                <div className="text-xs text-muted-foreground">
                  Welcome to your productivity journey!
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}