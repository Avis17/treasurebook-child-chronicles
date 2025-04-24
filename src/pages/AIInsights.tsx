
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChartContainer } from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Book,
  Trophy,
  Heart,
  Target,
  ClipboardCheck,
  Calendar,
  Activity,
  Lightbulb,
  ChevronRight,
  ArrowUpRight,
  BarChart as BarChartIcon
} from "lucide-react";

// Import our data service
import { fetchInsightData, AIInsightData } from "@/services/ai-insights-service";

const cardColors = {
  academic: "from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900",
  talent: "from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900",
  physical: "from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900",
  emotional: "from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-900",
  achievement: "from-red-50 to-rose-50 dark:from-gray-800 dark:to-gray-900",
  goal: "from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900",
  feedback: "from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900"
};

const cardIconColors = {
  academic: "text-blue-500",
  talent: "text-purple-500",
  physical: "text-green-500",
  emotional: "text-yellow-500",
  achievement: "text-red-500",
  goal: "text-orange-500",
  feedback: "text-teal-500"
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7c43', '#f95d6a'];

const AIInsights = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [insightData, setInsightData] = useState<AIInsightData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        try {
          setIsLoading(true);
          const data = await fetchInsightData(user.uid);
          setInsightData(data);
        } catch (error) {
          console.error("Error fetching insight data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load insights data"
          });
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <AppLayout title="AI Growth Insights">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      </AppLayout>
    );
  }

  if (!insightData) {
    return (
      <AppLayout title="AI Growth Insights">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <h2 className="text-xl font-bold mb-4">No insight data available</h2>
          <p className="mb-6 text-muted-foreground">
            We need more data to generate insights. Please add more records to your TreasureBook.
          </p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  // Data for radar chart - using actual data
  const radarData = [
    {
      subject: 'Academics',
      A: insightData.academic.averageScore,
      fullMark: 100,
    },
    {
      subject: 'Sports',
      A: insightData.physical.topSport !== "N/A" ? 
          (insightData.physical.achievements.length > 0 ? 80 : 65) : 40,
      fullMark: 100,
    },
    {
      subject: 'Arts',
      A: insightData.talent.topActivity !== "N/A" ? 
          (insightData.talent.achievements.length > 0 ? 85 : 70) : 45,
      fullMark: 100,
    },
    {
      subject: 'Social',
      A: insightData.emotional.moodHistory.some(m => 
         ["Happy", "Excited", "Joyful"].includes(m.mood)) ? 75 : 60,
      fullMark: 100,
    },
    {
      subject: 'Goals',
      A: insightData.goals.completed > 0 ? 
          (insightData.goals.completed / (insightData.goals.completed + insightData.goals.pending.length)) * 100 : 50,
      fullMark: 100,
    },
  ];

  // Data for achievement chart
  const achievementData = Object.entries(insightData.achievements.byCategory).map(([category, count]) => ({
    name: category,
    value: count
  }));

  // Data for subject mastery chart
  const subjectData = insightData.academic.subjectScores.map(item => ({
    name: item.subject,
    score: item.score
  }));

  return (
    <AppLayout title="AI Growth Insights">
      <div className="space-y-6">
        {/* Child Snapshot Panel */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">{insightData.childSnapshot.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-blue-400/30 hover:bg-blue-400/40 text-white">
                  Age: {insightData.childSnapshot.age}
                </Badge>
                <Badge className="bg-blue-400/30 hover:bg-blue-400/40 text-white">
                  {insightData.childSnapshot.class}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-sm opacity-80 mb-1">Overall Growth</div>
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                <div className="text-2xl font-bold">{insightData.childSnapshot.growthScore}%</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-sm opacity-80 mb-2">Top Skill Area</h3>
              <div className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-300" />
                <span className="font-semibold">{insightData.childSnapshot.topSkill}</span>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="text-sm opacity-80 mb-2">Area Needing Attention</h3>
              <div className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-red-300" />
                <span className="font-semibold">{insightData.childSnapshot.weakArea}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs for dashboard sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab - AI Insight Cards */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Academic Watch Card */}
              <Card className={`bg-gradient-to-br ${cardColors.academic} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className={`flex items-center gap-2 ${cardIconColors.academic}`}>
                      <Book className="h-5 w-5" />
                      Academic Watch
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300">
                      {insightData.academic.averageScore}%
                    </Badge>
                  </div>
                  <CardDescription className="text-blue-700/80 dark:text-blue-400/80">
                    Subject performance insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insightData.academic.strongSubject !== "N/A" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {insightData.academic.strongSubject}
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-300">
                          {insightData.academic.strongGrade}
                        </Badge>
                      </div>
                    )}
                    {insightData.academic.weakSubject !== "N/A" && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {insightData.academic.weakSubject}
                          </span>
                        </div>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300">
                          {insightData.academic.weakGrade}
                        </Badge>
                      </div>
                    )}
                    {insightData.academic.strongSubject === "N/A" && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No academic records available yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Talent Spark Card */}
              <Card className={`bg-gradient-to-br ${cardColors.talent} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.talent}`}>
                    <Star className="h-5 w-5" />
                    Talent Spark
                  </CardTitle>
                  <CardDescription className="text-purple-700/80 dark:text-purple-400/80">
                    Creative skills and interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insightData.talent.topActivity !== "N/A" ? (
                      <>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {insightData.talent.topActivity}
                          </span>
                        </div>
                        {insightData.talent.achievements.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {insightData.talent.achievements[0]}
                          </p>
                        )}
                        <p className="text-xs italic text-purple-700 dark:text-purple-300 mt-2">
                          {insightData.talent.enjoyment}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No extracurricular activities recorded yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Physical Progress Card */}
              <Card className={`bg-gradient-to-br ${cardColors.physical} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.physical}`}>
                    <Trophy className="h-5 w-5" />
                    Physical Progress
                  </CardTitle>
                  <CardDescription className="text-green-700/80 dark:text-green-400/80">
                    Sports and physical activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insightData.physical.topSport !== "N/A" ? (
                      <>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {insightData.physical.topSport}
                          </span>
                        </div>
                        {insightData.physical.achievements.length > 0 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {insightData.physical.achievements[0]}
                          </p>
                        )}
                        <p className="text-xs italic text-green-700 dark:text-green-300 mt-2">
                          {insightData.physical.recommendation}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No sports activities recorded yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Emotional Trends Card */}
              <Card className={`bg-gradient-to-br ${cardColors.emotional} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.emotional}`}>
                    <Heart className="h-5 w-5" />
                    Emotional Trends
                  </CardTitle>
                  <CardDescription className="text-yellow-700/80 dark:text-yellow-400/80">
                    Mood patterns from journal entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insightData.emotional.moodHistory.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Current Mood
                            </span>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/40 dark:text-yellow-300">
                            {insightData.emotional.currentMood}
                          </Badge>
                        </div>
                        <p className="text-xs italic text-yellow-700 dark:text-yellow-300 mt-2">
                          {insightData.emotional.recommendation}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {insightData.emotional.moodHistory.slice(0, 3).map((item, index) => (
                            <Badge key={index} variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200">
                              {item.mood}: {item.count}x
                            </Badge>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No journal entries recorded yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Highlights Card */}
              <Card className={`bg-gradient-to-br ${cardColors.achievement} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.achievement}`}>
                    <Award className="h-5 w-5" />
                    Achievement Highlights
                  </CardTitle>
                  <CardDescription className="text-red-700/80 dark:text-red-400/80">
                    Recent accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insightData.achievements.recent.length > 0 ? (
                      insightData.achievements.recent.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="min-w-5 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {achievement}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No achievements recorded yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Goals Card */}
              <Card className={`bg-gradient-to-br ${cardColors.goal} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.goal}`}>
                    <Target className="h-5 w-5" />
                    Pending Goals
                  </CardTitle>
                  <CardDescription className="text-orange-700/80 dark:text-orange-400/80">
                    Goals that need attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Completed goals
                    </span>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300">
                      {insightData.goals.completed}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {insightData.goals.pending.length > 0 ? (
                      insightData.goals.pending.map((goal, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="min-w-5 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {goal}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No pending goals at the moment.
                      </p>
                    )}
                  </div>
                  {insightData.goals.recommendation && (
                    <p className="text-xs italic text-orange-700 dark:text-orange-300 mt-3">
                      {insightData.goals.recommendation}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Teacher Feedback Card */}
              <Card className={`bg-gradient-to-br ${cardColors.feedback} border-none shadow-md overflow-hidden`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.feedback}`}>
                    <ClipboardCheck className="h-5 w-5" />
                    Teacher Feedback
                  </CardTitle>
                  <CardDescription className="text-teal-700/80 dark:text-teal-400/80">
                    Insights from educators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insightData.feedback.positive.length > 0 || insightData.feedback.areasOfImprovement.length > 0 ? (
                      <>
                        {insightData.feedback.positive.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium uppercase text-teal-700 dark:text-teal-400 mb-1.5">
                              Positives
                            </h4>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {insightData.feedback.positive.map((item, index) => (
                                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {insightData.feedback.areasOfImprovement.length > 0 && (
                          <div>
                            <h4 className="text-xs font-medium uppercase text-teal-700 dark:text-teal-400 mb-1.5">
                              Areas for Focus
                            </h4>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {insightData.feedback.areasOfImprovement.map((item, index) => (
                                <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No feedback recorded yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Charts & Analytics Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subject Mastery Graph */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Subject Mastery
                  </CardTitle>
                  <CardDescription>
                    Academic performance by subject
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[300px] w-full">
                    {subjectData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}/>
                          <Bar dataKey="score" fill="#4F46E5">
                            {subjectData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No subject data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Radar Chart */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Activity className="h-5 w-5 mr-2 text-green-500" />
                    Activity Balance
                  </CardTitle>
                  <CardDescription>
                    Comparing different areas of development
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#d4d4d4" />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar 
                          name="Performance" 
                          dataKey="A" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6}
                        />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Mood Bubble Chart */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Mood Distribution
                  </CardTitle>
                  <CardDescription>
                    Frequency of different moods from journal entries
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <div className="h-[300px] w-full">
                    {insightData.emotional.moodHistory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <Pie
                            dataKey="count"
                            isAnimationActive={true}
                            data={insightData.emotional.moodHistory}
                            nameKey="mood"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {insightData.emotional.moodHistory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}/>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No mood data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Achievement Distribution */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Achievement Distribution
                  </CardTitle>
                  <CardDescription>
                    Achievements by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <div className="h-[300px] w-full">
                    {achievementData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <Pie
                            dataKey="value"
                            isAnimationActive={true}
                            data={achievementData}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {achievementData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}/>
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">No achievement data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* AI Suggestion Panel */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </CardTitle>
                <CardDescription className="text-blue-700/90 dark:text-blue-400/90">
                  Personalized recommendations based on data analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                  <p className="text-gray-800 dark:text-gray-200">
                    {insightData.childSnapshot.name} is {insightData.forecast ? 
                      `progressing well in ${insightData.childSnapshot.topSkill}.` : 
                      "showing progress in various areas."}
                  </p>
                  
                  <div className="space-y-2 mt-4">
                    {insightData.suggestions.length > 0 ? (
                      insightData.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckIcon className="h-3 w-3" />
                          </div>
                          <span className="text-sm text-gray-800 dark:text-gray-200">{suggestion}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add more data to receive personalized suggestions.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* AI Forecast Section */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-850 border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800 dark:text-purple-300">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                  Growth Forecast
                </CardTitle>
                <CardDescription className="text-purple-700/90 dark:text-purple-400/90">
                  Long-term development trajectory based on current patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200">
                    {insightData.forecast || "Add more data to generate a personalized forecast."}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                <div className="text-xs text-purple-700/80 dark:text-purple-400/80 italic">
                  This forecast is based on current patterns and may evolve as more data becomes available.
                </div>
              </CardFooter>
            </Card>
            
            {/* Action Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Recommended Action Plan
                </CardTitle>
                <CardDescription>
                  Structured steps to support growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      Short-term (Next month)
                    </h3>
                    {insightData.actionPlan.shortTerm.length > 0 ? (
                      <ul className="space-y-1 pl-4">
                        {insightData.actionPlan.shortTerm.map((item, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <ChevronRight className="h-4 w-4 text-blue-500 mr-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">
                        No short-term recommendations available.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                      Medium-term (Next 3 months)
                    </h3>
                    {insightData.actionPlan.mediumTerm.length > 0 ? (
                      <ul className="space-y-1 pl-4">
                        {insightData.actionPlan.mediumTerm.map((item, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <ChevronRight className="h-4 w-4 text-purple-500 mr-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">
                        No medium-term recommendations available.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      Long-term (Next year)
                    </h3>
                    {insightData.actionPlan.longTerm.length > 0 ? (
                      <ul className="space-y-1 pl-4">
                        {insightData.actionPlan.longTerm.map((item, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <ChevronRight className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 pl-4">
                        No long-term recommendations available.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => navigate("/goals")}>
                  Add These to Goals <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

// Helper components
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default AIInsights;
