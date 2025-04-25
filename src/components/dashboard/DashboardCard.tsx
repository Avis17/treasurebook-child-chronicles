
import * as React from "react";
import { Card } from "@/components/ui/card";

// Use Omit to exclude the 'title' property from HTMLAttributes before extending
interface DashboardCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;  // Define our own title prop with ReactNode type
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  gradient?: boolean;
}

export function DashboardCard({ 
  title, 
  action, 
  className, 
  children,
  gradient = false,
  ...props 
}: DashboardCardProps) {
  return (
    <Card 
      className={`overflow-hidden ${gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950' : 'bg-background'} shadow-sm border rounded-xl hover:shadow-md transition-shadow duration-300 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b p-4">
          {title && (
            <h3 className="font-semibold text-lg text-foreground flex items-center">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </Card>
  );
}
