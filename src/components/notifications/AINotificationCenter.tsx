import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AINotification,
  aiNotificationService
} from '@/lib/ai-notification-service';

interface NotificationItemProps {
  notification: AINotification;
  onClose: () => void;
}

const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'achievement':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-primary" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const handleAction = () => {
    if (notification.action) {
      navigate(notification.action.route);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative p-4 mb-2 rounded-lg shadow-lg",
        "bg-background border border-border",
        "hover:shadow-xl transition-shadow"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <h4 className="font-medium text-foreground">
            {notification.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.body}
          </p>
          {notification.action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={handleAction}
            >
              {notification.action.label}
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div 
        className={cn(
          "absolute bottom-0 left-0 h-1 rounded-full transition-all",
          notification.priority === 'high' 
            ? "bg-destructive" 
            : notification.priority === 'medium'
              ? "bg-warning"
              : "bg-primary"
        )}
        style={{ width: '100%', opacity: 0.5 }}
      />
    </motion.div>
  );
};

export function AINotificationCenter() {
  const [notifications, setNotifications] = useState<AINotification[]>([]);

  useEffect(() => {
    const handleNotification = (notification: AINotification) => {
      setNotifications(prev => [notification, ...prev]);

      // Auto-dismiss low priority notifications after 5 seconds
      if (notification.priority === 'low') {
        setTimeout(() => {
          handleClose(notification.id);
        }, 5000);
      }
    };

    aiNotificationService.addListener(handleNotification);
    
    return () => {
      aiNotificationService.removeListener(handleNotification);
    };
  }, []);

  const handleClose = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    aiNotificationService.clearNotification(id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-[80vh] overflow-y-auto">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => handleClose(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
