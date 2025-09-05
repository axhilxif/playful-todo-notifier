
import { cn } from "@/lib/utils";
import { CheckSquare, Calendar, Timer, Settings, User, Sparkles, Brain, PawPrint } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/todos", icon: CheckSquare, label: "Todos" },
  { to: "/timetable", icon: Calendar, label: "Schedule" },
  { to: "/", icon: Timer, label: "Timer" },
  { to: "/insights", icon: Brain, label: "Insights" },
  { to: "/pet", icon: PawPrint, label: "Pet" }, // New Pet link
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card backdrop-blur-lg border-t border-border z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 min-w-0 flex-1 relative",
                isActive
                  ? "text-primary bg-primary/10 shadow-md"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
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
