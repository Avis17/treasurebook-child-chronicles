import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { DashboardCard } from "./DashboardCard";
import { useAcademicRecords, AcademicRecord, calculateTrend, getLatestExamGrade } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, BarChart2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AcademicPerformanceSection = () => {
  const { currentUser } = useAuth();
  const { data: academicRecords, loading } = useAcademicRecords(currentUser?.uid);
  
  React.useEffect(() => {
    console.log("AcademicPerformanceSection: Records sample", academicRecords.slice(0, 1));
  }, [academicRecords]);
  
  const termData = React.useMemo(() => {
    const subjects: Record<string, { marks: number, totalMarks: number }[]> = {};
    
    academicRecords.forEach(record => {
      const subject = record.subject.toLowerCase();
      if (!subjects[subject]) subjects[subject] = [];
      subjects[subject].push({
        marks: record.marks,
        totalMarks: record.totalMarks
      });
    });
    
    return Object.entries(subjects).map(([subject, records]) => {
      const totalPercentage = records.reduce(
        (sum, record) => sum + (record.marks / record.totalMarks * 100), 
        0
      );
      return {
        subject: subject.charAt(0).toUpperCase() + subject.slice(1),
        average: Math.round(totalPercentage / records.length),
        count: records.length
      };
    }).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [academicRecords]);
  
  const trend = React.useMemo(
    () => calculateTrend(academicRecords),
    [academicRecords]
  );

  const { grade, subject } = React.useMemo(
    () => getLatestExamGrade(academicRecords),
    [academicRecords]
  );

  const classDistribution = React.useMemo(() => {
    const classes: Record<string, number> = {};
    academicRecords.forEach(record => {
      const className = record.class || "Not Specified";
      classes[className] = (classes[className] || 0) + 1;
    });
    return Object.entries(classes).map(([name, count]) => ({
      name,
      value: count
    }));
  }, [academicRecords]);

  if (loading) {
    return (
      <DashboardCard title="Academic Performance">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardCard>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "Declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    const colors = {
      Improving: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/70 dark:to-emerald-900/70 dark:text-green-100",
      Declining: "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900/70 dark:to-rose-900/70 dark:text-red-100",
      Consistent: "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 dark:from-blue-900/70 dark:to-sky-900/70 dark:text-blue-100",
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors[trend as keyof typeof colors]}`}>
        {getTrendIcon(trend)}
        {trend}
      </span>
    );
  };

  const getGradeColor = (grade: string) => {
    if (!grade || grade === 'N/A') return 'bg-gray-500';
    
    if (grade.includes('A')) return 'bg-gradient-to-br from-green-500 to-emerald-600';
    if (grade.includes('B')) return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    if (grade.includes('C')) return 'bg-gradient-to-br from-yellow-500 to-amber-600';
    if (grade.includes('D')) return 'bg-gradient-to-br from-orange-500 to-red-600';
    return 'bg-gradient-to-br from-red-500 to-rose-600';
  };

  return (
    <DashboardCard 
      title="Academic Performance" 
      action={
        <div className="flex items-center text-sm">
          <BarChart2 className="mr-1 h-4 w-4 text-indigo-500" />
          <span className="mr-2 text-muted-foreground">Term Insights</span>
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {academicRecords.length} Records
          </span>
        </div>
      }
      gradient
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <p className="text-sm text-muted-foreground mb-2">Subject Performance</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={termData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Average Score']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorAvg)"
                  activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Latest Exam Grade</p>
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-20 h-20 rounded-lg ${getGradeColor(grade)} text-white flex items-center justify-center text-4xl font-bold shadow-lg`}>
                {grade}
              </div>
              <div className="ml-4">
                <p className="font-medium text-lg capitalize">{subject}</p>
                <div className="mt-1">
                  {getTrendBadge(trend)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Class Distribution</p>
            <div className="flex flex-wrap gap-2">
              {classDistribution.map((item, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="px-3 py-1 border border-indigo-100 dark:border-indigo-900"
                >
                  <span className="mr-2 font-semibold">{item.name}:</span>
                  <span>{item.value} Records</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};
