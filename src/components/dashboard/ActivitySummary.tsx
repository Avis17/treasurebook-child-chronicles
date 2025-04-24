
import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        console.log("Fetching upcoming activities for user:", user.uid);
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');

        // Fetch calendar events - removing orderBy to avoid index errors
        const eventsRef = collection(db, "calendarEvents");
        const eventsQuery = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", ">=", todayStr)
        );

        console.log("Fetching calendar events with query parameters:", {
          userId: user.uid,
          dateFrom: todayStr
        });

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
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityTypeColor = (type: Activity['type']) => {
    switch(type) {
      case 'exam':
        return 'text-red-500';
      case 'assignment':
        return 'text-blue-500';
      case 'event':
        return 'text-purple-500';
      case 'sports':
        return 'text-green-500';
      default:
        return 'text-gray-500';
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
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {upcomingActivities.length > 0 ? (
        upcomingActivities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-md border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <div className={`mt-0.5 p-1.5 rounded-full ${getActivityTypeColor(activity.type).replace('text-', 'bg-')}/20`}>
              <Calendar className={`h-4 w-4 ${getActivityTypeColor(activity.type)}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.date)}</span>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 mr-2">
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
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          No upcoming activities. Add events in the Calendar section.
        </p>
      )}
    </div>
  );
};

export default ActivitySummary;
