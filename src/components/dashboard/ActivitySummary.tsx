
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface Activity {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'assignment' | 'event' | 'sports';
}

const ActivitySummary: React.FC = () => {
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const user = auth.currentUser;
        if (!user) return;

        console.log("Fetching upcoming activities for user:", user.uid);
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');

        // Fetch calendar events - without using orderBy to avoid index errors
        const eventsRef = collection(db, "calendarEvents");
        let eventsQuery = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", ">=", todayStr)
        );

        console.log("Fetching calendar events with query parameters:", {
          userId: user.uid,
          dateFrom: todayStr
        });

        try {
          const eventsDocs = await getDocs(eventsQuery);
          console.log(`Found ${eventsDocs.size} upcoming events`);
          
          const activities: Activity[] = [];
          
          eventsDocs.forEach(doc => {
            const data = doc.data();
            console.log("Calendar event data:", data);
            
            activities.push({
              id: doc.id,
              title: data.title || "Untitled Event",
              date: data.date || format(today, 'yyyy-MM-dd'),
              time: data.time,
              type: data.category as Activity['type'] || 'event'
            });
          });

          // Sort manually by date since we removed orderBy
          activities.sort((a, b) => {
            // Compare dates
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA.getTime() - dateB.getTime();
          });

          // Limit to 5 events
          const limitedActivities = activities.slice(0, 5);
          console.log("Processed activities:", limitedActivities);
          
          setUpcomingActivities(limitedActivities);
        } catch (err) {
          console.error("Error fetching activities:", err);
          setError("Could not load upcoming events due to a database indexing error.");
          
          toast({
            variant: "destructive",
            title: "Database index error",
            description: "Check the Firebase console to create the required indexes for calendar events."
          });
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("Failed to load upcoming events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  const getActivityTypeColor = (type: Activity['type']) => {
    switch(type) {
      case 'exam':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'assignment':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      case 'event':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300';
      case 'sports':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d');
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800 text-center h-full flex flex-col justify-center items-center">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{error}</p>
        <p className="text-xs text-red-500 dark:text-red-400">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {upcomingActivities.length > 0 ? (
        upcomingActivities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className={`mt-0.5 p-2 rounded-full ${getActivityTypeColor(activity.type)}`}>
              <Calendar className={`h-4 w-4`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full ml-1">
                  {formatDate(activity.date)}
                </span>
              </div>
              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 mr-2">
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                </span>
                {activity.time && (
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.time}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 px-4 h-full flex flex-col justify-center items-center">
          <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">
            No upcoming activities
          </p>
          <a 
            href="/calendar" 
            className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
          >
            Add events in Calendar
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m9 18 6-6-6-6"/></svg>
          </a>
        </div>
      )}
    </div>
  );
};

export default ActivitySummary;
