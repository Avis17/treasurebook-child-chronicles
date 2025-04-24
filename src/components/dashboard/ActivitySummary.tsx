
import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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
        const user = auth.currentUser;
        if (!user) return;

        const activities: Activity[] = [];
        const today = new Date();

        // Fetch calendar events
        const eventsRef = collection(db, "calendarEvents");
        const eventsQuery = query(
          eventsRef,
          where("userId", "==", user.uid),
          where("date", ">=", format(today, 'yyyy-MM-dd')),
          orderBy("date", "asc"),
          limit(5)
        );

        const eventsDocs = await getDocs(eventsQuery);
        eventsDocs.forEach(doc => {
          const data = doc.data();
          activities.push({
            id: doc.id,
            title: data.title,
            date: data.date,
            time: data.time,
            type: data.category as Activity['type']
          });
        });

        setUpcomingActivities(activities);
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
    const date = new Date(dateString);
    return format(date, 'MMM d');
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
            <div className={`mt-0.5 p-1.5 rounded-full bg-opacity-20 ${getActivityTypeColor(activity.type).replace('text-', 'bg-')}`}>
              <Calendar className={`h-4 w-4 ${getActivityTypeColor(activity.type)}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-sm">{activity.title}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.date)}</span>
              </div>
              {activity.time && (
                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {activity.time}
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          No upcoming activities
        </p>
      )}
    </div>
  );
};

export default ActivitySummary;
