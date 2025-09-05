import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Info, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface InsightCardProps {
  type: 'success' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
}

function getPriorityColor(type: InsightCardProps['type'], priority: InsightCardProps['priority']) {
  switch (type) {
    case 'success':
      return priority === 'high' ? 'bg-success' : 'bg-success/80';
    case 'warning':
      return priority === 'high' ? 'bg-destructive' : 'bg-warning';
    case 'info':
      return priority === 'high' ? 'bg-primary' : 'bg-primary/80';
  }
}

function getIcon(type: InsightCardProps['type']) {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5" />;
    case 'info':
      return <Info className="h-5 w-5" />;
  }
}

export function EnhancedInsightCard({ type, priority, title, message, action }: InsightCardProps) {
  const navigate = useNavigate();
  const priorityColor = getPriorityColor(type, priority);
  const Icon = getIcon(type);

  return (
    <Card className="relative overflow-hidden group">
      {/* Priority indicator */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-accent to-transparent opacity-20" />
      
      <motion.div 
        className="p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-full",
            type === 'success' ? 'text-success bg-success/10' :
            type === 'warning' ? 'text-warning bg-warning/10' :
            'text-primary bg-primary/10'
          )}>
            {Icon}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
            
            {action && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 group"
                onClick={() => navigate(action.route)}
              >
                {action.label}
                <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Priority indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Priority</span>
            <span className="capitalize">{priority}</span>
          </div>
          <Progress
            value={priority === 'high' ? 100 : priority === 'medium' ? 66 : 33}
            className={cn(
              "h-1",
              type === 'success' ? 'bg-success/20' :
              type === 'warning' ? 'bg-warning/20' :
              'bg-primary/20'
            )}
          />
        </div>
      </motion.div>
    </Card>
  );
}

interface EnhancedInsightsListProps {
  insights: InsightCardProps[];
  className?: string;
}

export function EnhancedInsightsList({ insights, className }: EnhancedInsightsListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <EnhancedInsightCard {...insight} />
        </motion.div>
      ))}
    </div>
  );
}
