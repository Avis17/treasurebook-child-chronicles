
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Award, Trophy, Star, Calendar } from "lucide-react";
import { Badge, BADGE_THRESHOLDS, fetchUserBadges, getUserProgressCounts } from "@/lib/badge-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
// Badge thresholds for different categories

// Define badge color mapping
const BADGE_COLORS = {
  Bronze: "bg-amber-700",
  Silver: "bg-gray-400",
  Gold: "bg-yellow-500"
};

// Define category icon mapping
const CATEGORY_ICONS = {
  Quiz: Star,
  Journal: Calendar,
  Goals: Trophy,
  Sports: Trophy,
  ExtraCurricular: Award
};

// Utility to format date from Firestore timestamp
const formatDate = (timestamp: any) => {
  if (!timestamp) return "";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Component to display a single badge
const BadgeItem = ({ badge }: { badge: Badge }) => {
  const CategoryIcon = CATEGORY_ICONS[badge.category];
  const isLocked = badge.status === 'Locked';
  
  // Calculate progress percentage
  const progressPercent = badge.required && badge.progress !== undefined
    ? Math.min(Math.round((badge.progress / badge.required) * 100), 100)
    : 0;
  
  // Determine how many more achievements needed
  const remaining = badge.required && badge.progress !== undefined
    ? Math.max(badge.required - badge.progress, 0)
    : 0;
    
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg 
      ${isLocked ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}>
      <div className={`${isLocked ? 'filter blur-[1px]' : ''} h-full`}>
        <div className={`h-20 flex items-center justify-center p-4 ${BADGE_COLORS[badge.level]}`}>
          <CategoryIcon className="w-10 h-10 text-white" />
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{badge.name}</h4>
            <UiBadge variant={isLocked ? "outline" : "default"} className="text-xs">
              {badge.level}
            </UiBadge>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {badge.category} {badge.level === 'Bronze' ? 'Starter' : badge.level === 'Silver' ? 'Pro' : 'Master'}
          </p>
          
          {isLocked ? (
            <div className="mt-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs mt-1 text-gray-500">
                {remaining} more to unlock
              </p>
            </div>
          ) : (
            <p className="text-xs mt-2 text-gray-500">
              Unlocked {formatDate(badge.unlockedAt)}
            </p>
          )}
        </div>
      </div>
      
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      )}
    </div>
  );
};

// Play confetti effect when a badge is unlocked
const playConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

export const BadgesSection = () => {
  const { currentUser } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressCounts, setProgressCounts] = useState({
    quizAttemptsCount: 0,
    journalEntriesCount: 0,
    goalsCompletedCount: 0,
    sportsParticipationsCount: 0,
    extraCurricularParticipationsCount: 0
  });
  
  // Load badges on component mount
  useEffect(() => {
    const loadBadges = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        const userBadges = await fetchUserBadges(currentUser.uid);
        setBadges(userBadges);
        
        // Get progress counts
        const counts = await getUserProgressCounts(currentUser.uid);
        setProgressCounts(counts);
        
        // Check if any new badges were just unlocked (would be marked in localStorage)
        const newlyUnlockedBadge = localStorage.getItem('newlyUnlockedBadge');
        if (newlyUnlockedBadge) {
          setTimeout(() => {
            playConfetti();
          }, 800);
          localStorage.removeItem('newlyUnlockedBadge');
        }
      } catch (error) {
        console.error("Error loading badges:", error);
        toast({
          title: "Error",
          description: "Failed to load badges. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadBadges();
  }, [currentUser]);
  
  // Group badges by category for display
  const groupedBadges = badges.reduce((groups: Record<string, Badge[]>, badge) => {
    const category = badge.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(badge);
    return groups;
  }, {});
  
  // Calculate next badge to unlock for each category
  const getNextBadgeInfo = (category: keyof typeof BADGE_THRESHOLDS) => {
    const categoryBadges = badges.filter(badge => badge.category === category && badge.status === 'Locked');
    if (!categoryBadges.length) return null;
    
    // Sort by required threshold
    categoryBadges.sort((a, b) => (a.required || 0) - (b.required || 0));
    return categoryBadges[0];
  };
  
  // Get progress count for a category
  const getProgressCount = (category: keyof typeof BADGE_THRESHOLDS) => {
    switch(category) {
      case 'Quiz': return progressCounts.quizAttemptsCount;
      case 'Journal': return progressCounts.journalEntriesCount;
      case 'Goals': return progressCounts.goalsCompletedCount;
      case 'Sports': return progressCounts.sportsParticipationsCount;
      case 'ExtraCurricular': return progressCounts.extraCurricularParticipationsCount;
      default: return 0;
    }
  };
  
  // Calculate number of unlocked badges
  const unlockedCount = badges.filter(badge => badge.status === 'Unlocked').length;

  return (
    <DashboardCard
      title={
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span>My Achievements</span>
          {unlockedCount > 0 && (
            <UiBadge className="ml-2">
              {unlockedCount} Unlocked
            </UiBadge>
          )}
        </div>
      }
      className="col-span-full"
    >
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="rounded-lg overflow-hidden shadow-md">
              <Skeleton className="h-20 w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                {category} Badges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                {categoryBadges.map(badge => (
                  <BadgeItem key={badge.id} badge={badge} />
                ))}
              </div>
              
              {/* Progress towards next badge */}
              {getNextBadgeInfo(category as keyof typeof BADGE_THRESHOLDS) && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-2">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span>Progress towards next {category} badge:</span>
                    <span className="font-medium">
                      {getProgressCount(category as keyof typeof BADGE_THRESHOLDS)} / 
                      {getNextBadgeInfo(category as keyof typeof BADGE_THRESHOLDS)?.required}
                    </span>
                  </div>
                  <Progress 
                    value={(getProgressCount(category as keyof typeof BADGE_THRESHOLDS) / 
                           (getNextBadgeInfo(category as keyof typeof BADGE_THRESHOLDS)?.required || 1)) * 100}
                    className="h-2"
                  />
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <p>Badges are unlocked based on your child's achievements in quizzes, journals, sports, goals, and activities.</p>
          </div>
        </>
      )}
    </DashboardCard>
  );
};
