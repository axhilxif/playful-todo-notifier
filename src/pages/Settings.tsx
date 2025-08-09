import { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Bell, Clock, Smartphone, Download, Upload, Shield, Play, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { NotificationSettings } from '@/types';
import { getSettings, setSettings } from '@/lib/storage';
import { requestNotificationPermission, scheduleBreakReminder, playHaptic } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';
import { useIntroScreen } from '@/hooks/use-intro-screen';
import { downloadBackup, handleFileImport } from '@/lib/data-export';

export default function Settings() {
  const [settings, setSettingsState] = useState<NotificationSettings>({
    enabled: true,
    breakReminders: true,
    breakInterval: 25,
    todoReminders: true,
    timetableReminders: true,
  });
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();
  const { showIntro } = useIntroScreen();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDataImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await handleFileImport(file);
      playHaptic();
      
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const storedSettings = getSettings();
    setSettingsState(storedSettings);
    
    // Check notification permission
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setHasPermission(permission);
    } catch (error) {
      console.error('Error checking notification permission:', error);
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    setSettingsState(newSettings);
    playHaptic();
  };

  const handleToggleSetting = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    toast({
      title: "Settings updated! ⚙️",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleBreakIntervalChange = (value: string) => {
    const interval = parseInt(value);
    const newSettings = { ...settings, breakInterval: interval };
    saveSettings(newSettings);
    
    toast({
      title: "Break interval updated! ⏰",
      description: `Break reminders will now show every ${interval} minutes.`,
    });
  };

  const testNotification = async () => {
    if (!hasPermission) {
      const permission = await requestNotificationPermission();
      setHasPermission(permission);
      
      if (!permission) {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your device settings.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const testTime = new Date(Date.now() + 3000); // 3 seconds from now
      await scheduleBreakReminder(0.05); // Very short interval for testing
      
      toast({
        title: "Test notification scheduled! 🔔",
        description: "You should receive a test notification in 3 seconds.",
      });
    } catch (error) {
      toast({
        title: "Failed to schedule notification",
        description: "Please check your notification settings.",
        variant: "destructive",
      });
    }
  };

  const breakIntervalOptions = [
    { value: '15', label: '15 minutes' },
    { value: '20', label: '20 minutes (20-20-20 rule)' },
    { value: '25', label: '25 minutes (Pomodoro)' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
  ];

  return (
    <div className="pb-20 px-4 pt-6">
      <PageHeader
        title="Settings"
        subtitle="Customize your app experience"
        icon={<SettingsIcon className="h-6 w-6" />}
      />

      {/* Notification Permission Card */}
      {!hasPermission && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <Bell className="h-5 w-5" />
              Notification Permission Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To receive reminders and notifications, please grant permission to send notifications.
            </p>
            <Button 
              onClick={checkNotificationPermission}
              className="w-full bg-gradient-warning hover:bg-gradient-warning/90"
            >
              Enable Notifications
            </Button>
          </CardContent>
        </Card>
      )}

      {/* General Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master notification toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all notifications
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => handleToggleSetting('enabled', checked)}
            />
          </div>

          {/* Todo reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Todo Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your todo deadlines
              </p>
            </div>
            <Switch
              checked={settings.todoReminders}
              onCheckedChange={(checked) => handleToggleSetting('todoReminders', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {/* Timetable reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Schedule Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about your scheduled activities
              </p>
            </div>
            <Switch
              checked={settings.timetableReminders}
              onCheckedChange={(checked) => handleToggleSetting('timetableReminders', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {/* Test notification */}
          {hasPermission && settings.enabled && (
            <div className="pt-4 border-t">
              <Button 
                onClick={testNotification}
                variant="outline"
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Break Reminders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Break Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Break reminders toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Break Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Regular reminders to take breaks and rest your eyes
              </p>
            </div>
            <Switch
              checked={settings.breakReminders}
              onCheckedChange={(checked) => handleToggleSetting('breakReminders', checked)}
              disabled={!settings.enabled}
            />
          </div>

          {/* Break interval */}
          {settings.breakReminders && settings.enabled && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Break Interval</Label>
              <Select 
                value={settings.breakInterval.toString()} 
                onValueChange={handleBreakIntervalChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breakIntervalOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Based on the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-info" />
            App Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 flex-col gap-1.5 hover:bg-info/5 border-info/20"
              onClick={() => {
                downloadBackup();
                playHaptic();
                toast({
                  title: "Data exported! 📁",
                  description: "Your backup file has been downloaded.",
                });
              }}
            >
              <Download className="h-4 w-4 text-info" />
              <span className="text-xs font-medium">Export Data</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-14 flex-col gap-1.5 hover:bg-info/5 border-info/20"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 text-info" />
              <span className="text-xs font-medium">Import Data</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 flex-col gap-1.5 hover:bg-primary/5 border-primary/20"
              onClick={showIntro}
            >
              <Play className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">View Tutorial</span>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center leading-relaxed">
            Keep your progress safe by regularly exporting your data. You can restore it later using the import feature.
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

      {/* App Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-success" />
            App Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">App Name</div>
              <div className="text-muted-foreground">StudyBuddy</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Version</div>
              <div className="text-muted-foreground">1.0.0</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Build Type</div>
              <div className="text-muted-foreground">Mobile/Tablet</div>
            </div>
            <div>
              <div className="font-medium text-foreground">Platform</div>
              <div className="text-muted-foreground">Android / iOS</div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Smart todo management with priorities</li>
              <li>• Calendar and list view for schedules</li>
              <li>• Focus timer with app-switching detection</li>
              <li>• Break reminders for eye health</li>
              <li>• Local notifications and haptic feedback</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Reset Section */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            ⚠️ Reset Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete all your todos, schedules, and user data. This action cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => {
              // In a real app, you'd implement data reset functionality
              toast({
                title: "Feature not implemented",
                description: "Data reset functionality will be added in a future update.",
              });
            }}
          >
            Reset All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}