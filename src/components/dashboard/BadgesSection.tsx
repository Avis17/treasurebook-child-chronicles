
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Award, Trophy, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

// Badge types
interface UserBadge {
  id: string;
  name: string;
  category: string;
  level: 'Bronze' | 'Silver' | 'Gold';
  unlockedAt?: Date;
  progress?: number;
  required?: number;
  status: 'Locked' | 'Unlocked';
  description?: string;
  icon?: string;
}

interface BadgeThresholds {
  [key: string]: {
    Bronze: number;
    Silver: number;
    Gold: number;
  }
}

// Badge thresholds for different categories
const BADGE_THRESHOLDS: BadgeThresholds = {
  Quizzes: { Bronze: 5, Silver: 20, Gold: 50 },
  Journals: { Bronze: 3, Silver: 10, Gold: 30 },
  Goals: { Bronze: 5, Silver: 15, Gold: 30 },
  Sports: { Bronze: 3, Silver: 10, Gold: 20 },
  Extracurricular: { Bronze: 3, Silver: 10, Gold: 20 }
};

// Badge definitions
const BADGE_DEFINITIONS = [
  {
    category: 'Quizzes',
    levels: {
      Bronze: { name: 'Quiz Rookie', description: 'Completed 5 quizzes' },
      Silver: { name: 'Quiz Master', description: 'Completed 20 quizzes' },
      Gold: { name: 'Quiz Champion', description: 'Completed 50 quizzes' }
    }
  },
  {
    category: 'Journals',
    levels: {
      Bronze: { name: 'Journal Beginner', description: 'Created 3 journal entries' },
      Silver: { name: 'Journal Explorer', description: 'Created 10 journal entries' },
      Gold: { name: 'Journal Expert', description: 'Created 30 journal entries' }
    }
  },
  {
    category: 'Goals',
    levels: {
      Bronze: { name: 'Goal Setter', description: 'Completed 5 goals' },
      Silver: { name: 'Goal Achiever', description: 'Completed 15 goals' },
      Gold: { name: 'Goal Champion', description: 'Completed 30 goals' }
    }
  },
  {
    category: 'Sports',
    levels: {
      Bronze: { name: 'Sports Participant', description: 'Participated in 3 sports events' },
      Silver: { name: 'Sports Competitor', description: 'Participated in 10 sports events' },
      Gold: { name: 'Sports Star', description: 'Participated in 20 sports events' }
    }
  },
  {
    category: 'Extracurricular',
    levels: {
      Bronze: { name: 'Activity Explorer', description: 'Participated in 3 extracurricular activities' },
      Silver: { name: 'Activity Enthusiast', description: 'Participated in 10 extracurricular activities' },
      Gold: { name: 'Activity Champion', description: 'Participated in 20 extracurricular activities' }
    }
  }
];

// Get badge color based on level
const getBadgeColor = (level: string) => {
  switch (level) {
    case 'Bronze':
      return 'bg-amber-700 dark:bg-amber-700';
    case 'Silver':
      return 'bg-gray-400 dark:bg-gray-400';
    case 'Gold':
      return 'bg-yellow-500 dark:bg-yellow-500';
    default:
      return 'bg-blue-500 dark:bg-blue-500';
  }
};

// Get badge icon based on category
const getBadgeIcon = (category: string) => {
  switch (category) {
    case 'Quizzes':
      return <Star className="h-4 w-4" />;
    case 'Sports':
      return <Trophy className="h-4 w-4" />;
    default:
      return <Award className="h-4 w-4" />;
  }
};

export function BadgesSection() {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [userProgress, setUserProgress] = useState({
    quizAttemptsCount: 0,
    journalEntriesCount: 0,
    goalsCompletedCount: 0,
    sportsParticipationsCount: 0,
    extraCurricularParticipationsCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch user badges and progress from Firestore
  useEffect(() => {
    const fetchBadgesAndProgress = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        // Fetch user progress from profile
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        let progressData = {
          quizAttemptsCount: 0,
          journalEntriesCount: 0,
          goalsCompletedCount: 0,
          sportsParticipationsCount: 0,
          extraCurricularParticipationsCount: 0
        };
        
        if (profileSnap.exists()) {
          const profileData = profileSnap.data();
          
          progressData = {
            quizAttemptsCount: profileData.quizAttemptsCount || 0,
            journalEntriesCount: profileData.journalEntriesCount || 0,
            goalsCompletedCount: profileData.goalsCompletedCount || 0,
            sportsParticipationsCount: profileData.sportsParticipationsCount || 0,
            extraCurricularParticipationsCount: profileData.extraCurricularParticipationsCount || 0
          };
        }
        
        setUserProgress(progressData);
        
        // Fetch badges or initialize if not exist
        try {
          const badgesRef = collection(db, "badges", currentUser.uid, "badgeList");
          const badgesSnap = await getDocs(badgesRef);
          
          if (badgesSnap.empty) {
            // Initialize badges for new user
            await initializeUserBadges(currentUser.uid, progressData);
            
            // Fetch again after initialization
            const newBadgesSnap = await getDocs(badgesRef);
            const badgesList = newBadgesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as UserBadge[];
            
            setBadges(badgesList);
          } else {
            // Use existing badges
            const badgesList = badgesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as UserBadge[];
            
            setBadges(badgesList);
            
            // Check if any badges should be unlocked based on current progress
            await checkAndUpdateBadges(currentUser.uid, progressData, badgesList);
          }
        } catch (error) {
          console.error("Error fetching badges:", error);
        }
        
      } catch (error) {
        console.error("Error in badge setup:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadgesAndProgress();
  }, [currentUser?.uid]);
  
  // Initialize badges for a new user
  const initializeUserBadges = async (userId: string, progress: any) => {
    try {
      // Create all possible badges in locked state
      for (const badgeDef of BADGE_DEFINITIONS) {
        const category = badgeDef.category;
        
        for (const [level, levelData] of Object.entries(badgeDef.levels)) {
          // Determine the status based on current progress
          const progressField = getProgressFieldForCategory(category);
          const threshold = BADGE_THRESHOLDS[category][level as keyof typeof BADGE_THRESHOLDS[string]];
          const current = progress[progressField] || 0;
          
          const status = current >= threshold ? 'Unlocked' : 'Locked';
          const unlockedAt = status === 'Unlocked' ? new Date() : undefined;
          
          const badgeId = `${category}-${level}`;
          const badgeRef = doc(db, "badges", userId, "badgeList", badgeId);
          
          await setDoc(badgeRef, {
            name: levelData.name,
            category,
            level,
            status,
            unlockedAt,
            progress: current,
            required: threshold,
            description: levelData.description
          });
        }
      }
      
      // Update profile with counters if they don't exist
      const profileRef = doc(db, "profiles", userId);
      await updateDoc(profileRef, {
        ...progress
      });
      
    } catch (error) {
      console.error("Error initializing badges:", error);
    }
  };
  
  // Check if any badges should be unlocked based on current progress
  const checkAndUpdateBadges = async (userId: string, progress: any, currentBadges: UserBadge[]) => {
    let badgeUnlocked = false;
    const updatedBadges = [...currentBadges];
    
    for (const badge of updatedBadges) {
      if (badge.status === 'Locked') {
        const progressField = getProgressFieldForCategory(badge.category);
        const current = progress[progressField] || 0;
        
        // Update progress for badge
        badge.progress = current;
        
        // Check if badge should be unlocked
        if (current >= (badge.required || 0)) {
          badge.status = 'Unlocked';
          badge.unlockedAt = new Date();
          badgeUnlocked = true;
          
          // Update badge in Firestore
          const badgeRef = doc(db, "badges", userId, "badgeList", badge.id);
          await updateDoc(badgeRef, {
            status: 'Unlocked',
            unlockedAt: new Date(),
            progress: current
          });
          
          // Show toast and trigger confetti
          toast({
            title: "🎉 New Badge Unlocked!",
            description: `${badge.name} (${badge.level}) - ${badge.description}`,
            duration: 5000
          });
          
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 500);
        }
      }
    }
    
    if (badgeUnlocked) {
      setBadges(updatedBadges);
    }
  };
  
  // Helper to map category to progress field
  const getProgressFieldForCategory = (category: string) => {
    switch (category) {
      case 'Quizzes':
        return 'quizAttemptsCount';
      case 'Journals':
        return 'journalEntriesCount';
      case 'Goals':
        return 'goalsCompletedCount';
      case 'Sports':
        return 'sportsParticipationsCount';
      case 'Extracurricular':
        return 'extraCurricularParticipationsCount';
      default:
        return '';
    }
  };
  
  // Get next badge to unlock for a category
  const getNextBadgeToUnlock = (category: string) => {
    const categoryBadges = badges.filter(badge => badge.category === category);
    const lockedBadges = categoryBadges.filter(badge => badge.status === 'Locked');
    
    if (lockedBadges.length === 0) return null;
    
    // Sort by required threshold (lowest first)
    return lockedBadges.sort((a, b) => (a.required || 0) - (b.required || 0))[0];
  };

  // Get progress towards next badge
  const getProgressToNextBadge = (category: string) => {
    const nextBadge = getNextBadgeToUnlock(category);
    if (!nextBadge) return null;
    
    const progressField = getProgressFieldForCategory(category);
    const current = userProgress[progressField as keyof typeof userProgress];
    const required = nextBadge.required || 0;
    
    return {
      current,
      required,
      percent: Math.min(Math.round((current / required) * 100), 100),
      remaining: Math.max(required - current, 0),
      nextBadgeLevel: nextBadge.level
    };
  };

  return (
    <DashboardCard 
      title={
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span>My Achievements</span>
        </div>
      }
      gradient
    >
      {loading ? (
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {BADGE_DEFINITIONS.map(badgeDef => {
              const categoryBadges = badges.filter(b => b.category === badgeDef.category);
              const unlockedBadges = categoryBadges.filter(b => b.status === 'Unlocked');
              const nextProgress = getProgressToNextBadge(badgeDef.category);
              
              return (
                <div key={badgeDef.category} className="border rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm">
                  <h3 className="font-medium text-center mb-3">{badgeDef.category}</h3>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    {['Bronze', 'Silver', 'Gold'].map((level) => {
                      const badge = categoryBadges.find(b => b.level === level);
                      const isUnlocked = badge?.status === 'Unlocked';
                      
                      return (
                        <TooltipProvider key={level}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div 
                                className={`relative flex items-center justify-center w-10 h-10 rounded-full 
                                  ${isUnlocked ? getBadgeColor(level) : 'bg-gray-200 dark:bg-gray-700'}
                                  ${isUnlocked ? '' : 'opacity-40'}`}
                              >
                                {getBadgeIcon(badgeDef.category)}
                                {isUnlocked && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                                    ✓
                                  </span>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-center">
                                <p className="font-medium">{badgeDef.levels[level as keyof typeof badgeDef.levels].name}</p>
                                <p className="text-xs">{badgeDef.levels[level as keyof typeof badgeDef.levels].description}</p>
                                <p className="text-xs mt-1">
                                  {isUnlocked 
                                    ? `Unlocked: ${badge?.unlockedAt ? new Date(badge.unlockedAt as any).toLocaleDateString() : 'Recently'}`
                                    : `Locked: Need ${BADGE_THRESHOLDS[badgeDef.category][level as keyof typeof BADGE_THRESHOLDS[string]]} to unlock`}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-center text-muted-foreground mb-2">
                    {unlockedBadges.length}/3 Badges
                  </div>
                  
                  {nextProgress && (
                    <div className="mt-2">
                      <Progress value={nextProgress.percent} className="h-2" />
                      <p className="text-xs text-center mt-1">
                        {nextProgress.remaining} more to {nextProgress.nextBadgeLevel}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-center">
            <p>Badges are unlocked based on your achievements in quizzes, journals, sports, and activities.</p>
            <p className="text-xs mt-1 text-muted-foreground">Complete more activities to earn all badges!</p>
          </div>
        </>
      )}
    </DashboardCard>
  );
}
