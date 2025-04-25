
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useSportsRecords, useExtracurricularRecords } from "@/lib/dashboard-service";
import { Award, Trophy } from "lucide-react";

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

  // Color mapping for positions
  const POSITION_COLORS = {
    Gold: "#f59e0b",
    Silver: "#94a3b8",
    Bronze: "#d97706",
    Finalist: "#10b981",
    Other: "#6366f1",
  };

  // Get color for a position
  const getPositionColor = (position: string) => {
    return POSITION_COLORS[position as keyof typeof POSITION_COLORS] || POSITION_COLORS.Other;
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

  return (
    <DashboardCard title="Sports & Extracurriculars">
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:justify-start">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Trophy className="h-5 w-5 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-muted-foreground">Sports</div>
              <div className="font-semibold">{sportsCount} Events</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <Award className="h-5 w-5 text-red-700 dark:text-red-300" />
            </div>
            <div className="ml-3">
              <div className="text-sm text-muted-foreground">Activities</div>
              <div className="font-semibold">{extracurricularCount} Events</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4 text-center">Positions</p>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={1}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {positionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPositionColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
              {Object.entries(POSITION_COLORS).map(([position, color]) => (
                <div key={position} className="flex items-center">
                  <div className="h-3 w-3 rounded-full mr-1" style={{ backgroundColor: color }}></div>
                  <span className="text-xs">{position}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-4">Subject Performance</p>
            <div className="h-[180px] relative">
              {/* This is a placeholder for the radar chart - we'll use simpler visualization for now */}
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                {/* This is where a radar chart would be, but we'll implement a basic version for now */}
                <div className="w-full h-full rounded-full border border-dashed border-primary/50 flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">
                    Performance data visualization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
