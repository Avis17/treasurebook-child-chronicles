
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { Calendar } from "@/components/ui/calendar";
import { useCalendarEvents } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Calendar as CalendarIcon, BookOpen, Trophy, Music } from "lucide-react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, isSameDay } from "date-fns";

export const CalendarSection = () => {
  const { currentUser } = useAuth();
  const { data: calendarEvents, loading: calendarLoading } = useCalendarEvents(currentUser?.uid);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [month, setMonth] = React.useState<string>(
    new Date().toLocaleDateString("default", { month: "long", year: "numeric" })
  );
  const [events, setEvents] = React.useState<any[]>([]); 
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!currentUser?.uid) return;
    
    setLoading(true);
    
    setEvents(calendarEvents || []);

    const q = query(
      collection(db, "events"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items: any[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        
        setEvents(prev => {
          const combined = [...(prev || [])];
          items.forEach(item => {
            if (!combined.some(existing => existing.id === item.id)) {
              combined.push(item);
            }
          });
          return combined;
        });
        
        setLoading(false);
      },
      (err) => {
        console.log("No events collection or error:", err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, calendarEvents]);

  const eventsByDate = React.useMemo(() => {
    const eventMap: Record<string, {events: any[], categories: Set<string>}> = {};
    
    events.forEach(event => {
      if (!event.date) return;
      
      let eventDate;
      try {
        if (typeof event.date === 'string') {
          eventDate = new Date(event.date);
        } else if (event.date.toDate) {
          eventDate = event.date.toDate();
        } else {
          eventDate = new Date(event.date);
        }
        
        const dateKey = eventDate.toISOString().split("T")[0];
        
        if (!eventMap[dateKey]) {
          eventMap[dateKey] = {
            events: [],
            categories: new Set()
          };
        }
        
        eventMap[dateKey].events.push(event);
        if (event.category) {
          eventMap[dateKey].categories.add(event.category.toLowerCase());
        }
      } catch (e) {
        console.error("Error processing event date:", e, event);
      }
    });
    
    return eventMap;
  }, [events]);

  const handleMonthChange = (date: Date) => {
    setMonth(date.toLocaleDateString("default", { month: "long", year: "numeric" }));
  };

  const selectedDayEvents = React.useMemo(() => {
    if (!date) return [];
    const dateKey = date.toISOString().split("T")[0];
    return eventsByDate[dateKey]?.events || [];
  }, [date, eventsByDate]);

  const categoryConfig: Record<string, {
    icon: React.ReactNode,
    color: string, 
    bgColor: string,
    dotColor: string
  }> = {
    exam: { 
      icon: <BookOpen className="h-4 w-4" />, 
      color: "bg-red-500",
      dotColor: "bg-red-500",
      bgColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    },
    assignment: { 
      icon: <Clock className="h-4 w-4" />, 
      color: "bg-blue-500",
      dotColor: "bg-blue-500",
      bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    },
    sports: { 
      icon: <Trophy className="h-4 w-4" />, 
      color: "bg-green-500",
      dotColor: "bg-green-500",
      bgColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    },
    music: { 
      icon: <Music className="h-4 w-4" />, 
      color: "bg-amber-500",
      dotColor: "bg-amber-500", 
      bgColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
    },
    default: { 
      icon: <CalendarIcon className="h-4 w-4" />, 
      color: "bg-purple-500",
      dotColor: "bg-purple-500",
      bgColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
    }
  };

  const getCategoryConfig = (category: string) => {
    const normalizedCategory = category?.toLowerCase() || 'default';
    return categoryConfig[normalizedCategory] || categoryConfig.default;
  };

  // Get dates with events for modifiers
  const eventDates = React.useMemo(() => {
    return Object.keys(eventsByDate).map(dateStr => new Date(dateStr));
  }, [eventsByDate]);

  if (loading || calendarLoading) {
    return (
      <DashboardCard title="Calendar Events">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title={
        <div className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-indigo-500" />
          <span>{month}</span>
        </div>
      }
      gradient
    >
      <div className="flex flex-col space-y-4">
        <div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            onMonthChange={handleMonthChange}
            className="rounded-md border pointer-events-auto"
            modifiers={{
              hasEvent: eventDates,
            }}
            modifiersClassNames={{
              hasEvent: "font-semibold text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 rounded-md",
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.entries(categoryConfig).slice(0, -1).map(([category, config]) => (
            <div key={category} className="flex items-center text-xs">
              <div className={`w-3 h-3 rounded-full ${config.dotColor} mr-1`}></div>
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-3 mt-2">
          <h3 className="font-medium text-sm text-muted-foreground">
            {date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h3>
          
          {selectedDayEvents.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {selectedDayEvents.map((event) => {
                const config = getCategoryConfig(event.category);
                return (
                  <div 
                    key={event.id} 
                    className={`flex items-center justify-between p-2 rounded-lg ${config.bgColor} border border-opacity-50`}
                    style={{ borderColor: config.color }}
                  >
                    <div className="flex items-center">
                      {config.icon}
                      <span className="ml-2 font-medium">{event.title}</span>
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
                      {event.time || event.status || "Upcoming"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-center">
              <CalendarIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-70" />
              <p className="text-sm text-muted-foreground">
                No events for this date
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
};
