
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { notificationService } from "@/lib/notification-service";
import { AINotificationCenter } from '@/components/notifications/AINotificationCenter';
import { aiNotificationService } from '@/lib/ai-notification-service';
import { useIntroScreen } from "@/hooks/use-intro-screen";
import { useTheme } from "@/hooks/use-theme";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BatteryOptimizationDialog } from '@/components/ui/BatteryOptimizationDialog';

import { backgroundService } from "@/lib/background-service";
import { updatePetStats } from '@/lib/pet'; // Import updatePetStats
import Todos from "./pages/Todos";
import Timetable from "./pages/Timetable";
import Timer from "./pages/Timer";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";
import Pet from "./pages/Pet";

const queryClient = new QueryClient();

const AppContent = () => {
  const { shouldShowIntro, markIntroAsSeen } = useIntroScreen();
  const { theme, toggleTheme } = useTheme(); // Use the theme hook
  const [isInitialized, setIsInitialized] = useState(false);
  const [showBatteryOptimizationDialog, setShowBatteryOptimizationDialog] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await notificationService.initialize();
        // Create notification channels for Android
        await notificationService.createChannels([
          { id: 'ai_insights', name: 'AI Insights', description: 'Smart suggestions and insights', importance: 4, visibility: 1 },
          { id: 'reminders', name: 'Reminders', description: 'Todo and timetable reminders', importance: 5, visibility: 1 },
          { id: 'timetable', name: 'Timetable', description: 'Scheduled activity reminders', importance: 5, visibility: 1 },
          { id: 'achievements', name: 'Achievements', description: 'Unlocked achievements', importance: 3, visibility: 1 },
          { id: 'level_ups', name: 'Level Ups', description: 'Level up notifications', importance: 3, visibility: 1 },
          { id: 'pet_hunger', name: 'Pet Hunger', description: 'Notifications about your pet\'s hunger level', importance: 4, visibility: 1 }, // New channel for pet hunger
          { id: 'pet_death', name: 'Pet Death', description: 'Notifications about your pet\'s status', importance: 4, visibility: 1 }, // New channel for pet death
          { id: 'pet_new', name: 'New Pet', description: 'Notifications about getting a new pet', importance: 4, visibility: 1 }, // New channel for new pet
          { id: 'pet_xp_needed', name: 'Pet XP Needed', description: 'Notifications about insufficient XP for pet actions', importance: 4, visibility: 1 }, // New channel for pet XP needed
          { id: 'pet_fed', name: 'Pet Fed', description: 'Notifications about feeding your pet', importance: 4, visibility: 1 }, // New channel for pet fed
          { id: 'pet_played', name: 'Pet Played', description: 'Notifications about playing with your pet', importance: 4, visibility: 1 }, // New channel for pet played
          { id: 'pet_no_pet', name: 'No Pet', description: 'Notifications when trying to interact with a non-existent pet', importance: 4, visibility: 1 }, // New channel for no pet
          { id: 'pet_already_have', name: 'Already Have Pet', description: 'Notifications when trying to buy a pet while already having one', importance: 4, visibility: 1 }, // New channel for already have pet
          { id: 'pet_head_changed', name: 'Pet Head Changed', description: 'Notifications when your pet\'s head is changed', importance: 4, visibility: 1 }, // New channel for pet head changed
          { id: 'pet_xp_needed_head', name: 'Pet XP Needed Head', description: 'Notifications about insufficient XP for changing pet head', importance: 4, visibility: 1 }, // New channel for pet XP needed head
        ]);
        await notificationService.scheduleAllReminders();
        backgroundService.start();
        // Kick off AI analysis and notifications (will compute stats internally)
        try {
          const todos = [] as any[]; // we let the service read real todos if needed, but pass an empty array to keep signature
          await aiNotificationService.analyzeAndNotify(todos);
        } catch (err) {
          console.warn('AI analysis failed to run on init:', err);
        }

        // Initialize and periodically update pet stats
        updatePetStats(); // Initial update
        const petUpdateInterval = setInterval(updatePetStats, 60 * 60 * 1000); // Every hour
        return () => clearInterval(petUpdateInterval); // Cleanup on unmount

      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();

    const hasSeenBatteryOptimizationDialog = localStorage.getItem('hasSeenBatteryOptimizationDialog');
    if (!hasSeenBatteryOptimizationDialog) {
      setShowBatteryOptimizationDialog(true);
      localStorage.setItem('hasSeenBatteryOptimizationDialog', 'true');
    }
  }, []);


  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {shouldShowIntro ? (
          <IntroScreen onComplete={markIntroAsSeen} />
        ) : (
          <>
            <Routes>
              <Route path="/todos" element={<Todos />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/" element={<Timer />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/pet" element={<Pet />} /> {/* New route for Pet page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
            <BatteryOptimizationDialog open={showBatteryOptimizationDialog} onOpenChange={setShowBatteryOptimizationDialog} />
            <AINotificationCenter />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
