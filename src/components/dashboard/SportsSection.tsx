
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useSportsRecords, useExtracurricularRecords } from "@/lib/dashboard-service";
import { Award, Trophy, Medal, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SportsSection = () => {
  const { currentUser } = useAuth();
  const { data: sportsRecords, loading: loadingSports } = useSportsRecords(currentUser?.uid);
  const { data: extracurricularRecords, loading: loadingExtra } = useExtracurricularRecords(currentUser?.uid);

  const loading = loadingSports || loadingExtra;

  // Process data for the positions pie chart
  const positionsData = React.useMemo(() => {
    const positions = sportsRecords.reduce((acc: Record<string, number>, record) => {
      const position = record.position || "Other";
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(positions).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sportsRecords]);

  // Process data for event types
  const eventTypesData = React.useMemo(() => {
    const types = sportsRecords.reduce((acc: Record<string, number>, record) => {
      const type = record.eventType || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(types).map(([name, value]) => ({
      name,
      value,
    }));
  }, [sportsRecords]);

  // Color mapping for positions
  const POSITION_COLORS = {
    "1st Position / Gold": "#f59e0b",
    "2nd Position / Silver": "#94a3b8",
    "3rd Position / Bronze": "#d97706",
    "Finalist": "#10b981",
    "Semi-finalist": "#3b82f6",
    "Other": "#6366f1",
  };

  // Get color for a position
  const getPositionColor = (position: string) => {
    // Check if the position contains any of the key terms
    for (const [key, color] of Object.entries(POSITION_COLORS)) {
      if (position.includes(key.split(' ')[0]) || 
          position.includes(key.split(' / ')[0]) || 
          position.includes(key.split(' / ')[1])) {
        return color;
      }
    }
    return POSITION_COLORS.Other;
  };

  // Format text for participation numbers
  const sportsCount = sportsRecords.length;
  const extracurricularCount = extracurricularRecords.length;

  if (loading) {
    return (
      <DashboardCard title="Sports & Extracurriculars">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  const getPositionIcon = (position: string) => {
    if (position.includes("1st") || position.includes("Gold")) {
      return <Medal className="h-4 w-4 text-amber-500" />;
    } else if (position.includes("2nd") || position.includes("Silver")) {
      return <Medal className="h-4 w-4 text-gray-400" />;
    } else if (position.includes("3rd") || position.includes("Bronze")) {
      return <Medal className="h-4 w-4 text-amber-700" />;
    }
    return <Target className="h-4 w-4 text-blue-500" />;
  };

  return (
    <DashboardCard 
      title="Sports & Extracurriculars" 
      action={<Trophy className="h-4 w-4 text-amber-500" />}
      gradient
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Trophy className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-muted-foreground">Sports Events</div>
              <div className="font-bold text-xl text-blue-700 dark:text-blue-300">{sportsCount}</div>
            </div>
          </div>
          
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 border border-purple-100 dark:border-purple-900/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
              <Award className="h-6 w-6 text-purple-700 dark:text-purple-300" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-muted-foreground">Extra Activities</div>
              <div className="font-bold text-xl text-purple-700 dark:text-purple-300">{extracurricularCount}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4 text-center">Achievements by Position</p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#ffffff"
                  >
                    {positionsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getPositionColor(entry.name)} 
                        style={{ filter: 'drop-shadow(0px 0px 3px rgba(0,0,0,0.2))' }} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} events`, 'Count']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.1)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {positionsData.map((position, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="flex items-center gap-1 border px-2 py-1"
                  style={{ borderColor: getPositionColor(position.name) + '40' }}
                >
                  {getPositionIcon(position.name)}
                  <span style={{ color: getPositionColor(position.name) }}>{position.name}</span>
                  <span className="ml-1 px-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                    {position.value}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-4 text-center">Events by Type</p>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 h-[250px] overflow-y-auto space-y-2">
              {eventTypesData.map((event, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex items-center">
                    <div 
                      className="h-8 w-8 rounded-md flex items-center justify-center" 
                      style={{ backgroundColor: `hsl(${index * 25}, 70%, 60%)` }}
                    >
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <span className="ml-3 font-medium">{event.name}</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 text-sm">
                    {event.value} events
                  </div>
                </div>
              ))}
              
              {eventTypesData.length === 0 && (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No event types available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
