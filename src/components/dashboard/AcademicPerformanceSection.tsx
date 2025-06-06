import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
  LineChart,
  Line,
  ReferenceLine
} from "recharts";
import { DashboardCard } from "./DashboardCard";
import { useAcademicRecords, AcademicRecord, calculateTrend, getLatestExamGrade } from "@/lib/dashboard-service";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronRight, BarChart2, TrendingUp, TrendingDown, Minus, FileText, LineChart as LineChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const AcademicPerformanceSection = () => {
  const { currentUser } = useAuth();
  const { data: academicRecords, loading } = useAcademicRecords(currentUser?.uid);
  
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  
  const filters = useMemo(() => {
    const grades = new Set<string>();
    const terms = new Set<string>();
    const subjects = new Set<string>();
    const years = new Set<string>();
    
    academicRecords.forEach(record => {
      if (record.class) grades.add(record.class);
      if (record.term) terms.add(record.term);
      if (record.subject) subjects.add(record.subject);
      if (record.year) years.add(record.year);
    });
    
    return {
      grades: Array.from(grades).sort(),
      terms: Array.from(terms).sort(),
      subjects: Array.from(subjects).sort(),
      years: Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)),
    };
  }, [academicRecords]);
  
  const filteredRecords = useMemo(() => {
    return academicRecords.filter(record => {
      const gradeMatch = selectedGrade === "all" || record.class === selectedGrade;
      const termMatch = selectedTerm === "all" || record.term === selectedTerm;
      const subjectMatch = selectedSubject === "all" || record.subject === selectedSubject;
      const yearMatch = selectedYear === "all" || record.year === selectedYear;
      return gradeMatch && termMatch && subjectMatch && yearMatch;
    });
  }, [academicRecords, selectedGrade, selectedTerm, selectedSubject, selectedYear]);
  
  const chartData = useMemo(() => {
    try {
      const subjectData: Record<string, { marks: number, totalMarks: number, count: number }> = {};
      
      filteredRecords.forEach(record => {
        if (!record.subject) return;
        
        const subject = record.subject.toLowerCase();
        if (!subjectData[subject]) {
          subjectData[subject] = { marks: 0, totalMarks: 0, count: 0 };
        }
        
        if (record.isPercentage) {
          subjectData[subject].marks += record.score * 100;
          subjectData[subject].totalMarks += 100;
        } else {
          subjectData[subject].marks += record.score;
          subjectData[subject].totalMarks += record.maxScore;
        }
        
        subjectData[subject].count += 1;
      });
      
      return Object.entries(subjectData).map(([subject, data]) => {
        const percentage = data.totalMarks > 0 ? (data.marks / data.totalMarks) * 100 : 0;
        return {
          subject: subject.charAt(0).toUpperCase() + subject.slice(1),
          percentage: Math.round(percentage),
          average: Math.round(percentage),
          count: data.count
        };
      }).sort((a, b) => a.subject.localeCompare(b.subject));
    } catch (error) {
      console.error("Error processing chart data:", error);
      return [];
    }
  }, [filteredRecords]);
  
  const termComparisonData = useMemo(() => {
    try {
      if (selectedSubject === "all") {
        return [];
      }
      
      interface TermRecord {
        term: string;
        percentage: number;
        year: string;
        count: number;
      }
      
      const termData = new Map<string, TermRecord>();
      
      academicRecords.forEach(record => {
        if (record.subject?.toLowerCase() !== selectedSubject.toLowerCase() && selectedSubject !== "all") {
          return;
        }
        
        if (!record.term || !record.year) {
          return;
        }
        
        const termKey = `${record.term}-${record.year}`;
        
        let calculatedPercentage = 0;
        if (record.isPercentage) {
          calculatedPercentage = record.score;
        } else {
          calculatedPercentage = (record.score / record.maxScore) * 100;
        }
        
        if (!termData.has(termKey)) {
          termData.set(termKey, { 
            term: record.term, 
            year: record.year,
            percentage: calculatedPercentage, 
            count: 1 
          });
        } else {
          const existing = termData.get(termKey)!;
          existing.percentage += calculatedPercentage;
          existing.count += 1;
        }
      });
      
      const result: any[] = [];
      termData.forEach((value, key) => {
        result.push({
          key,
          term: value.term,
          year: value.year,
          label: `${value.term} (${value.year})`,
          percentage: Math.round(value.percentage / value.count),
        });
      });
      
      return result.sort((a, b) => {
        if (a.year !== b.year) {
          return parseInt(a.year) - parseInt(b.year);
        }
        
        const termOrder: Record<string, number> = {
          "1st Term": 1,
          "2nd Term": 2,
          "3rd Term": 3,
          "4th Term": 4,
          "Semester 1": 1,
          "Semester 2": 2
        };
        
        return (termOrder[a.term] || 99) - (termOrder[b.term] || 99);
      });
    } catch (error) {
      console.error("Error processing term comparison data:", error);
      return [];
    }
  }, [academicRecords, selectedSubject]);
  
  const trend = useMemo(() => {
    try {
      if (filteredRecords.length < 2) return "Consistent";
      return calculateTrend(filteredRecords);
    } catch (error) {
      console.error("Error calculating trend:", error);
      return "Consistent";
    }
  }, [filteredRecords]);

  const { grade, subject } = useMemo(() => {
    try {
      if (filteredRecords.length === 0) return { grade: "N/A", subject: "No Data" };
      return getLatestExamGrade(filteredRecords);
    } catch (error) {
      console.error("Error getting latest exam grade:", error);
      return { grade: "N/A", subject: "No Data" };
    }
  }, [filteredRecords]);

  const classDistribution = useMemo(() => {
    const classes: Record<string, number> = {};
    filteredRecords.forEach(record => {
      const className = record.class || "Not Specified";
      classes[className] = (classes[className] || 0) + 1;
    });
    return Object.entries(classes).map(([name, count]) => ({
      name,
      value: count
    }));
  }, [filteredRecords]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  const getAvgScore = () => {
    if (!filteredRecords.length) return 0;
    let total = 0;
    filteredRecords.forEach(record => {
      if (record.isPercentage) {
        total += record.score;
      } else {
        total += (record.score / record.maxScore) * 100;
      }
    });
    return Math.round(total / filteredRecords.length);
  };

  return (
    <DashboardCard 
      title="Academic Performance" 
      action={
        <div className="flex items-center text-sm">
          <BarChart2 className="mr-1 h-4 w-4 text-indigo-500" />
          <span className="mr-2 text-muted-foreground">Term Insights</span>
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {filteredRecords.length} Records
          </span>
        </div>
      }
      gradient
    >
      {academicRecords.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Grade/Class</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="bg-white dark:bg-gray-950">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {filters.grades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Term</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="bg-white dark:bg-gray-950">
                  <SelectValue placeholder="All Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {filters.terms.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white dark:bg-gray-950">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {filters.subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-between mb-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-white dark:bg-gray-950 h-8 w-32">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filters.years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setViewMode("chart")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === "chart"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
                }`}
              >
                <BarChart2 className="h-4 w-4 inline mr-1" />
                Chart
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
                }`}
              >
                <FileText className="h-4 w-4 inline mr-1" />
                Table
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${viewMode === "chart" ? "lg:col-span-2" : "lg:col-span-3"}`}>
              {viewMode === "chart" ? (
                <div>
                  <Tabs defaultValue="subjects">
                    <TabsList className="mb-4">
                      <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
                      <TabsTrigger value="terms">Term Comparison</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="subjects" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Subject Performance</p>
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                          <button
                            type="button"
                            onClick={() => setChartType("bar")}
                            className={`px-3 py-1 text-xs font-medium rounded-l-md ${
                              chartType === "bar"
                                ? "bg-primary text-primary-foreground"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <BarChart2 className="h-3 w-3 inline mr-1" />
                            Bar
                          </button>
                          <button
                            type="button"
                            onClick={() => setChartType("line")}
                            className={`px-3 py-1 text-xs font-medium rounded-r-md ${
                              chartType === "line"
                                ? "bg-primary text-primary-foreground"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <LineChartIcon className="h-3 w-3 inline mr-1" />
                            Line
                          </button>
                        </div>
                      </div>
                      <div className="h-[250px]">
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            {chartType === "bar" ? (
                              <BarChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis 
                                  dataKey="subject" 
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  angle={-45}
                                  textAnchor="end"
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
                                <Legend />
                                <ReferenceLine y={getAvgScore()} stroke="#ff7300" strokeDasharray="3 3" 
                                  label={{ position: 'insideTopRight', value: `Avg: ${getAvgScore()}%`, fill: '#ff7300', fontSize: 12 }} />
                                <Bar 
                                  dataKey="percentage" 
                                  name="Score %" 
                                  radius={[4, 4, 0, 0]}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            ) : (
                              <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis 
                                  dataKey="subject" 
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  angle={-45}
                                  textAnchor="end"
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
                                <Legend />
                                <ReferenceLine y={getAvgScore()} stroke="#ff7300" strokeDasharray="3 3" 
                                  label={{ position: 'insideTopRight', value: `Avg: ${getAvgScore()}%`, fill: '#ff7300', fontSize: 12 }} />
                                <Line 
                                  type="monotone"
                                  dataKey="percentage" 
                                  stroke="#8884d8" 
                                  strokeWidth={2}
                                  name="Score %"
                                  dot={{ stroke: '#8884d8', strokeWidth: 2, fill: '#fff', r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            )}
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">No subject data available for the selected filters</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="terms">
                      <p className="text-sm text-muted-foreground mb-2">Term Progress Comparison</p>
                      <div className="h-[250px]">
                        {termComparisonData.length > 1 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={termComparisonData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis 
                                dataKey="label" 
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                              />
                              <YAxis 
                                domain={[0, 100]}
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                tickFormatter={(value) => `${value}%`}
                              />
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'Score']}
                                contentStyle={{
                                  borderRadius: '8px',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone"
                                dataKey="percentage" 
                                stroke="#4f46e5" 
                                strokeWidth={2}
                                name="Term Score"
                                dot={{ stroke: '#4f46e5', strokeWidth: 2, fill: '#fff', r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : selectedSubject === "all" ? (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Please select a specific subject to view term progress</p>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Not enough data for term comparison. Add more term records.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Grade/Class</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length > 0 ? (
                        filteredRecords.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.subject}</TableCell>
                            <TableCell>{record.class || "N/A"}</TableCell>
                            <TableCell>{record.term || "N/A"}</TableCell>
                            <TableCell>
                              {record.isPercentage 
                                ? `${record.score}%` 
                                : `${record.score}/${record.maxScore} (${Math.round((record.score/record.maxScore) * 100)}%)`}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.grade?.includes('A') ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                record.grade?.includes('B') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                                record.grade?.includes('C') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                              }`}>
                                {record.grade}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No records found matching the selected filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {viewMode === "chart" && (
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
                  {classDistribution.length > 0 ? (
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
                  ) : (
                    <p className="text-muted-foreground">No class data available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-2">No academic records found</p>
          <a href="/academic-records" className="text-primary hover:underline inline-flex items-center">
            Add academic records
            <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </div>
      )}
    </DashboardCard>
  );
};
