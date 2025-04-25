
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { Calendar } from "@/components/ui/calendar";
import { useCalendarEvents } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Check, Clock } from "lucide-react";

export const CalendarSection = () => {
  const { currentUser } = useAuth();
  const { data: events, loading } = useCalendarEvents(currentUser?.uid);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [month, setMonth] = React.useState<string>(
    new Date().toLocaleDateString("default", { month: "long", year: "numeric" })
  );

  // Process events by date
  const eventsByDate = React.useMemo(() => {
    return events.reduce((acc: Record<string, typeof events>, event) => {
      const eventDate = event.date?.toDate 
        ? new Date(event.date.toDate()) 
        : new Date(event.date);
      
      const dateKey = eventDate.toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {});
  }, [events]);

  // Handle month change in calendar
  const handleMonthChange = (date: Date) => {
    setMonth(date.toLocaleDateString("default", { month: "long", year: "numeric" }));
  };

  // Get events for the selected day
  const selectedDayEvents = React.useMemo(() => {
    if (!date) return [];
    const dateKey = date.toISOString().split("T")[0];
    return eventsByDate[dateKey] || [];
  }, [date, eventsByDate]);

  // Event category colors
  const categoryColors = {
    Exam: "bg-orange-500",
    Football: "bg-green-500",
    Activity: "bg-blue-500",
    Piano: "bg-amber-500",
    default: "bg-gray-500"
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
  };

  if (loading) {
    return (
      <DashboardCard title="Calendar Events">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title={month}>
      <div className="flex flex-col space-y-4">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            onMonthChange={handleMonthChange}
            className="rounded-md border"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(categoryColors).slice(0, -1).map(([category, color]) => (
            <div key={category} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full ${color} mr-1`}></div>
              <span>{category}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          {selectedDayEvents.length > 0 ? (
            selectedDayEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/40"
              >
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)} mr-2`}></div>
                  <span>{event.title}</span>
                </div>
                <Badge
                  variant={event.status === "Completed" ? "default" : "outline"}
                  className={event.status === "Completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}
                >
                  {event.status === "Completed" ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {event.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground py-2">
              No events for this date
            </p>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};
