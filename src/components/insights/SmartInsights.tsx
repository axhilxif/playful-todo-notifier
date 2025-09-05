import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
}

interface SmartInsightsProps {
  insights: SmartInsight[];
  className?: string;
}

export function SmartInsights({ insights, className }: SmartInsightsProps) {
  const navigate = useNavigate();

  const getIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-info" />;
    }
  };

  const getGradient = (type: SmartInsight['type']) => {
    switch (type) {
      case 'success':
        return 'from-success/10 to-success/5';
      case 'warning':
        return 'from-warning/10 to-warning/5';
      case 'info':
        return 'from-info/10 to-info/5';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <AnimatePresence>
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              "p-4 bg-gradient-to-br",
              getGradient(insight.type),
              "hover:shadow-lg transition-shadow duration-200"
            )}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-foreground">
                    {insight.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {insight.message}
                  </p>
                  {insight.action && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => navigate(insight.action!.route)}
                    >
                      {insight.action.label}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
