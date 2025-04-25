
import * as React from "react";
import { Card } from "@/components/ui/card";

interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function DashboardCard({ 
  title, 
  action, 
  className, 
  children,
  ...props 
}: DashboardCardProps) {
  return (
    <Card 
      className={`overflow-hidden bg-background shadow-sm border rounded-xl ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between border-b p-4">
          {title && <h3 className="font-semibold text-lg text-foreground">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </Card>
  );
}
