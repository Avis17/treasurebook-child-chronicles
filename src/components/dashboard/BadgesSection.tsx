import React, { useState, useEffect } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Award, Trophy, Star, Medal, Sparkles, CheckCircle, BookOpen, Calendar, Target, Activity, ChevronDown } from "lucide-react";
import { Badge, BADGE_THRESHOLDS, fetchUserBadges, getUserProgressCounts } from "@/lib/badge-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

const BADGE_COLORS = {
  Bronze: {
    bg: "from-amber-700 to-amber-600", 
    shadow: "shadow-amber-500/20",
    border: "border-amber-600/30",
    ring: "ring-amber-400/20",
    icon: "text-amber-50"
  },
  Silver: {
    bg: "from-gray-400 to-gray-500",
    shadow: "shadow-gray-400/30",
    border: "border-gray-400/30",
    ring: "ring-gray-300/30",
    icon: "text-gray-50"
  },
  Gold: {
    bg: "from-yellow-500 to-amber-400",
    shadow: "shadow-yellow-500/30",
    border: "border-yellow-400/30",
    ring: "ring-yellow-300/30",
    icon: "text-yellow-50"
  }
};

const CATEGORY_DETAILS = {
  Quiz: { 
    icon: Star, 
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    label: "Quiz Master"
  },
  Journal: { 
    icon: BookOpen, 
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    label: "Journal Expert"
  },
  Goals: { 
    icon: Target, 
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    label: "Goal Achiever"
  },
  Sports: { 
    icon: Activity, 
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/30",
    label: "Sports Champion"
  },
  ExtraCurricular: { 
    icon: Medal, 
    color: "text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    label: "Activity Star"
  }
};

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

const BadgeItem: React.FC<{ badge: Badge }> = ({ badge }) => {
  const CategoryIcon = CATEGORY_DETAILS[badge.category]?.icon || Award;
  const isLocked = badge.status === 'Locked';
  const colorTheme = BADGE_COLORS[badge.level];
  
  const progressPercent = badge.required && badge.progress !== undefined
    ? Math.min(Math.round((badge.progress / badge.required) * 100), 100)
    : 0;
  
  const remaining = badge.required && badge.progress !== undefined
    ? Math.max(badge.required - badge.progress, 0)
    : 0;
    
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 
            ${isLocked 
              ? 'bg-gray-50 dark:bg-gray-800 hover:shadow-md' 
              : `bg-white dark:bg-gray-800 hover:shadow-xl hover:-translate-y-1 ${colorTheme.ring} ring-1`}`}>
            <div className={`${isLocked ? 'opacity-70 filter ' : ''} h-full`}>
              <div className={`h-24 flex items-center justify-center bg-gradient-to-br ${colorTheme.bg} ${colorTheme.shadow}`}>
                <CategoryIcon className={`w-12 h-12 ${colorTheme.icon}`} />
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold truncate">{badge.name}</h4>
                  <UiBadge variant={isLocked ? "outline" : "default"} className={`text-xs ${!isLocked ? 'animate-pulse' : ''}`}>
                    {badge.level}
                  </UiBadge>
                </div>
                
                <p className={`text-xs ${CATEGORY_DETAILS[badge.category]?.color} mb-2 font-medium`}>
                  {CATEGORY_DETAILS[badge.category]?.label || badge.category}
                </p>
                
                {isLocked ? (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{badge.progress || 0}/{badge.required}</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                    <p className="text-xs mt-2 text-muted-foreground">
                      {remaining} more to unlock
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <p className="text-xs text-muted-foreground">
                      Unlocked {formatDate(badge.unlockedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                  Locked
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-center">
            <p className="font-medium">{badge.name}</p>
            <p className="text-xs mt-1">{badge.description}</p>
            {isLocked && (
              <p className="text-xs font-medium mt-2 text-amber-500">
                Complete {remaining} more {badge.category.toLowerCase() === 'extraCurricular' ? 'activities' : badge.category.toLowerCase()} to unlock
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const playConfetti = () => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#9b59b6', '#3498db', '#2ecc71', '#f39c12', '#e74c3c']
  });
};

const Info: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

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
  const [isExpanded, setIsExpanded] = useState(true);
  
  useEffect(() => {
    const loadBadges = async () => {
      if (!currentUser?.uid) return;
      
      try {
        setLoading(true);
        
        const userBadges = await fetchUserBadges(currentUser.uid);
        setBadges(userBadges);
        
        const counts = await getUserProgressCounts(currentUser.uid);
        setProgressCounts(counts);
        
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
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newlyUnlockedBadge') {
        loadBadges();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);
  
  const groupedBadges = badges.reduce((groups: Record<string, Badge[]>, badge) => {
    const category = badge.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(badge);
    return groups;
  }, {});
  
  const getNextBadgeInfo = (category: keyof typeof BADGE_THRESHOLDS) => {
    const categoryBadges = badges.filter(badge => badge.category === category && badge.status === 'Locked');
    if (!categoryBadges.length) return null;
    
    categoryBadges.sort((a, b) => (a.required || 0) - (b.required || 0));
    return categoryBadges[0];
  };
  
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
  
  const unlockedCount = badges.filter(badge => badge.status === 'Unlocked').length;
  const totalBadgesCount = badges.length;
  const unlockedPercentage = totalBadgesCount > 0 ? (unlockedCount / totalBadgesCount) * 100 : 0;

  const badgeLevelCounts = badges.reduce((counts: {[key: string]: number}, badge) => {
    if (badge.status === 'Unlocked') {
      counts[badge.level] = (counts[badge.level] || 0) + 1;
    }
    return counts;
  }, {Bronze: 0, Silver: 0, Gold: 0});

  return (
    <DashboardCard
      className="col-span-full"
    >
      <Collapsible defaultOpen={true}>
        <div className="flex items-center justify-between border-b pb-5 -mt-5 -mx-5 px-5">
          <CollapsibleTrigger 
            className="flex items-center gap-2 w-full cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2 flex-1">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="font-semibold text-lg text-foreground">My Achievements</span>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <div className="flex items-center gap-2">
            <div className="text-right text-xs">
              <p className="font-medium">{unlockedCount}/{totalBadgesCount}</p>
              <p className="text-muted-foreground">Badges</p>
            </div>
            <div className="flex gap-1">
              {badgeLevelCounts.Gold > 0 && (
                <UiBadge variant="outline" className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white border-none">
                  {badgeLevelCounts.Gold} Gold
                </UiBadge>
              )}
              {badgeLevelCounts.Silver > 0 && (
                <UiBadge variant="outline" className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-none">
                  {badgeLevelCounts.Silver} Silver
                </UiBadge>
              )}
              {badgeLevelCounts.Bronze > 0 && (
                <UiBadge variant="outline" className="bg-gradient-to-r from-amber-700 to-amber-600 text-white border-none">
                  {badgeLevelCounts.Bronze} Bronze
                </UiBadge>
              )}
            </div>
          </div>
        </div>
        
        <CollapsibleContent>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden shadow-md">
                  <Skeleton className="h-24 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-3" />
                    <Skeleton className="h-2 w-full mb-1" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      Badge Collection Progress
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">Unlock all badges to complete your collection</p>
                    <div className="flex items-center gap-2">
                      <Progress value={unlockedPercentage} className="h-2.5 flex-1" />
                      <span className="text-sm font-medium">{Math.round(unlockedPercentage)}%</span>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap md:flex-nowrap">
                    {Object.keys(BADGE_COLORS).map(level => (
                      <div key={level} className="flex items-center gap-2 bg-white/80 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg shadow-sm">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${BADGE_COLORS[level as keyof typeof BADGE_COLORS].bg}`}></div>
                        <span className="text-xs font-medium">{level}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-600 px-1.5 rounded">
                          {badgeLevelCounts[level as keyof typeof badgeLevelCounts] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-2">
                    {CATEGORY_DETAILS[category as keyof typeof CATEGORY_DETAILS]?.icon && (
                      <div className={`p-1.5 rounded-lg ${CATEGORY_DETAILS[category as keyof typeof CATEGORY_DETAILS].bg}`}>
                        {React.createElement(CATEGORY_DETAILS[category as keyof typeof CATEGORY_DETAILS].icon, { 
                          className: `w-5 h-5 ${CATEGORY_DETAILS[category as keyof typeof CATEGORY_DETAILS].color}` 
                        })}
                      </div>
                    )}
                    <h3 className="text-lg font-bold">
                      {category === 'ExtraCurricular' ? 'Activities' : category} Badges
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                    {categoryBadges.map(badge => (
                      <BadgeItem key={badge.id} badge={badge} />
                    ))}
                  </div>
                  
                  {getNextBadgeInfo(category as keyof typeof BADGE_THRESHOLDS) && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium flex items-center gap-1.5">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          Next {category === 'ExtraCurricular' ? 'Activity' : category} Badge:
                        </span>
                        <span className="text-sm">
                          <span className="font-medium">{getProgressCount(category as keyof typeof BADGE_THRESHOLDS)}</span>
                          <span className="text-muted-foreground">/{getNextBadgeInfo(category as keyof typeof BADGE_THRESHOLDS)?.required}</span>
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
              
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <p className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Badges are unlocked based on your child's achievements in quizzes, journals, sports, goals, and activities.
                </p>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </DashboardCard>
  );
};

export { Info };
