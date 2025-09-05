
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
    <header className={cn("mb-6 animate-slide-up", className)}>
      <div className="flex items-center justify-between px-2 sm:px-0">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-md flex items-center justify-center min-w-[48px] min-h-[48px]">
              {icon}
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-2xl font-bold text-foreground leading-tight truncate max-w-[80vw]">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5 leading-tight truncate max-w-[80vw]">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0 flex items-center justify-end">{action}</div>}
      </div>
      <div className="border-b border-border mt-4" />
    </header>
  );
}
