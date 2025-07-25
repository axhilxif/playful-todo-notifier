import { cn } from "@/lib/utils";
import { CheckSquare, Calendar, Timer, Settings, User, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: CheckSquare, label: "Todos" },
  { to: "/timetable", icon: Calendar, label: "Schedule" },
  { to: "/timer", icon: Timer, label: "Timer" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-card backdrop-blur-lg border-t border-primary/20 z-50 shadow-primary">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative",
                isActive
                  ? "text-primary bg-gradient-primary/10 shadow-glow border border-primary/20 animate-bounce-in"
                  : "text-muted-foreground hover:text-primary hover:bg-gradient-primary/5 hover:scale-105"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                    <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  </div>
                )}
                <Icon className={cn("h-5 w-5 mb-1 transition-transform", isActive && "scale-110")} />
                <span className="text-xs font-medium truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}