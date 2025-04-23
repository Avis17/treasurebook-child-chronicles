
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import AcademicChart from "@/components/dashboard/AcademicChart";
import SportsChart from "@/components/dashboard/SportsChart";
import ExtracurricularChart from "@/components/dashboard/ExtracurricularChart";
import MarksSummaryCard from "@/components/dashboard/MarksSummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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
import { CalendarDays, Trophy, Medal, Clock, TrendingUp, Book, Info, Star } from "lucide-react";

interface DashboardStats {
  academics: {
    grade: string;
    lastAssessment: string;
    recentScores: {subject: string, score: number, maxScore: number, isPercentage: boolean}[];
    topSubjects: string[];
    improvementAreas: string[];
    averageGrade: string;
  };
  sports: {
    events: number;
    recent: string;
    upcoming: string;
    achievements: {name: string, place: string}[];
  };
  talents: {
    count: number;
    latest: string;
    categories: string[];
    topSkill: string;
  };
  gallery: {
    count: number;
    lastUpdate: string;
  };
  activity: {
    recent: {type: string, name: string, date: string}[];
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("academics");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    academics: { 
      grade: "Loading...", 
      lastAssessment: "Loading...",
      recentScores: [],
      topSubjects: [],
      improvementAreas: [],
      averageGrade: ""
    },
    sports: { 
      events: 0, 
      recent: "Loading...",
      upcoming: "None",
      achievements: []
    },
    talents: { 
      count: 0, 
      latest: "Loading...",
      categories: [],
      topSkill: ""
    },
    gallery: { 
      count: 0, 
      lastUpdate: "Loading..." 
    },
    activity: {
      recent: []
    }
  });
  const { toast } = useToast();
  
  // Progress value for completed profile
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        try {
          setIsLoading(true);
          await fetchDashboardData(user.uid);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load dashboard data"
          });
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch Academic Records
      const academicQuery = query(
        collection(db, "academicRecords"),
        where("userId", "==", userId)
      );
      const academicSnapshot = await getDocs(academicQuery);
      const academicRecords = academicSnapshot.docs.map(doc => doc.data());
      
      // Find the most recent academic record
      let bestGrade = "N/A";
      let lastAssessment = "None";
      let recentScores: {subject: string, score: number, maxScore: number, isPercentage: boolean}[] = [];
      let subjectScores: Record<string, number[]> = {};
      let averageGrade = "";
      
      if (academicRecords.length > 0) {
        // Sort manually instead of using orderBy in the query
        const sortedAcademicRecords = academicRecords.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0;
          return dateB - dateA;
        });
        
        const latestRecord = sortedAcademicRecords[0];
        bestGrade = latestRecord.grade || "N/A";
        lastAssessment = latestRecord.subject || "None";
        
        // Get recent scores (last 5)
        recentScores = sortedAcademicRecords.slice(0, 5).map(record => ({
          subject: record.subject,
          score: record.score,
          maxScore: record.maxScore || 100,
          isPercentage: record.isPercentage
        }));
        
        // Calculate average grades per subject
        academicRecords.forEach(record => {
          if (!subjectScores[record.subject]) {
            subjectScores[record.subject] = [];
          }
          
          // Convert all scores to percentage for comparison
          const scoreAsPercentage = record.isPercentage 
            ? record.score 
            : (record.score / record.maxScore) * 100;
            
          subjectScores[record.subject].push(scoreAsPercentage);
        });
        
        // Calculate overall average grade
        let totalScore = 0;
        let count = 0;
        
        Object.values(subjectScores).forEach(scores => {
          scores.forEach(score => {
            totalScore += score;
            count++;
          });
        });
        
        if (count > 0) {
          const avg = totalScore / count;
          if (avg >= 90) averageGrade = "A";
          else if (avg >= 80) averageGrade = "B";
          else if (avg >= 70) averageGrade = "C";
          else if (avg >= 60) averageGrade = "D";
          else averageGrade = "F";
        }
      }
      
      // Calculate top subjects and improvement areas
      let topSubjects: string[] = [];
      let improvementAreas: string[] = [];
      
      // Convert subjectScores to average scores
      const subjectAverages = Object.entries(subjectScores).map(([subject, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return { subject, average: avg };
      });
      
      // Sort by average score
      subjectAverages.sort((a, b) => b.average - a.average);
      
      // Top 3 subjects
      topSubjects = subjectAverages.slice(0, 3).map(s => s.subject);
      
      // Bottom 3 subjects (needing improvement)
      improvementAreas = subjectAverages.slice(-3).map(s => s.subject).reverse();
  
      // Fetch Sports Records
      const sportsQuery = query(
        collection(db, "sportsRecords"),
        where("userId", "==", userId)
      );
      const sportsSnapshot = await getDocs(sportsQuery);
      const sportsRecords = sportsSnapshot.docs.map(doc => doc.data());
      
      let recentSport = "None";
      let upcomingSport = "None";
      let achievements: {name: string, place: string}[] = [];
      
      if (sportsRecords.length > 0) {
        // Sort manually
        const sortedSportsRecords = sportsRecords.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0;
          return dateB - dateA;
        });
        
        recentSport = sortedSportsRecords[0].eventName || "None";
        
        // Get achievements (if available)
        achievements = sortedSportsRecords
          .filter(record => record.achievement && record.ranking)
          .map(record => ({
            name: record.eventName,
            place: record.ranking
          }));
        
        // Get upcoming event (mock data as we don't have actual future events)
        upcomingSport = "School Athletics Competition";
      }
  
      // Fetch Extracurricular Records
      const extraCurricularQuery = query(
        collection(db, "extraCurricularRecords"),
        where("userId", "==", userId)
      );
      const extraCurricularSnapshot = await getDocs(extraCurricularQuery);
      const extraCurricularRecords = extraCurricularSnapshot.docs.map(doc => doc.data());
      
      let latestTalent = "None";
      let categories: string[] = [];
      let topSkill = "";
      
      if (extraCurricularRecords.length > 0) {
        // Sort manually
        const sortedExtraCurricularRecords = extraCurricularRecords.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0;
          return dateB - dateA;
        });
        
        latestTalent = `${sortedExtraCurricularRecords[0].activity || "Unknown"} - ${sortedExtraCurricularRecords[0].level || "Beginner"}`;
        
        // Get unique categories
        const uniqueCategories = new Set();
        extraCurricularRecords.forEach(record => {
          if (record.category) {
            uniqueCategories.add(record.category);
          }
        });
        categories = Array.from(uniqueCategories) as string[];
        
        // Find top skill (highest level activity)
        const skillLevels: Record<string, number> = {
          "Beginner": 1,
          "Intermediate": 2,
          "Advanced": 3,
          "Expert": 4
        };
        
        let highestLevelRecord = sortedExtraCurricularRecords[0];
        
        sortedExtraCurricularRecords.forEach(record => {
          const currentLevel = skillLevels[record.level] || 0;
          const highestLevel = skillLevels[highestLevelRecord.level] || 0;
          
          if (currentLevel > highestLevel) {
            highestLevelRecord = record;
          }
        });
        
        topSkill = `${highestLevelRecord.activity} (${highestLevelRecord.level})`;
      }
  
      // Fetch Gallery Images Count
      const galleryQuery = query(
        collection(db, "gallery"),
        where("userId", "==", userId)
      );
      const gallerySnapshot = await getDocs(galleryQuery);
      const galleryCount = gallerySnapshot.size;
      
      let lastUpdate = "Never";
      if (galleryCount > 0) {
        // Create a sorted array of gallery items
        const galleryItems = gallerySnapshot.docs.map(doc => doc.data());
        const sortedGallery = galleryItems.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt.toDate()).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt.toDate()).getTime() : 0;
          return dateB - dateA;
        });
        
        if (sortedGallery[0].createdAt) {
          const uploadDate = new Date(sortedGallery[0].createdAt.toDate());
          const now = new Date();
          const diffDays = Math.round((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 0) {
            lastUpdate = "Today";
          } else if (diffDays === 1) {
            lastUpdate = "Yesterday";
          } else {
            lastUpdate = `${diffDays} days ago`;
          }
        }
      }
      
      // Combine all recent activities for the activity feed
      let allActivities: {type: string, name: string, date: string, timestamp: number}[] = [];
      
      // Add academic activities
      academicRecords.slice(0, 5).forEach(record => {
        if (record.createdAt) {
          const date = new Date(record.createdAt.toDate());
          allActivities.push({
            type: "academic",
            name: `${record.subject} (${record.examType})`,
            date: date.toLocaleDateString(),
            timestamp: date.getTime()
          });
        }
      });
      
      // Add sports activities
      sportsRecords.slice(0, 5).forEach(record => {
        if (record.createdAt) {
          const date = new Date(record.createdAt.toDate());
          allActivities.push({
            type: "sports",
            name: record.eventName,
            date: date.toLocaleDateString(),
            timestamp: date.getTime()
          });
        }
      });
      
      // Add extracurricular activities
      extraCurricularRecords.slice(0, 5).forEach(record => {
        if (record.createdAt) {
          const date = new Date(record.createdAt.toDate());
          allActivities.push({
            type: "extracurricular",
            name: record.activity,
            date: date.toLocaleDateString(),
            timestamp: date.getTime()
          });
        }
      });
      
      // Sort activities by date (newest first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Get only the most recent 5
      const recentActivities = allActivities.slice(0, 5).map(({type, name, date}) => ({type, name, date}));
      
      // Calculate profile completion percentage
      const profileQuery = query(
        collection(db, "profiles"),
        where("userId", "==", userId)
      );
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const profileData = profileSnapshot.docs[0].data();
        const totalFields = 10; // Estimate total fields that make a complete profile
        let filledFields = 0;
        
        // Count filled fields for profile completion
        if (profileData.fullName) filledFields++;
        if (profileData.email) filledFields++;
        if (profileData.phone) filledFields++;
        if (profileData.address) filledFields++;
        if (profileData.dateOfBirth) filledFields++;
        if (profileData.gender) filledFields++;
        if (profileData.photoURL) filledFields++;
        if (profileData.bio) filledFields++;
        if (profileData.school) filledFields++;
        if (profileData.grade) filledFields++;
        
        setProfileCompletion(Math.round((filledFields / totalFields) * 100));
      }
  
      setDashboardStats({
        academics: {
          grade: bestGrade,
          lastAssessment,
          recentScores,
          topSubjects,
          improvementAreas,
          averageGrade
        },
        sports: {
          events: sportsRecords.length,
          recent: recentSport,
          upcoming: upcomingSport,
          achievements
        },
        talents: {
          count: extraCurricularRecords.length,
          latest: latestTalent,
          categories,
          topSkill
        },
        gallery: {
          count: galleryCount,
          lastUpdate
        },
        activity: {
          recent: recentActivities
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <ProfileHeader />
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Overview</h2>
          <SummaryCards 
            academics={dashboardStats.academics}
            sports={dashboardStats.sports}
            talents={dashboardStats.talents}
            gallery={dashboardStats.gallery}
          />
        </div>
        
        {/* Profile completion card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
                <Star className="h-5 w-5 mr-2 text-amber-500" strokeWidth={2} /> Profile Completion
              </CardTitle>
              <CardDescription className="text-blue-700/80 dark:text-blue-400/80">
                Track your progress in completing your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                    {profileCompletion}% Complete
                  </span>
                  <span className="text-blue-800/70 dark:text-blue-300/70 text-xs">
                    {profileCompletion < 100 ? 'Complete your profile' : 'Profile complete!'}
                  </span>
                </div>
                <Progress value={profileCompletion} className="h-2 bg-blue-200 dark:bg-blue-900">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-400 rounded-full"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </Progress>
                {profileCompletion < 100 && (
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    Update your profile to see all your information in one place.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full bg-white/70 dark:bg-gray-800/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-gray-800" 
                onClick={() => navigate('/profile')}
              >
                {profileCompletion < 100 ? 'Complete Profile' : 'View Profile'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Recent Activity Feed */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-amber-800 dark:text-amber-300">
                <Clock className="h-5 w-5 mr-2 text-amber-500" strokeWidth={2} /> Recent Activity
              </CardTitle>
              <CardDescription className="text-amber-700/80 dark:text-amber-400/80">
                Your latest accomplishments and entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.activity.recent.length > 0 ? (
                  dashboardStats.activity.recent.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-amber-100 dark:border-amber-900/30 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 
                        ${activity.type === 'academic' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' : 
                        activity.type === 'sports' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300' : 
                        'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300'}`}>
                        
                        {activity.type === 'academic' && <Book className="h-4 w-4" />}
                        {activity.type === 'sports' && <Trophy className="h-4 w-4" />}
                        {activity.type === 'extracurricular' && <Medal className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{activity.name}</p>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-amber-100/50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">{activity.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-amber-600 dark:text-amber-400 text-sm">
                    <Info className="h-4 w-4 mr-2" /> No recent activity recorded
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full bg-white/70 dark:bg-gray-800/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900 hover:bg-amber-50 dark:hover:bg-gray-800" 
                onClick={() => setActiveTab("academics")}
              >
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-4">
          <MarksSummaryCard />
        </div>
        
        {/* Academic performance insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Top Subjects Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-green-800 dark:text-green-300 text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" strokeWidth={2} /> Top Subjects
              </CardTitle>
              <CardDescription className="text-green-700/80 dark:text-green-400/80">
                Your best performing academic subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.academics.topSubjects.length > 0 ? (
                  dashboardStats.academics.topSubjects.map((subject, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-green-200 dark:bg-green-900 flex items-center justify-center text-green-800 dark:text-green-300 text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-green-800 dark:text-green-300">{subject}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-green-700 dark:text-green-400">
                    No subjects recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Scores Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-indigo-800 dark:text-indigo-300 text-lg">
                <CalendarDays className="h-5 w-5 mr-2 text-indigo-500" strokeWidth={2} /> Recent Scores
              </CardTitle>
              <CardDescription className="text-indigo-700/80 dark:text-indigo-400/80">
                Your latest academic assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.academics.recentScores.length > 0 ? (
                  dashboardStats.academics.recentScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-800 dark:text-indigo-300">{score.subject}</span>
                      <Badge variant={index === 0 ? "default" : "outline"} className={index === 0 ? 
                        "bg-indigo-100 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" : 
                        "bg-transparent border-indigo-200 text-indigo-800 dark:border-indigo-800 dark:text-indigo-300"}>
                        {score.isPercentage ? `${score.score}%` : `${score.score}/${score.maxScore}`}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-indigo-700 dark:text-indigo-400">
                    No scores recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Areas for Improvement Card */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-orange-800 dark:text-orange-300 text-lg">
                <Book className="h-5 w-5 mr-2 text-orange-500" strokeWidth={2} /> Focus Areas
              </CardTitle>
              <CardDescription className="text-orange-700/80 dark:text-orange-400/80">
                Subjects that need more attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.academics.improvementAreas.length > 0 ? (
                  dashboardStats.academics.improvementAreas.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-500 mr-2"></div>
                        <span className="text-sm font-medium text-orange-800 dark:text-orange-300">{subject}</span>
                      </div>
                      <Badge variant="outline" className="bg-transparent border-orange-200 text-orange-800 dark:border-orange-800 dark:text-orange-300">
                        Focus
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-orange-700 dark:text-orange-400">
                    No data available yet
                  </div>
                )}
                
                {dashboardStats.academics.improvementAreas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-orange-100 dark:border-orange-800/30">
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                      Focus on these subjects to improve your overall academic performance.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <Tabs defaultValue="academics" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="extracurricular">Extracurricular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="academics" className="mt-0">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg mb-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Academic Insights</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Your average grade is <span className="font-semibold">{dashboardStats.academics.averageGrade || "N/A"}</span>. 
                  {dashboardStats.academics.topSubjects.length > 0 && 
                    ` You excel in ${dashboardStats.academics.topSubjects[0]}.`}
                  {dashboardStats.academics.improvementAreas.length > 0 && 
                    ` Consider focusing more on ${dashboardStats.academics.improvementAreas[0]}.`}
                </p>
              </div>
              <AcademicChart />
            </TabsContent>
            
            <TabsContent value="sports" className="mt-0">
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg mb-4">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Sports Highlights</h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  You've participated in {dashboardStats.sports.events} sporting events.
                  {dashboardStats.sports.achievements.length > 0 && 
                    ` Notable achievement: ${dashboardStats.sports.achievements[0].name} (${dashboardStats.sports.achievements[0].place}).`}
                  {dashboardStats.sports.upcoming && 
                    ` Upcoming: ${dashboardStats.sports.upcoming}.`}
                </p>
              </div>
              <SportsChart />
            </TabsContent>
            
            <TabsContent value="extracurricular" className="mt-0">
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg mb-4">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Talent & Skills</h3>
                <p className="text-sm text-purple-700 dark:text-purple-400">
                  You have {dashboardStats.talents.count} recorded extracurricular activities.
                  {dashboardStats.talents.topSkill && 
                    ` Your highest rated skill is ${dashboardStats.talents.topSkill}.`}
                  {dashboardStats.talents.categories.length > 0 && 
                    ` Your interests include: ${dashboardStats.talents.categories.join(', ')}.`}
                </p>
              </div>
              <ExtracurricularChart />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
