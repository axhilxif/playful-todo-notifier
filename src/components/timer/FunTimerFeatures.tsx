import { Sparkles, Zap, Trophy, Coffee, Music, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FunFeature {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  requirement: string;
}

export const FUN_FEATURES: FunFeature[] = [
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
        unlocked: true, // Always unlocked
        requirement: 'Available from start'
    },
    {
        id: 'productivity-pets',
        name: 'Productivity Pet',
        emoji: '🐱',
        description: 'Virtual pet that grows with your productivity',
        unlocked: true, // Always unlocked
        requirement: 'Available from start'
    },
    {
        id: 'streak-rewards',
        name: 'Streak Rewards',
        emoji: '🎁',
        description: 'Special rewards for maintaining streaks',
        unlocked: true, // Always unlocked
        requirement: 'Available from start'
    },
];

export const MOTIVATIONAL_QUOTES = [
    "You're doing amazing! Keep it up! 🌟",
    "Every small step counts towards your big goals! 👣",
    "Focus is your superpower! 💪",
    "You're building great habits! 🏗️",
    "Progress, not perfection! ✨",
    "Your future self will thank you! 🙏",
    "Stay consistent, stay awesome! 🚀",
    "You're stronger than you think! 💪",
];

export const FOCUS_SOUNDS = [
    { name: 'Rain', emoji: '🌧️', description: 'Gentle rainfall' },
    { name: 'Forest', emoji: '🌲', description: 'Birds and nature' },
    { name: 'Waves', emoji: '🌊', description: 'Ocean waves' },
    { name: 'Coffee Shop', emoji: '☕', description: 'Café ambiance' },
    { name: 'White Noise', emoji: '🔊', description: 'Pure white noise' },
];

// List of available pet emojis and their cost
export const PET_EMOJIS = [
    { emoji: '🐱', cost: 0 },
    { emoji: '😺', cost: 500 },
    { emoji: '😾', cost: 1000 },
    { emoji: '😿', cost: 1500 },
    { emoji: '😐', cost: 2000 },
    { emoji: '👻', cost: 5000 },
];

interface FunTimerFeaturesProps {
    currentQuote: string;
    onFeatureClick: (featureId: string) => void;
}

export function FunTimerFeatures({
    currentQuote,
    onFeatureClick,
}: FunTimerFeaturesProps) {

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

            </div>
    );
}
