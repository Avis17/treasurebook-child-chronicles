
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import AppLayout from "@/components/layout/AppLayout";
import ProfileHeader from "@/components/dashboard/ProfileHeader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import AcademicChart from "@/components/dashboard/AcademicChart";
import SportsChart from "@/components/dashboard/SportsChart";
import ExtracurricularChart from "@/components/dashboard/ExtracurricularChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface DashboardStats {
  academics: {
    grade: string;
    lastAssessment: string;
  };
  sports: {
    events: number;
    recent: string;
  };
  talents: {
    count: number;
    latest: string;
  };
  gallery: {
    count: number;
    lastUpdate: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("academics");
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    academics: { grade: "Loading...", lastAssessment: "Loading..." },
    sports: { events: 0, recent: "Loading..." },
    talents: { count: 0, latest: "Loading..." },
    gallery: { count: 0, lastUpdate: "Loading..." }
  });
  const { toast } = useToast();

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
    // Fetch Academic Records
    const academicQuery = query(
      collection(db, "academicRecords"),
      where("userId", "==", userId),
      limit(10)
    );
    const academicSnapshot = await getDocs(academicQuery);
    const academicRecords = academicSnapshot.docs.map(doc => doc.data());
    
    // Find the most recent academic record
    let bestGrade = "N/A";
    let lastAssessment = "None";
    
    if (academicRecords.length > 0) {
      // Sort by date if available, otherwise just use the first one
      const sortedRecords = [...academicRecords].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      
      const latestRecord = sortedRecords[0];
      bestGrade = latestRecord.grade || "N/A";
      lastAssessment = latestRecord.subject || "None";
    }

    // Fetch Sports Records
    const sportsQuery = query(
      collection(db, "sportsRecords"),
      where("userId", "==", userId),
      limit(10)
    );
    const sportsSnapshot = await getDocs(sportsQuery);
    const sportsRecords = sportsSnapshot.docs.map(doc => doc.data());
    
    let recentSport = "None";
    if (sportsRecords.length > 0) {
      const sortedSports = [...sportsRecords].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      recentSport = sortedSports[0].eventName || "None";
    }

    // Fetch Extracurricular Records
    const extraCurricularQuery = query(
      collection(db, "extraCurricularRecords"),
      where("userId", "==", userId),
      limit(10)
    );
    const extraCurricularSnapshot = await getDocs(extraCurricularQuery);
    const extraCurricularRecords = extraCurricularSnapshot.docs.map(doc => doc.data());
    
    let latestTalent = "None";
    if (extraCurricularRecords.length > 0) {
      const sortedExtra = [...extraCurricularRecords].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
      latestTalent = `${sortedExtra[0].activity || "Unknown"} - ${sortedExtra[0].level || "Beginner"}`;
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
      const sortedGallery = [...gallerySnapshot.docs].sort((a, b) => {
        const dateA = a.data().uploadDate ? new Date(a.data().uploadDate).getTime() : 0;
        const dateB = b.data().uploadDate ? new Date(b.data().uploadDate).getTime() : 0;
        return dateB - dateA;
      });
      
      if (sortedGallery[0].data().uploadDate) {
        const uploadDate = new Date(sortedGallery[0].data().uploadDate);
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

    setDashboardStats({
      academics: {
        grade: bestGrade,
        lastAssessment
      },
      sports: {
        events: sportsRecords.length,
        recent: recentSport
      },
      talents: {
        count: extraCurricularRecords.length,
        latest: latestTalent
      },
      gallery: {
        count: galleryCount,
        lastUpdate
      }
    });
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
        
        <div className="mt-8">
          <Tabs defaultValue="academics" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="academics">Academics</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="extracurricular">Extracurricular</TabsTrigger>
            </TabsList>
            
            <TabsContent value="academics" className="mt-0">
              <AcademicChart />
            </TabsContent>
            
            <TabsContent value="sports" className="mt-0">
              <SportsChart />
            </TabsContent>
            
            <TabsContent value="extracurricular" className="mt-0">
              <ExtracurricularChart />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
