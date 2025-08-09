
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { backgroundNotificationManager } from "@/lib/background-notifications";
import { useIntroScreen } from "@/hooks/use-intro-screen";
import { IntroScreen } from "@/components/intro/IntroScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { createNotificationChannel } from "@/lib/notifications";
import { backgroundService } from "@/lib/background-service";
import Todos from "./pages/Todos";
import Timetable from "./pages/Timetable";
import Timer from "./pages/Timer";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { shouldShowIntro, markIntroAsSeen } = useIntroScreen();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await backgroundNotificationManager.initialize();
        // Create notification channels for Android
        await createNotificationChannel({ id: 'reminders', name: 'Reminders', description: 'Todo and timetable reminders', importance: 5, visibility: 1 });
        await createNotificationChannel({ id: 'timetable', name: 'Timetable', description: 'Scheduled activity reminders', importance: 5, visibility: 1 });
        await createNotificationChannel({ id: 'achievements', name: 'Achievements', description: 'Unlocked achievements', importance: 3, visibility: 1 });
        await createNotificationChannel({ id: 'level_ups', name: 'Level Ups', description: 'Level up notifications', importance: 3, visibility: 1 });
        backgroundService.start();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading StudyBuddy...</p>
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
              <Route path="/" element={<Todos />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
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
