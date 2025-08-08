
import { useState, useEffect } from 'react';
import { Plus, Pin, Calendar, Star, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanCard } from './PlanCard';
import { PlanForm } from './PlanForm';
import { SpecialDayForm } from './SpecialDayForm';
import { useToast } from '@/hooks/use-toast';
import { playHaptic } from '@/lib/notifications';

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
    playHaptic();
    
    toast({
      title: "Plan added! ✨",
      description: `${newPlan.emoji} "${newPlan.title}" has been added to your board.`,
    });
  };

  const handleTogglePin = (id: string) => {
    const updatedPlans = plans.map(plan =>
      plan.id === id ? { ...plan, isPinned: !plan.isPinned } : plan
    );
    savePlans(updatedPlans);
    playHaptic();
    
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
    playHaptic();
    
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Wall texture background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)`,
        backgroundSize: '20px 20px'
      }} />
      
      {/* Cork board pins decoration */}
      <div className="absolute top-4 left-4 w-4 h-4 bg-gradient-accent rounded-full shadow-pin opacity-60" />
      <div className="absolute top-4 right-4 w-4 h-4 bg-gradient-primary rounded-full shadow-pin opacity-60" />
      <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-success rounded-full shadow-pin opacity-60" />
      <div className="absolute bottom-4 right-4 w-4 h-4 bg-gradient-warning rounded-full shadow-pin opacity-60" />
      
      <div className="relative space-y-6 p-4">
        {/* Header */}
        <div className="text-center space-y-4 mt-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="p-6 bg-gradient-hero rounded-full shadow-playful animate-bounce-in">
                <Sparkles className="h-12 w-12 text-white animate-pulse" />
              </div>
              {/* Pin decoration */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-accent rounded-full shadow-pin" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              My Plan Board
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Your creative space to design perfect days with activities and special moments! 🌟
            </p>
          </div>
        </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          onClick={() => setShowPlanForm(true)}
          className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-playful"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
        <Button 
          onClick={() => setShowSpecialDayForm(true)}
          className="bg-gradient-accent hover:bg-gradient-accent/90 shadow-playful"
          variant="outline"
        >
          <Star className="h-4 w-4 mr-2" />
          Special Day
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{plans.length}</div>
            <div className="text-xs text-muted-foreground">Total Plans</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-accent/5 border-accent/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{pinnedPlans.length}</div>
            <div className="text-xs text-muted-foreground">Pinned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-success/5 border-success/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {plans.filter(p => p.type === 'special-day').length}
            </div>
            <div className="text-xs text-muted-foreground">Special Days</div>
          </CardContent>
        </Card>
      </div>

      {/* Pinned Plans */}
      {pinnedPlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-primary">Pinned Plans</h3>
          </div>
          <div className="grid gap-3">
            {pinnedPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onTogglePin={() => handleTogglePin(plan.id)}
                onEdit={() => {
                  setEditingPlan(plan);
                  setShowPlanForm(true);
                }}
                onDelete={() => handleDeletePlan(plan.id)}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Plans */}
      {unpinnedPlans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Plans</h3>
          <div className="grid gap-3">
            {unpinnedPlans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onTogglePin={() => handleTogglePin(plan.id)}
                onEdit={() => {
                  setEditingPlan(plan);
                  setShowPlanForm(true);
                }}
                onDelete={() => handleDeletePlan(plan.id)}
                className="animate-slide-up"
                style={{ animationDelay: `${(index + pinnedPlans.length) * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="relative inline-block mb-8">
              <div className="text-8xl mb-4 animate-bounce-in">🎯</div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-primary rounded-full shadow-pin animate-pulse" />
            </div>
            <Card className="max-w-lg mx-auto bg-gradient-card border-primary/20 shadow-playful">
              <CardContent className="p-8">
                <h3 className="text-2xl font-display font-bold mb-3 text-primary">Start Planning Your Perfect Days!</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Transform your dreams into reality. Create activities, mark special days, and build your ideal life schedule on this beautiful board.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button 
                    onClick={() => setShowPlanForm(true)}
                    className="bg-gradient-primary hover:bg-gradient-primary/90 shadow-playful font-semibold"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Activity
                  </Button>
                </div>
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
