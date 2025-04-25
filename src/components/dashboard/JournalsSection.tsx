
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useJournalEntries } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";

export const JournalsSection = () => {
  const { currentUser } = useAuth();
  const { data: journals, loading } = useJournalEntries(currentUser?.uid);

  // Process mood data for the pie chart
  const moodData = React.useMemo(() => {
    const moods = journals.reduce((acc: Record<string, number>, journal) => {
      const mood = journal.mood || "Neutral";
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(moods).map(([name, value]) => ({
      name,
      value,
    }));
  }, [journals]);

  // Journal tags
  const journalTags = React.useMemo(() => {
    const tags = journals.flatMap(journal => journal.tags || []);
    const tagCount: Record<string, number> = {};
    
    tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
    
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [journals]);

  // Mood colors
  const MOOD_COLORS = {
    Happy: "#10b981",
    Sad: "#6366f1",
    Excited: "#f59e0b",
    Angry: "#ef4444",
    Neutral: "#94a3b8",
  };

  const getMoodColor = (mood: string) => {
    return MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || MOOD_COLORS.Neutral;
  };

  if (loading) {
    return (
      <DashboardCard title="Journals">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Journals">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {moodData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getMoodColor(entry.name)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center font-medium">Mood</p>
        </div>
        
        <div className="md:col-span-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {journalTags.map(([tag, count]) => (
              <div 
                key={tag} 
                className="px-2 py-1 bg-primary-foreground text-primary dark:bg-primary dark:text-primary-foreground rounded text-xs flex items-center"
              >
                <span>{tag}</span>
                <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground dark:bg-primary-foreground dark:text-primary rounded-full text-[10px]">
                  {count}
                </span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2">
            {journals.slice(0, 2).map((journal) => (
              <div 
                key={journal.id} 
                className="p-2 rounded-lg bg-muted/40"
              >
                <p className="text-sm font-medium">{journal.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {journal.content.substring(0, 60)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
