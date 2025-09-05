
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pin, Calendar, Star, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanCard } from './PlanCard';
import { PlanForm } from './PlanForm';
import { SpecialDayForm } from './SpecialDayForm';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/lib/notification-service';
import { processUserAction } from '@/lib/gamification';

export interface PlanItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'activity' | 'special-day' | 'goal';
  color: string;
  isPinned: boolean;
  emoji: string;
  createdAt: Date;
  category?: string; // For special days
  image?: string; // Base64 image string
  dueDate?: string; // Optional due date for goals and activities
  subject?: string; // Subject or area of focus
}

export function PlanBoard() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showSpecialDayForm, setShowSpecialDayForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedPlans = localStorage.getItem('planBoard');
    if (storedPlans) {
      setPlans(JSON.parse(storedPlans));
    }
  }, []);

  const savePlans = (newPlans: PlanItem[]) => {
    localStorage.setItem('planBoard', JSON.stringify(newPlans));
    setPlans(newPlans);
  };

  const handleAddPlan = (planData: Omit<PlanItem, 'id' | 'createdAt'>) => {
    const newPlan: PlanItem = {
      ...planData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    const updatedPlans = [...plans, newPlan];
    savePlans(updatedPlans);
    setShowPlanForm(false);
    setShowSpecialDayForm(false);
    notificationService.playHaptic();
    
    const { levelUp, newLevel, newAchievements } = processUserAction('create-plan');

    toast({
      title: "Plan added! ✨",
      description: `${newPlan.emoji} "${newPlan.title}" has been added to your board. +10 XP`,
    });

    if (levelUp) {
        toast({ title: 'Level Up!', description: `You reached level ${newLevel}!` });
    }
    newAchievements.forEach(ach => {
        toast({ title: 'Achievement Unlocked!', description: `🎉 ${ach.name}` });
    });
  };

  const handleTogglePin = (id: string) => {
    const updatedPlans = plans.map(plan =>
      plan.id === id ? { ...plan, isPinned: !plan.isPinned } : plan
    );
    savePlans(updatedPlans);
    notificationService.playHaptic();
    
    const plan = plans.find(p => p.id === id);
    if (plan) {
      toast({
        title: plan.isPinned ? "Unpinned! 📌" : "Pinned! 🎯",
        description: `"${plan.title}" ${plan.isPinned ? 'removed from' : 'added to'} pinned items.`,
      });
    }
  };

  const handleDeletePlan = (id: string) => {
    const plan = plans.find(p => p.id === id);
    const updatedPlans = plans.filter(p => p.id !== id);
    savePlans(updatedPlans);
    notificationService.playHaptic();
    
    if (plan) {
      toast({
        title: "Plan removed! 🗑️",
        description: `"${plan.title}" has been removed from your board.`,
        variant: "destructive",
      });
    }
  };

  const pinnedPlans = plans.filter(plan => plan.isPinned);
  const unpinnedPlans = plans.filter(plan => !plan.isPinned);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Wall texture background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }} />
      
      {/* Cork board pins decoration */}
      <div className="absolute top-4 left-4 w-4 h-4 bg-accent rounded-full shadow-md opacity-60" />
      <div className="absolute top-4 right-4 w-4 h-4 bg-primary rounded-full shadow-md opacity-60" />
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-success rounded-full shadow-md opacity-60" />
      <div className="absolute bottom-4 right-4 w-4 h-4 bg-warning rounded-full shadow-md opacity-60" />
      
      <div className="relative space-y-6 p-4">
        {/* Header */}
        <div className="text-center space-y-4 mt-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="p-6 bg-primary rounded-full shadow-lg animate-bounce-in">
                <Sparkles className="h-12 w-12 text-white animate-pulse" />
              </div>
              {/* Pin decoration */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full shadow-md" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary">
              My Plan Board
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Your creative space to design perfect days with activities and special moments! 🌟
            </p>
          </div>
        </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto px-4 sm:px-0 mt-4">
        <Button 
          onClick={() => setShowPlanForm(true)}
          variant="default"
          size="lg"
          className="flex-1 sm:flex-initial text-lg py-5 sm:py-6 rounded-2xl"
          style={{ minHeight: 64, fontWeight: 600 }}
        >
          <Calendar className="h-6 w-6 mr-2" />
          Add Activity
        </Button>
        <Button 
          onClick={() => setShowSpecialDayForm(true)}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-initial text-lg py-5 sm:py-6 rounded-2xl"
          style={{ minHeight: 64, fontWeight: 600 }}
        >
          <Star className="h-6 w-6 mr-2" />
          Special Day
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mx-auto max-w-3xl">
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary animate-count-up">
              {plans.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Plans</div>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-accent animate-count-up">
              {pinnedPlans.length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Pinned</div>
          </CardContent>
        </Card>
        <Card variant="elevated" className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-success animate-count-up">
              {plans.filter(p => p.type === 'special-day').length}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Special Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Container */}
      <div className="max-w-3xl mx-auto">
        {/* Sticky Note Board */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-1"
          style={{ minHeight: 300 }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            const draggedId = e.dataTransfer.getData('text/plain');
            const draggedIndex = plans.findIndex(p => p.id === draggedId);
            if (draggedIndex === -1) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Find the closest card to drop position
            let closestIdx = 0;
            let minDist = Infinity;
            e.currentTarget.childNodes.forEach((node, idx) => {
              if (!(node instanceof HTMLElement)) return;
              const cx = node.offsetLeft + node.offsetWidth / 2;
              const cy = node.offsetTop + node.offsetHeight / 2;
              const dist = Math.hypot(cx - x, cy - y);
              if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
              }
            });
            if (closestIdx !== draggedIndex) {
              const newPlans = [...plans];
              const [dragged] = newPlans.splice(draggedIndex, 1);
              newPlans.splice(closestIdx, 0, dragged);
              savePlans(newPlans);
            }
          }}
        >
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onTogglePin={() => handleTogglePin(plan.id)}
              onEdit={() => {
                setEditingPlan(plan);
                setShowPlanForm(true);
              }}
              onDelete={() => handleDeletePlan(plan.id)}
              className="animate-slide-up hover:scale-102 transition-transform"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </div>

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="text-center py-8 sm:py-16 px-4 sm:px-6 mt-4">
            <div className="relative inline-block mb-8 group">
              <motion.div 
                className="text-6xl sm:text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                🎯
              </motion.div>
              <motion.div 
                className="absolute -top-4 -right-4 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-primary rounded-full shadow-pin"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity
                }}
              />
            </div>
            <Card variant="elevated" className="max-w-lg mx-auto">
              <CardContent className="p-6 sm:p-8">
                <motion.h3 
                  className="text-xl sm:text-2xl font-display font-bold mb-3 text-primary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Start Planning Your Perfect Days!
                </motion.h3>
                <motion.p 
                  className="text-muted-foreground mb-6 leading-relaxed text-sm sm:text-base"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Transform your dreams into reality. Create activities, mark special days, and build your ideal life schedule on this beautiful board.
                </motion.p>
                <motion.div 
                  className="flex gap-3 justify-center flex-wrap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    onClick={() => setShowPlanForm(true)}
                    variant="default"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Activity
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Forms */}
      <PlanForm
        open={showPlanForm}
        onOpenChange={setShowPlanForm}
        onSubmit={handleAddPlan}
        initialData={editingPlan || undefined}
        title={editingPlan ? "Edit Plan" : "Add New Activity"}
      />

      <SpecialDayForm
        open={showSpecialDayForm}
        onOpenChange={setShowSpecialDayForm}
        onSubmit={handleAddPlan}
        title="Add Special Day"
      />
    </div>
  );
}
