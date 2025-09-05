import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Star, Timer, Calendar, CheckCircle2, Clock, Brain, Book, Play, Sparkles } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

const introSteps = [
  {
    title: "Welcome to StudyBuddy! 👋",
    description: "Your personalized study companion that makes learning fun and productive.",
    icon: Star,
    gradient: "bg-gradient-to-br from-purple-500 to-blue-500"
  },
  {
    title: "Smart Focus Timer ⏱️",
    description: "Stay focused with our intelligent timer that adapts to your study habits.",
    icon: Timer,
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
  },
  {
    title: "Organize Your Study Plans 📅",
    description: "Keep track of your tasks, goals, and special study days all in one place.",
    icon: Calendar,
    gradient: "bg-gradient-to-br from-cyan-500 to-teal-500"
  },
  {
    title: "Track Your Progress 🎯",
    description: "Earn achievements and watch your progress grow as you reach your study goals.",
    icon: CheckCircle2,
    gradient: "bg-gradient-to-br from-teal-500 to-emerald-500"
  },
  {
    title: "Focus Timer",
    description: "Stay productive with our engaging Pomodoro technique and detailed focus analytics",
    icon: Clock,
    gradient: "bg-gradient-to-br from-orange-500 to-red-500"
  },
  {
    title: "Study Smart",
    description: "AI-powered study suggestions and personalized learning patterns",
    icon: Brain,
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
  },
  {
    title: "Knowledge Tracking",
    description: "Track your learning progress and achievements over time",
    icon: Book,
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-500"
  },
  {
    title: "Dynamic Schedule",
    description: "Intelligent timetables that adapt to your study habits and energy levels",
    icon: Calendar,
    gradient: "bg-gradient-to-br from-green-500 to-teal-500"
  },
  {
    title: "Achievement System",
    description: "Earn rewards and track your progress with our gamified learning system",
    icon: Star,
    gradient: "bg-gradient-to-br from-yellow-500 to-orange-500"
  }
];

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleNext = () => {
    if (currentStep < introSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo & Welcome */}
        <motion.div 
          className="text-center mb-8 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-primary/10 blur-3xl transform -rotate-6" />
          <div className="relative">
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-2xl mb-4 shadow-lg"
              animate={{ 
                y: [0, -8, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <Sparkles className="h-12 w-12 text-white animate-pulse" />
            </motion.div>
            <motion.h1 
              className="text-5xl font-display font-bold mb-3 text-primary"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              StudyBuddy
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Your intelligent study companion
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card variant="elevated" className="mb-6">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${introSteps[currentStep]?.gradient} flex items-center justify-center mb-4 shadow-lg transform hover:scale-105 transition-transform`}>
                    {introSteps[currentStep]?.icon && 
                      React.createElement(introSteps[currentStep].icon, { className: "h-8 w-8 text-white" })
                    }
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2 text-primary">
                    {introSteps[currentStep]?.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {introSteps[currentStep]?.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Progress Indicators */}
          <motion.div 
            className="flex flex-col gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Progress value={(currentStep + 1) / introSteps.length * 100} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {introSteps.length}</span>
              <span>{Math.round((currentStep + 1) / introSteps.length * 100)}% Complete</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 hover:bg-accent/20"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleNext}
            >
              {currentStep < introSteps.length - 1 ? (
                <motion.div className="flex items-center">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </motion.div>
              ) : (
                <motion.div className="flex items-center">
                  Get Started
                  <Play className="h-4 w-4 ml-1" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </motion.div>

        {/* Fun Animation Elements */}
        <motion.div 
          className="absolute -top-10 -right-10 w-20 h-20 bg-white/5 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-10 -left-10 w-16 h-16 bg-white/5 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>
    </div>
  );
}
