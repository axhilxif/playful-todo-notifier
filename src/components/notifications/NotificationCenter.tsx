
import { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Zap, Settings, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { backgroundNotificationManager } from '@/lib/background-notifications';

interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  priority: 'low' | 'normal' | 'high';
  breakReminders: {
    enabled: boolean;
    interval: number;
    soundType: string;
    message: string;
  };
  todoReminders: {
    enabled: boolean;
    beforeDue: number;
    soundType: string;
  };
  scheduleReminders: {
    enabled: boolean;
    beforeStart: number;
    soundType: string;
  };
  focusMode: {
    enabled: boolean;
    blockApps: boolean;
    autoBreaks: boolean;
  };
}

const SOUND_OPTIONS = [
  { value: 'default', label: '🔔 Default' },
  { value: 'gentle', label: '🎵 Gentle' },
  { value: 'urgent', label: '⚡ Urgent' },
  { value: 'chime', label: '🎐 Chime' },
  { value: 'nature', label: '🌿 Nature' },
];

const BREAK_MESSAGES = [
  'Time to take a break! 😊',
  'Your eyes need a rest! 👀',
  'Stretch time! 🤸‍♂️',
  'Breathe and relax! 🧘',
  'Stay hydrated! 💧',
  'Look away from the screen! 🌅',
];

export function NotificationCenter() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: true,
    sound: true,
    vibration: true,
    priority: 'normal',
    breakReminders: {
      enabled: true,
      interval: 25,
      soundType: 'gentle',
      message: BREAK_MESSAGES[0],
    },
    todoReminders: {
      enabled: true,
      beforeDue: 60,
      soundType: 'default',
    },
    scheduleReminders: {
      enabled: true,
      beforeStart: 15,
      soundType: 'chime',
    },
    focusMode: {
      enabled: false,
      blockApps: false,
      autoBreaks: true,
    },
  });

  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const updatePreferences = (updates: Partial<NotificationPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    setPreferences(newPrefs);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPrefs));
    
    toast({
      title: "Settings updated! 🔔",
      description: "Your notification preferences have been saved.",
    });
  };

  const testNotification = async () => {
    try {
      await backgroundNotificationManager.scheduleCustomNotification(
        99999,
        '🔔 Test Notification',
        'This is how your notifications will look!',
        new Date(Date.now() + 3000)
      );
      
      toast({
        title: "Test scheduled! ⏰",
        description: "You'll receive a test notification in 3 seconds.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Please check your notification permissions.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-primary/20 rounded-full">
            <Bell className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-primary">Notification Center</h2>
        <p className="text-muted-foreground">Customize how and when you get notified</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 justify-center">
        <Button onClick={testNotification} variant="outline">
          <Volume2 className="h-4 w-4 mr-2" />
          Test Notification
        </Button>
      </div>

      {/* Master Controls */}
      <Card className="border-primary/20 bg-gradient-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Master Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(checked) => updatePreferences({ enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Sound</Label>
              <p className="text-sm text-muted-foreground">Play notification sounds</p>
            </div>
            <Switch
              checked={preferences.sound}
              onCheckedChange={(checked) => updatePreferences({ sound: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Vibration</Label>
              <p className="text-sm text-muted-foreground">Vibrate for notifications</p>
            </div>
            <Switch
              checked={preferences.vibration}
              onCheckedChange={(checked) => updatePreferences({ vibration: checked })}
              disabled={!preferences.enabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select
              value={preferences.priority}
              onValueChange={(value: 'low' | 'normal' | 'high') => updatePreferences({ priority: value })}
              disabled={!preferences.enabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🔕 Low - Silent</SelectItem>
                <SelectItem value="normal">🔔 Normal</SelectItem>
                <SelectItem value="high">🚨 High - Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Break Reminders */}
      <Card className="border-accent/20 bg-gradient-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Break Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Enable Break Reminders</Label>
              <p className="text-sm text-muted-foreground">Regular reminders to take breaks</p>
            </div>
            <Switch
              checked={preferences.breakReminders.enabled}
              onCheckedChange={(checked) => 
                updatePreferences({ 
                  breakReminders: { ...preferences.breakReminders, enabled: checked }
                })
              }
              disabled={!preferences.enabled}
            />
          </div>

          {preferences.breakReminders.enabled && preferences.enabled && (
            <>
              <div className="space-y-2">
                <Label>Break Interval: {preferences.breakReminders.interval} minutes</Label>
                <Slider
                  value={[preferences.breakReminders.interval]}
                  onValueChange={([value]) => 
                    updatePreferences({
                      breakReminders: { ...preferences.breakReminders, interval: value }
                    })
                  }
                  max={120}
                  min={5}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 min</span>
                  <span>2 hours</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sound Style</Label>
                <Select
                  value={preferences.breakReminders.soundType}
                  onValueChange={(value) => 
                    updatePreferences({
                      breakReminders: { ...preferences.breakReminders, soundType: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOUND_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Break Message</Label>
                <Select
                  value={preferences.breakReminders.message}
                  onValueChange={(value) => 
                    updatePreferences({
                      breakReminders: { ...preferences.breakReminders, message: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BREAK_MESSAGES.map(message => (
                      <SelectItem key={message} value={message}>
                        {message}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant={preferences.enabled ? "default" : "secondary"}>
          {preferences.enabled ? "✅ Notifications On" : "❌ Notifications Off"}
        </Badge>
        <Badge variant={preferences.breakReminders.enabled ? "default" : "secondary"}>
          {preferences.breakReminders.enabled ? "⏰ Breaks On" : "⏸️ Breaks Off"}
        </Badge>
        <Badge variant={preferences.sound ? "default" : "secondary"}>
          {preferences.sound ? "🔊 Sound On" : "🔇 Silent"}
        </Badge>
        <Badge variant={preferences.vibration ? "default" : "secondary"}>
          {preferences.vibration ? "📳 Vibrate On" : "📵 No Vibrate"}
        </Badge>
      </div>
    </div>
  );
}
