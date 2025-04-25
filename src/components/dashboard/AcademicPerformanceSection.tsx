
import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { DashboardCard } from "./DashboardCard";
import { useAcademicRecords, AcademicRecord, calculateTrend, getLatestExamGrade } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AcademicPerformanceSection = () => {
  const { currentUser } = useAuth();
  const { data: academicRecords, loading } = useAcademicRecords(currentUser?.uid);
  
  // Process data for charts
  const termData = React.useMemo(() => {
    const terms = academicRecords.reduce((acc: Record<string, number[]>, record) => {
      if (!acc[record.term]) acc[record.term] = [];
      acc[record.term].push((record.marks / record.totalMarks) * 100);
      return acc;
    }, {});
    
    return Object.entries(terms).map(([term, marks]) => ({
      term: term.replace(/(\d+)(st|nd|rd|th) Term (\d+)/, "Term"),
      average: Math.round(marks.reduce((sum, mark) => sum + mark, 0) / marks.length),
    })).sort((a, b) => a.term.localeCompare(b.term)).slice(-3);
  }, [academicRecords]);
  
  const trend = React.useMemo(
    () => calculateTrend(academicRecords),
    [academicRecords]
  );

  const { grade, subject } = React.useMemo(
    () => getLatestExamGrade(academicRecords),
    [academicRecords]
  );

  if (loading) {
    return (
      <DashboardCard title="Academic Performance">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  const getTrendBadge = (trend: string) => {
    const colors = {
      Improving: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      Declining: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      Consistent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[trend as keyof typeof colors]}`}>
        {trend}
      </span>
    );
  };

  return (
    <DashboardCard 
      title="Academic Performance" 
      action={
        <div className="flex items-center text-sm">
          <BarChart2 className="mr-1 h-4 w-4" />
          <span className="mr-2">Term Insights</span>
          <span className="font-semibold">{academicRecords.length} Achievements</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <p className="text-sm text-muted-foreground mb-2">Term Performance</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={termData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="term" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Latest Exam Grade</p>
            <div className="flex items-center">
              <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-purple-500 text-white flex items-center justify-center text-4xl font-bold">
                {grade}
              </div>
              <div className="ml-4">
                <p className="font-medium">{subject}</p>
                <div className="mt-1">
                  {getTrendBadge(trend)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
