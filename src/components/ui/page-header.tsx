import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon, action, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-4 animate-slide-up", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && (
            <div className="p-2 sm:p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-playful flex items-center justify-center min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]">
              {icon}
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-tight truncate max-w-[80vw]">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-tight truncate max-w-[80vw]">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="mt-2 sm:mt-0 flex-shrink-0 flex items-center justify-end">{action}</div>}
      </div>
      <div className="border-b border-border mt-2 sm:mt-3" />
    </header>
  );
}