import { useState, useEffect } from 'react';
import { Play, Sparkles, Target, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const features = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Smart Todo Management",
      description: "Create, organize and track your tasks with intelligent insights",
      gradient: "bg-gradient-primary"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Focus Timer",
      description: "Boost productivity with Pomodoro technique and focus tracking",
      gradient: "bg-gradient-accent"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Schedule Planning",
      description: "Plan your days with smart timetables and reminders",
      gradient: "bg-gradient-success"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Plan Board",
      description: "Visualize your goals and special moments on a personal board",
      gradient: "bg-gradient-warning"
    }
  ];

  const handleNext = () => {
    if (currentStep < features.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-gradient-hero flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-md transition-all duration-700 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Logo & Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4 animate-bounce-in">
            <Sparkles className="h-10 w-10 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Welcome to ACCS
          </h1>
          <p className="text-white/80 text-lg">
            Your productivity companion
          </p>
        </div>

        {/* Feature Cards */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-6">
            <div className={`transition-all duration-500 ${currentStep >= 0 ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
              <div className={`w-16 h-16 rounded-full ${features[currentStep]?.gradient} flex items-center justify-center text-white mb-4 shadow-glow`}>
                {features[currentStep]?.icon}
              </div>
              <h3 className="text-xl font-display font-semibold text-white mb-2">
                {features[currentStep]?.title}
              </h3>
              <p className="text-white/80 leading-relaxed">
                {features[currentStep]?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {features.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-white scale-110' 
                  : 'bg-white/30 scale-100'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
          >
            {currentStep < features.length - 1 ? (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Get Started
                <Play className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Fun Animation Elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-white/5 rounded-full animate-pulse delay-1000" />
      </div>
    </div>
  );
}