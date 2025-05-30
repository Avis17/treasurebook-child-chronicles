
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useJournalEntries } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { Book } from "lucide-react";

export const JournalsSection = () => {
  const { currentUser } = useAuth();
  const { data: journals, loading } = useJournalEntries(currentUser?.uid);

  // Process mood data for the pie chart
  const moodData = React.useMemo(() => {
    const moods = journals.reduce((acc: Record<string, number>, journal) => {
      // Safely access mood with a fallback
      const mood = (journal.mood || "Neutral").toString();
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
    // Filter out journals without tags first
    const journalsWithTags = journals.filter(journal => Array.isArray(journal.tags) && journal.tags.length > 0);
    
    const tags = journalsWithTags.flatMap(journal => journal.tags);
    const tagCount: Record<string, number> = {};
    
    tags.forEach(tag => {
      if (typeof tag === 'string') {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
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

  const hasJournals = journals && journals.length > 0;

  return (
    <DashboardCard 
      title="Journals"
      action={
        <div className="flex items-center text-sm">
          <Book className="mr-1 h-4 w-4 text-indigo-500" />
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {journals.length} Entries
          </span>
        </div>
      }
    >
      {hasJournals ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="h-[150px]">
              {moodData.length > 0 ? (
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
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
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
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No mood data</p>
                </div>
              )}
            </div>
            <p className="text-center font-medium">Mood</p>
          </div>
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex flex-wrap gap-2">
              {journalTags.length > 0 ? (
                journalTags.map(([tag, count]) => (
                  <div 
                    key={tag} 
                    className="px-2 py-1 bg-primary-foreground text-primary dark:bg-primary dark:text-primary-foreground rounded text-xs flex items-center"
                  >
                    <span>{tag}</span>
                    <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground dark:bg-primary-foreground dark:text-primary rounded-full text-[10px]">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No tags found</p>
              )}
            </div>
            
            <div className="space-y-2">
              {journals.slice(0, 2).map((journal) => (
                <div 
                  key={journal.id} 
                  className="p-3 rounded-lg bg-muted/40 border border-muted"
                >
                  <p className="text-sm font-medium">{journal.title || "Untitled Entry"}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {journal.content ? 
                      (journal.content.length > 60 ? 
                        `${journal.content.substring(0, 60)}...` : 
                        journal.content) : 
                      "No content"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground text-center">No journal entries found</p>
          <a href="/journal" className="text-primary hover:underline mt-2 text-sm">Add a journal entry</a>
        </div>
      )}
    </DashboardCard>
  );
};
