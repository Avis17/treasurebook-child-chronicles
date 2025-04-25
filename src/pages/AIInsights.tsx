
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
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
  BarChart as BarChartIcon,
  AlertCircle,
  RefreshCw,
  Check,
  Info,
  Bookmark,
  Clock
} from "lucide-react";

// Import our data service
import { fetchInsightData, regenerateInsights, addGoalFromActionPlan, AIInsightData } from "@/services/ai-insights-service";

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
const EXTENDED_COLORS = [...COLORS, '#6929c4', '#1192e8', '#005d5d', '#9f1853', '#fa4d56', '#570408', '#198038', '#002d9c'];

const AIInsights = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightData, setInsightData] = useState<AIInsightData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [addingGoal, setAddingGoal] = useState<string | null>(null); // Track which goal is being added
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching AI insights data for user:", uid);
      const data = await fetchInsightData(uid);
      console.log("AI insights data fetched:", data);
      setInsightData(data);
    } catch (error) {
      console.error("Error fetching insight data:", error);
      setError("Failed to load insights data. Please try again later.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load insights data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setUserId(user.uid);
        fetchData(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  const handleRegenerate = async () => {
    if (!userId) return;
    
    try {
      setIsRegenerating(true);
      toast({
        title: "Regenerating insights",
        description: "This may take a moment..."
      });
      
      const data = await regenerateInsights(userId);
      setInsightData(data);
      
      toast({
        title: "Insights Updated",
        description: "AI insights have been regenerated"
      });
    } catch (error) {
      console.error("Error regenerating insights:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate insights"
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  const handleAddGoal = async (action: string, timeframe: "Short-term" | "Medium-term" | "Long-term") => {
    if (!userId || !insightData) return;
    
    try {
      setAddingGoal(action);
      
      // Map timeframe to actual time period
      const timeframeMapped = timeframe === "Short-term" ? "Short-term" : 
                            timeframe === "Medium-term" ? "Medium-term" : "Long-term";
      
      // Create a descriptive title
      const title = action.split('.')[0]; // Use first sentence as title
      
      await addGoalFromActionPlan(userId, title, action, timeframeMapped);
      
      toast({
        title: "Goal Added",
        description: `Successfully added "${title}" to your goals`,
      });
      
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add goal to your list"
      });
    } finally {
      setAddingGoal(null);
    }
  };
  
  const handleAddAllGoals = async (timeframe: "Short-term" | "Medium-term" | "Long-term") => {
    if (!userId || !insightData) return;
    
    try {
      setAddingGoal(`Adding all ${timeframe} goals`);
      
      const goals = insightData.actionPlan[timeframe.toLowerCase().replace('-', '') as 'shortTerm' | 'mediumTerm' | 'longTerm'];
      
      // Add each goal sequentially
      for (const goal of goals) {
        await addGoalFromActionPlan(userId, goal.split('.')[0], goal, timeframe);
      }
      
      toast({
        title: "Goals Added",
        description: `Successfully added ${goals.length} ${timeframe} goals`,
      });
      
    } catch (error) {
      console.error("Error adding goals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add some goals to your list"
      });
    } finally {
      setAddingGoal(null);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="AI Growth Insights">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading insights...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="AI Growth Insights">
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 max-w-3xl mx-auto my-8">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-800 dark:text-red-300 mb-2">Error Loading Insights</h2>
            <p className="text-md text-red-600 dark:text-red-400 max-w-md mb-6">{error}</p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">Return to Dashboard</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!insightData) {
    return (
      <AppLayout title="AI Growth Insights">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-3xl mx-auto">
          <div className="p-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
            <Lightbulb className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">No insight data available</h2>
            <p className="mb-6 text-lg text-blue-700/80 dark:text-blue-400/80">
              We need more data to generate insights. Please add more records to your TreasureBook.
            </p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              size="lg"
              className="px-8 py-6 text-lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Data for radar chart - using actual data
  const radarData = [
    {
      subject: 'Academics',
      value: insightData.academic.averageScore,
      fullMark: 100,
    },
    {
      subject: 'Sports',
      value: insightData.physical.topSports.length > 0 ? 
          (insightData.physical.achievements.length > 0 ? 80 : 65) : 40,
      fullMark: 100,
    },
    {
      subject: 'Arts',
      value: insightData.talent.topActivities.length > 0 ? 
          (insightData.talent.achievements.length > 0 ? 85 : 70) : 45,
      fullMark: 100,
    },
    {
      subject: 'Social',
      value: insightData.emotional.moodHistory.some(m => 
         ["Happy", "Excited", "Joyful"].includes(m.mood)) ? 75 : 60,
      fullMark: 100,
    },
    {
      subject: 'Goals',
      value: insightData.goals.completed > 0 ? 
          (insightData.goals.completed / (insightData.goals.completed + insightData.goals.pending.length)) * 100 : 50,
      fullMark: 100,
    },
  ];

  // Data for achievement chart
  const achievementData = Object.entries(insightData.achievements.byCategory).map(([category, count]) => ({
    name: category,
    value: count
  }));

  // Data for subject mastery chart - consolidated across all terms/standards
  const subjectData = insightData.academic.subjectScores.map(item => ({
    name: item.subject,
    score: item.score
  }));

  // Enhanced mood data with more meaningful categories
  const enhancedMoodData = insightData.emotional.moodHistory.map(item => {
    // Group similar moods
    let category = item.mood;
    if (["Happy", "Excited", "Joyful", "Cheerful", "Elated"].some(m => item.mood.includes(m))) {
      category = "Positive";
    } else if (["Sad", "Down", "Disappointed", "Upset"].some(m => item.mood.includes(m))) {
      category = "Negative";
    } else if (["Tired", "Stressed", "Anxious", "Worried"].some(m => item.mood.includes(m))) {
      category = "Stressed";
    } else if (["Calm", "Peaceful", "Relaxed"].some(m => item.mood.includes(m))) {
      category = "Calm";
    } else if (["Focused", "Determined", "Productive"].some(m => item.mood.includes(m))) {
      category = "Focused";
    }
    
    return {
      name: category,
      value: item.count,
      originalMood: item.mood
    };
  });
  
  // Consolidate similar categories in mood data
  const consolidatedMoodData = enhancedMoodData.reduce((acc: any[], item) => {
    const existing = acc.find(i => i.name === item.name);
    if (existing) {
      existing.value += item.value;
      existing.moods = [...(existing.moods || []), item.originalMood];
    } else {
      acc.push({...item, moods: [item.originalMood]});
    }
    return acc;
  }, []);

  return (
    <AppLayout title="AI Growth Insights">
      {isRegenerating && <LoadingOverlay isLoading={true} message="Regenerating insights..." />}
      {addingGoal && <LoadingOverlay isLoading={true} message={`Adding goal: ${addingGoal}`} opacity={0.7} />}
      
      <div className="space-y-8 max-w-7xl mx-auto pb-24 px-4 md:px-6">
        {/* Child Snapshot Panel with Regenerate Button */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold">{insightData.childSnapshot.name}</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-blue-400/30 hover:bg-blue-400/40 text-white py-1.5 px-3 text-sm">
                  Age: {insightData.childSnapshot.age}
                </Badge>
                <Badge className="bg-blue-400/30 hover:bg-blue-400/40 text-white py-1.5 px-3 text-sm">
                  {insightData.childSnapshot.class}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-sm opacity-80 mb-2">Overall Growth</div>
              <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <div className="text-3xl font-bold">{insightData.childSnapshot.growthScore}%</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white/10 p-5 rounded-lg shadow-inner">
              <h3 className="text-sm opacity-80 mb-3">Top Skill Areas</h3>
              <div className="space-y-2">
                {insightData.childSnapshot.topSkills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <Star className="h-5 w-5 mr-3 text-yellow-300" />
                    <span className="font-semibold text-lg">{skill}</span>
                  </div>
                ))}
                {insightData.childSnapshot.topSkills.length === 0 && (
                  <div className="text-sm">No top skills identified yet</div>
                )}
              </div>
            </div>
            
            <div className="bg-white/10 p-5 rounded-lg shadow-inner">
              <h3 className="text-sm opacity-80 mb-3">Areas Needing Attention</h3>
              <div className="space-y-2">
                {insightData.childSnapshot.weakAreas.map((area, index) => (
                  <div key={index} className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-3 text-red-300" />
                    <span className="font-semibold text-lg">{area}</span>
                  </div>
                ))}
                {insightData.childSnapshot.weakAreas.length === 0 && (
                  <div className="text-sm">No weak areas identified</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 text-white border-white/25"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Insights
            </Button>
          </div>
        </div>
        
        {/* Tabs for dashboard sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="py-3">Overview</TabsTrigger>
            <TabsTrigger value="charts" className="py-3">Charts & Analytics</TabsTrigger>
            <TabsTrigger value="recommendations" className="py-3">AI Recommendations</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab - AI Insight Cards */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Academic Watch Card */}
              <Card className={`bg-gradient-to-br ${cardColors.academic} border-none shadow-lg overflow-hidden h-full`}>
                <CardHeader className="pb-3">
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
                  <div className="space-y-4">
                    {insightData.academic.strongSubjects.length > 0 ? (
                      <>
                        <div>
                          <h4 className="text-xs font-medium uppercase text-blue-700 dark:text-blue-400 mb-2">
                            Strong Subjects
                          </h4>
                          {insightData.academic.strongSubjects.map((subject, index) => (
                            <div key={index} className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {subject}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No strong subjects identified yet.
                      </p>
                    )}
                    
                    {insightData.academic.weakSubjects.length > 0 ? (
                      <>
                        <div>
                          <h4 className="text-xs font-medium uppercase text-blue-700 dark:text-blue-400 mb-2">
                            Subjects Needing Attention
                          </h4>
                          {insightData.academic.weakSubjects.map((subject, index) => (
                            <div key={index} className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {subject}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No weak subjects identified.
                      </p>
                    )}
                    
                    <p className="text-xs italic text-blue-700 dark:text-blue-300 mt-2">
                      {insightData.academic.strongSubjects.length > 0 
                        ? `Continue developing strengths in ${insightData.academic.strongSubjects[0]}.` 
                        : "Add more academic records to get personalized insights."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Talent Spark Card */}
              <Card className={`bg-gradient-to-br ${cardColors.talent} border-none shadow-lg overflow-hidden h-full`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.talent}`}>
                    <Star className="h-5 w-5" />
                    Talent Spark
                  </CardTitle>
                  <CardDescription className="text-purple-700/80 dark:text-purple-400/80">
                    Creative skills and interests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightData.talent.topActivities.length > 0 ? (
                      <>
                        <h4 className="text-xs font-medium uppercase text-purple-700 dark:text-purple-400 mb-2">
                          Top Activities
                        </h4>
                        {insightData.talent.topActivities.map((activity, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <Award className="h-4 w-4 mr-2 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {activity}
                            </span>
                          </div>
                        ))}
                        
                        {insightData.talent.achievements.length > 0 && (
                          <>
                            <h4 className="text-xs font-medium uppercase text-purple-700 dark:text-purple-400 mb-2 mt-3">
                              Recent Achievements
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {insightData.talent.achievements[0]}
                            </p>
                          </>
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
              <Card className={`bg-gradient-to-br ${cardColors.physical} border-none shadow-lg overflow-hidden h-full`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.physical}`}>
                    <Trophy className="h-5 w-5" />
                    Physical Progress
                  </CardTitle>
                  <CardDescription className="text-green-700/80 dark:text-green-400/80">
                    Sports and physical activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insightData.physical.topSports.length > 0 ? (
                      <>
                        <h4 className="text-xs font-medium uppercase text-green-700 dark:text-green-400 mb-2">
                          Top Sports
                        </h4>
                        {insightData.physical.topSports.map((sport, index) => (
                          <div key={index} className="flex items-center mb-2">
                            <Award className="h-4 w-4 mr-2 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {sport}
                            </span>
                          </div>
                        ))}
                        
                        {insightData.physical.achievements.length > 0 && (
                          <>
                            <h4 className="text-xs font-medium uppercase text-green-700 dark:text-green-400 mb-2 mt-3">
                              Recent Achievements
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {insightData.physical.achievements[0]}
                            </p>
                          </>
                        )}
                        
                        <p className="text-xs italic text-green-700 dark:text-green-300 mt-2">
                          {insightData.physical.recommendations.length > 0
                            ? insightData.physical.recommendations[0]
                            : "Add more sports records to get personalized recommendations."}
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
              <Card className={`bg-gradient-to-br ${cardColors.emotional} border-none shadow-lg overflow-hidden h-full`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.emotional}`}>
                    <Heart className="h-5 w-5" />
                    Emotional Trends
                  </CardTitle>
                  <CardDescription className="text-yellow-700/80 dark:text-yellow-400/80">
                    Mood patterns from journal entries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                        <div className="flex flex-wrap gap-2 mt-3">
                          {consolidatedMoodData.slice(0, 3).map((item, index) => (
                            <Badge key={index} variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200">
                              {item.name}: {item.value}x
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
              <Card className={`bg-gradient-to-br ${cardColors.achievement} border-none shadow-lg overflow-hidden h-full`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.achievement}`}>
                    <Award className="h-5 w-5" />
                    Achievement Highlights
                  </CardTitle>
                  <CardDescription className="text-red-700/80 dark:text-red-400/80">
                    Recent accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insightData.achievements.recent.length > 0 ? (
                      insightData.achievements.recent.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="min-w-5 mt-1">
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
              <Card className={`bg-gradient-to-br ${cardColors.goal} border-none shadow-lg overflow-hidden h-full`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 ${cardIconColors.goal}`}>
                    <Target className="h-5 w-5" />
                    Pending Goals
                  </CardTitle>
                  <CardDescription className="text-orange-700/80 dark:text-orange-400/80">
                    Goals that need attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Completed goals
                    </span>
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-300">
                      {insightData.goals.completed}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {insightData.goals.pending.length > 0 ? (
                      insightData.goals.pending.map((goal, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="min-w-5 mt-1">
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
                    <p className="text-xs italic text-orange-700 dark:text-orange-300 mt-4">
                      {insightData.goals.recommendation}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Teacher Feedback Card - Full Width */}
            <Card className={`bg-gradient-to-br ${cardColors.feedback} border-none shadow-lg overflow-hidden`}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 ${cardIconColors.feedback}`}>
                  <ClipboardCheck className="h-5 w-5" />
                  Teacher Feedback
                </CardTitle>
                <CardDescription className="text-teal-700/80 dark:text-teal-400/80">
                  Insights from educators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {insightData.feedback.positive.length > 0 || insightData.feedback.areasOfImprovement.length > 0 ? (
                    <>
                      {insightData.feedback.positive.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium uppercase text-teal-700 dark:text-teal-400 mb-3">
                            Positives
                          </h4>
                          <ul className="list-disc pl-5 space-y-2">
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
                          <h4 className="text-xs font-medium uppercase text-teal-700 dark:text-teal-400 mb-3">
                            Areas for Focus
                          </h4>
                          <ul className="list-disc pl-5 space-y-2">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 col-span-2 text-center py-6">
                      No feedback recorded yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Charts & Analytics Tab */}
          <TabsContent value="charts" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Subject Mastery Graph - Consolidated across all terms */}
              <Card className="overflow-hidden shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChartIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Subject Mastery
                  </CardTitle>
                  <CardDescription>
                    Average performance by subject across all terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[350px] w-full">
                    {subjectData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={subjectData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#d4d4d4" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}/>
                          <Bar dataKey="score" fill="#4F46E5">
                            {subjectData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]} />
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
              <Card className="overflow-hidden shadow-lg">
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
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#d4d4d4" />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} />
                        <Radar 
                          name="Performance" 
                          dataKey="value" 
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
              
              {/* Enhanced Mood Distribution Chart */}
              <Card className="overflow-hidden shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Heart className="h-5 w-5 mr-2 text-red-500" />
                    Mood Distribution
                  </CardTitle>
                  <CardDescription>
                    Emotional patterns from journal entries
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <div className="h-[350px] w-full">
                    {consolidatedMoodData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                          <Pie
                            dataKey="value"
                            isAnimationActive={true}
                            data={consolidatedMoodData}
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {consolidatedMoodData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
                            formatter={(value, name, props) => {
                              const moods = props.payload.moods;
                              return [
                                `${value} entries (${moods.join(', ')})`,
                                name
                              ];
                            }}
                          />
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
              
              {/* Enhanced Achievement Distribution */}
              <Card className="overflow-hidden shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Award className="h-5 w-5 mr-2 text-yellow-500" />
                    Achievement Distribution
                  </CardTitle>
                  <CardDescription>
                    Accomplishments by category
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                  <div className="h-[350px] w-full">
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
                              <Cell key={`cell-${index}`} fill={EXTENDED_COLORS[index % EXTENDED_COLORS.length]} />
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
          <TabsContent value="recommendations" className="space-y-8">
            {/* AI Suggestion Panel */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-850 border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  AI Suggestions
                </CardTitle>
                <CardDescription className="text-blue-700/90 dark:text-blue-400/90">
                  Personalized recommendations based on comprehensive data analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
                  <p className="text-gray-800 dark:text-gray-200 text-lg mb-5">
                    {insightData.forecast}
                  </p>
                  
                  <div className="space-y-6">
                    {/* Academic Suggestions */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        Academic Focus
                      </h3>
                      <div className="space-y-2 pl-6">
                        {insightData.suggestions
                          .filter(s => s.toLowerCase().includes('subject') || 
                                      s.toLowerCase().includes('study') || 
                                      s.toLowerCase().includes('academic'))
                          .map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-base text-gray-800 dark:text-gray-200">{suggestion}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Sports Suggestions */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Sports Development
                      </h3>
                      <div className="space-y-2 pl-6">
                        {insightData.suggestions
                          .filter(s => s.toLowerCase().includes('sport') || 
                                      s.toLowerCase().includes('physical') || 
                                      s.toLowerCase().includes('team'))
                          .map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-base text-gray-800 dark:text-gray-200">{suggestion}</span>
                            </div>
                          ))}
                          {insightData.physical.recommendations.slice(0, 2).map((recommendation, index) => (
                            <div key={`sports-${index}`} className="flex items-center gap-3">
                              <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-base text-gray-800 dark:text-gray-200">{recommendation}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Extracurricular Suggestions */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-purple-700 dark:text-purple-400 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Extracurricular Activities
                      </h3>
                      <div className="space-y-2 pl-6">
                        {insightData.suggestions
                          .filter(s => s.toLowerCase().includes('extracurricular') || 
                                      s.toLowerCase().includes('activit') || 
                                      s.toLowerCase().includes('talent') ||
                                      s.toLowerCase().includes('art') ||
                                      s.toLowerCase().includes('music'))
                          .map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-base text-gray-800 dark:text-gray-200">{suggestion}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Journal and Emotional Suggestions */}
                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Emotional Well-being
                      </h3>
                      <div className="space-y-2 pl-6">
                        {insightData.suggestions
                          .filter(s => s.toLowerCase().includes('journal') || 
                                      s.toLowerCase().includes('emotion') ||
                                      s.toLowerCase().includes('reflect'))
                          .map((suggestion, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-base text-gray-800 dark:text-gray-200">{suggestion}</span>
                            </div>
                          ))}
                        <div className="flex items-center gap-3">
                          <div className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="text-base text-gray-800 dark:text-gray-200">
                            {insightData.emotional.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
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
                  Long-term development trajectory based on comprehensive analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white/70 dark:bg-gray-900/50 p-6 rounded-lg shadow-inner">
                  <p className="text-gray-800 dark:text-gray-200 text-lg">
                    {insightData.forecast || "Add more data to generate a personalized forecast."}
                  </p>
                  
                  <div className="mt-6 space-y-5">
                    {insightData.childSnapshot.topSkills.length > 0 && (
                      <div className="flex items-start gap-3 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <Star className="h-5 w-5 text-purple-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-300">
                            Talent Development
                          </h4>
                          <p className="text-sm text-purple-700/80 dark:text-purple-400/80 mt-1">
                            With continued focus on {insightData.childSnapshot.topSkills.slice(0, 2).join(' and ')}, 
                            {insightData.childSnapshot.name} has potential to excel in these areas 
                            through consistent practice and guidance.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {insightData.childSnapshot.weakAreas.length > 0 && (
                      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <Activity className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-300">
                            Areas for Growth
                          </h4>
                          <p className="text-sm text-blue-700/80 dark:text-blue-400/80 mt-1">
                            By addressing {insightData.childSnapshot.weakAreas.slice(0, 2).join(' and ')},
                            significant improvements can be achieved within the next academic term with
                            targeted support and practice.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <Trophy className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-300">
                          Progress Outlook
                        </h4>
                        <p className="text-sm text-green-700/80 dark:text-green-400/80 mt-1">
                          By maintaining balanced development across academic, physical, and creative areas,
                          {insightData.childSnapshot.name} is on track to develop a well-rounded profile that
                          will support future educational and personal goals.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-6">
                <div className="text-xs text-purple-700/80 dark:text-purple-400/80 italic">
                  This forecast is based on current patterns and will evolve as more data becomes available.
                </div>
              </CardFooter>
            </Card>
            
            {/* Action Plan */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Recommended Action Plan
                </CardTitle>
                <CardDescription>
                  Structured steps to support growth and development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mr-2"></div>
                        Short-term (Next month)
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleAddAllGoals("Short-term")}
                      >
                        <Bookmark className="h-3.5 w-3.5 mr-1" />
                        Add All
                      </Button>
                    </div>
                    {insightData.actionPlan.shortTerm.length > 0 ? (
                      <ul className="space-y-3 pl-6 mt-4">
                        {insightData.actionPlan.shortTerm.map((item, index) => (
                          <li key={index} className="text-sm flex items-start group">
                            <ChevronRight className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 flex items-center justify-between">
                              <span>{item}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddGoal(item, "Short-term")}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="sr-only">Add to goals</span>
                              </Button>
                            </div>
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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-purple-500 mr-2"></div>
                        Medium-term (Next 3 months)
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleAddAllGoals("Medium-term")}
                      >
                        <Bookmark className="h-3.5 w-3.5 mr-1" />
                        Add All
                      </Button>
                    </div>
                    {insightData.actionPlan.mediumTerm.length > 0 ? (
                      <ul className="space-y-3 pl-6 mt-4">
                        {insightData.actionPlan.mediumTerm.map((item, index) => (
                          <li key={index} className="text-sm flex items-start group">
                            <ChevronRight className="h-4 w-4 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 flex items-center justify-between">
                              <span>{item}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddGoal(item, "Medium-term")}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="sr-only">Add to goals</span>
                              </Button>
                            </div>
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
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-medium flex items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>
                        Long-term (Next year)
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => handleAddAllGoals("Long-term")}
                      >
                        <Bookmark className="h-3.5 w-3.5 mr-1" />
                        Add All
                      </Button>
                    </div>
                    {insightData.actionPlan.longTerm.length > 0 ? (
                      <ul className="space-y-3 pl-6 mt-4">
                        {insightData.actionPlan.longTerm.map((item, index) => (
                          <li key={index} className="text-sm flex items-start group">
                            <ChevronRight className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 flex items-center justify-between">
                              <span>{item}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddGoal(item, "Long-term")}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span className="sr-only">Add to goals</span>
                              </Button>
                            </div>
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
            </Card>
            
            {/* Additional AI Insights */}
            <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-850 border-none shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center text-indigo-800 dark:text-indigo-300">
                  <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                  Key AI Insights
                </CardTitle>
                <CardDescription className="text-indigo-700/90 dark:text-indigo-400/90">
                  Intelligence-driven observations about development patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/70 dark:bg-gray-900/50 p-5 rounded-lg shadow-inner space-y-4">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <Info className="h-5 w-5" />
                      <h3 className="font-medium">Learning Style</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {insightData.academic.averageScore > 75 
                        ? "Demonstrates strong academic abilities that indicate an analytical learning style. "
                        : "Shows varied academic performance that may benefit from a multi-modal learning approach. "}
                      {insightData.talent.topActivities.length > 0
                        ? `Creative interests in ${insightData.talent.topActivities[0]} suggest visual/kinesthetic learning preferences. `
                        : ""}
                      Consider incorporating diverse teaching methods to maximize engagement and retention.
                    </p>
                    
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pt-2">
                      <Clock className="h-5 w-5" />
                      <h3 className="font-medium">Development Pace</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {insightData.achievements.recent.length > 3 
                        ? "Shows rapid progress across multiple areas, indicating accelerated development. "
                        : "Demonstrates steady development that benefits from consistent support and encouragement. "}
                      {insightData.goals.completed > 3
                        ? "High goal completion rate shows strong ability to follow through on commitments. "
                        : ""}
                      Continue setting appropriate challenges to maintain motivation and growth.
                    </p>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-gray-900/50 p-5 rounded-lg shadow-inner space-y-4">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                      <Target className="h-5 w-5" />
                      <h3 className="font-medium">Unique Strengths</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {insightData.childSnapshot.topSkills.length > 0
                        ? `Shows particular aptitude in ${insightData.childSnapshot.topSkills.join(', ')}. `
                        : "Has potential to develop excellence in areas of interest with focused practice. "}
                      {insightData.academic.strongSubjects.length > 0 && insightData.physical.topSports.length > 0
                        ? "Demonstrates balance between academic and physical pursuits, which is excellent for overall development. "
                        : ""}
                      These strengths can be leveraged as anchors for building confidence and exploring related fields.
                    </p>
                    
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 pt-2">
                      <Activity className="h-5 w-5" />
                      <h3 className="font-medium">Growth Trajectory</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {insightData.childSnapshot.growthScore > 75 
                        ? "Currently on an excellent development path with strong indicators across multiple domains. "
                        : insightData.childSnapshot.growthScore > 50 
                          ? "Shows good progress with potential for acceleration with targeted support. "
                          : "Demonstrates potential that can be further developed with structured guidance. "}
                      {insightData.childSnapshot.weakAreas.length > 0
                        ? `Focusing on strengthening ${insightData.childSnapshot.weakAreas.join(', ')} will create a more balanced profile. `
                        : ""}
                      Regular tracking and adjustment of goals will help maintain optimal development pace.
                    </p>
                  </div>
                </div>
              </CardContent>
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
