
import { useState, useEffect } from 'react';
import { Sparkles, Zap, Trophy, Coffee, Music, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FunFeature {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  requirement: string;
}

const FUN_FEATURES: FunFeature[] = [
  {
    id: 'motivational-quotes',
    name: 'Motivational Quotes',
    emoji: '💪',
    description: 'Get inspiring quotes during breaks',
    unlocked: true,
    requirement: 'Available from start'
  },
  {
    id: 'focus-music',
    name: 'Focus Sounds',
    emoji: '🎵',
    description: 'Ambient sounds to help concentration',
    unlocked: false,
    requirement: 'Complete 5 focus sessions'
  },
  {
    id: 'productivity-pets',
    name: 'Productivity Pet',
    emoji: '🐱',
    description: 'Virtual pet that grows with your productivity',
    unlocked: false,
    requirement: 'Reach 10 hours total focus time'
  },
  {
    id: 'streak-rewards',
    name: 'Streak Rewards',
    emoji: '🎁',
    description: 'Special rewards for maintaining streaks',
    unlocked: false,
    requirement: 'Maintain 7-day streak'
  },
];

const MOTIVATIONAL_QUOTES = [
  "You're doing amazing! Keep it up! 🌟",
  "Every small step counts towards your big goals! 👣",
  "Focus is your superpower! 💪",
  "You're building great habits! 🏗️",
  "Progress, not perfection! ✨",
  "Your future self will thank you! 🙏",
  "Stay consistent, stay awesome! 🚀",
  "You're stronger than you think! 💪",
];

const FOCUS_SOUNDS = [
  { name: 'Rain', emoji: '🌧️', description: 'Gentle rainfall' },
  { name: 'Forest', emoji: '🌲', description: 'Birds and nature' },
  { name: 'Waves', emoji: '🌊', description: 'Ocean waves' },
  { name: 'Coffee Shop', emoji: '☕', description: 'Café ambiance' },
  { name: 'White Noise', emoji: '🔊', description: 'Pure white noise' },
];

export function FunTimerFeatures() {
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [petLevel, setPetLevel] = useState(1);
  const [petHappiness, setPetHappiness] = useState(75);

  useEffect(() => {
    // Rotate motivational quotes every 30 seconds
    const interval = setInterval(() => {
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setCurrentQuote(randomQuote);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getPetEmoji = () => {
    if (petHappiness > 80) return '😺';
    if (petHappiness > 60) return '🐱';
    if (petHappiness > 40) return '😐';
    return '😿';
  };

  return (
    <div className="space-y-6">
      {/* Motivational Quote */}
      <Card className="bg-gradient-primary/10 border-primary/20 text-center">
        <CardContent className="p-4">
          <div className="text-lg font-semibold text-primary mb-2">
            💭 Daily Motivation
          </div>
          <p className="text-foreground">{currentQuote}</p>
        </CardContent>
      </Card>

      {/* Focus Sounds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-accent" />
            Focus Sounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {FOCUS_SOUNDS.map((sound) => (
              <Button
                key={sound.name}
                variant={selectedSound === sound.name ? "default" : "outline"}
                size="sm"
                className="h-auto p-3 flex-col"
                onClick={() => setSelectedSound(selectedSound === sound.name ? null : sound.name)}
              >
                <div className="text-2xl mb-1">{sound.emoji}</div>
                <div className="text-xs font-semibold">{sound.name}</div>
                <div className="text-xs text-muted-foreground">{sound.description}</div>
              </Button>
            ))}
          </div>
          {selectedSound && (
            <div className="mt-4 p-3 bg-gradient-accent/5 rounded-lg border border-accent/10 text-center">
              <div className="text-sm text-accent">🎵 Playing: {selectedSound}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Sound will play during focus sessions
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Productivity Pet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{getPetEmoji()}</span>
            Your Productivity Pet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-2">{getPetEmoji()}</div>
            <div className="font-semibold">Level {petLevel} Pet</div>
            <div className="text-sm text-muted-foreground">
              Keep focusing to make your pet happy!
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Happiness</span>
              <span>{petHappiness}%</span>
            </div>
            <Progress value={petHappiness} className="h-3" />
          </div>
          
          <div className="text-center">
            <Button
              size="sm"
              onClick={() => {
                setPetHappiness(Math.min(100, petHappiness + 10));
                if (petHappiness >= 100 && Math.random() > 0.7) {
                  setPetLevel(petLevel + 1);
                  setPetHappiness(75);
                }
              }}
              className="bg-gradient-success hover:bg-gradient-success/90"
            >
              <Coffee className="h-4 w-4 mr-2" />
              Give Treat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Unlock Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Unlock New Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FUN_FEATURES.map((feature) => (
              <div key={feature.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="text-2xl">{feature.emoji}</div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{feature.name}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                  <div className="text-xs text-primary mt-1">{feature.requirement}</div>
                </div>
                <Badge variant={feature.unlocked ? "default" : "secondary"}>
                  {feature.unlocked ? "✅ Unlocked" : "🔒 Locked"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Games for Break Time */}
      <Card className="bg-gradient-warning/5 border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-warning" />
            Break Time Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <div className="text-2xl mb-1">🧠</div>
              <div className="text-xs font-semibold">Brain Teaser</div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs font-semibold">Quick Focus</div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <div className="text-2xl mb-1">🧘</div>
              <div className="text-xs font-semibold">Breathe</div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 flex-col">
              <div className="text-2xl mb-1">🤸</div>
              <div className="text-xs font-semibold">Stretch</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
