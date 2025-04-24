
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'exam' | 'assignment' | 'event' | 'sports';
}

const ActivitySummary: React.FC = () => {
  // Sample upcoming activities data
  const upcomingActivities: Activity[] = [
    {
      id: '1',
      title: 'Mathematics Final Exam',
      date: '2025-05-10',
      time: '09:00 AM',
      type: 'exam'
    },
    {
      id: '2',
      title: 'Science Project Submission',
      date: '2025-05-15',
      type: 'assignment'
    },
    {
      id: '3',
      title: 'Football Tournament',
      date: '2025-05-20',
      time: '03:30 PM',
      type: 'sports'
    }
  ];

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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

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
