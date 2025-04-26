
import React, { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Trophy, Award, Star, Target, BookOpen, BrainCircuit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { fetchQuizStatistics, calculateQuizBadgeLevel } from "@/lib/quiz-service";
import { useJournalEntries, useSportsRecords, useExtracurricularRecords, useGoals, useAcademicRecords } from "@/lib/dashboard-service";

interface BadgeProps {
  level: string;
  icon: React.ReactNode | string;
  description: string;
  color: string;
}

const BadgeDisplay = ({ level, icon, description, color }: BadgeProps) => {
  return (
    <div className="flex flex-col items-center">
      <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg mb-2`}>
        {typeof icon === 'string' ? icon : icon}
      </div>
      <h3 className="font-bold text-sm">{level}</h3>
      <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>
    </div>
  );
};

export function RewardsBadgesSection() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizBadge, setQuizBadge] = useState<BadgeProps | null>(null);
  const [journalBadge, setJournalBadge] = useState<BadgeProps | null>(null);
  const [sportsBadge, setSportsBadge] = useState<BadgeProps | null>(null);
  const [goalsBadge, setGoalsBadge] = useState<BadgeProps | null>(null);
  const [extraBadge, setExtraBadge] = useState<BadgeProps | null>(null);

  const { data: journalEntries } = useJournalEntries(currentUser?.uid);
  const { data: sportsRecords } = useSportsRecords(currentUser?.uid);
  const { data: extraRecords } = useExtracurricularRecords(currentUser?.uid);
  const { data: goals } = useGoals(currentUser?.uid);
  const { data: academicRecords } = useAcademicRecords(currentUser?.uid);

  useEffect(() => {
    const fetchBadges = async () => {
      if (currentUser?.uid) {
        try {
          // Fetch quiz stats
          const quizStats = await fetchQuizStatistics(currentUser.uid);
          const badge = calculateQuizBadgeLevel(quizStats);
          setQuizBadge({
            level: badge.level,
            icon: badge.icon,
            description: badge.description,
            color: badge.color
          });
          
          // Calculate journal badges
          if (journalEntries.length > 0) {
            let level, icon, description, color;
            if (journalEntries.length >= 30) {
              level = "Journal Master";
              icon = "📝";
              description = "Created 30+ journal entries";
              color = "bg-gradient-to-r from-indigo-600 to-indigo-400 text-white";
            } else if (journalEntries.length >= 15) {
              level = "Dedicated Writer";
              icon = "✒️";
              description = "Created 15+ journal entries";
              color = "bg-gradient-to-r from-blue-500 to-cyan-400 text-white";
            } else if (journalEntries.length >= 5) {
              level = "Journal Enthusiast";
              icon = "📔";
              description = "Created 5+ journal entries";
              color = "bg-gradient-to-r from-cyan-500 to-teal-400 text-white";
            } else {
              level = "Journal Beginner";
              icon = "📓";
              description = "Started journaling journey";
              color = "bg-gradient-to-r from-teal-400 to-green-300 text-white";
            }
            setJournalBadge({ level, icon, description, color });
          }
          
          // Calculate sports badges
          if (sportsRecords.length > 0) {
            let level, icon, description, color;
            const goldMedals = sportsRecords.filter(r => 
              r.position?.toLowerCase().includes("gold") || 
              r.position?.toLowerCase().includes("1st")
            ).length;
            
            if (goldMedals >= 5) {
              level = "Elite Athlete";
              icon = "🥇";
              description = "Earned 5+ gold medals";
              color = "bg-gradient-to-r from-yellow-500 to-amber-400 text-white";
            } else if (sportsRecords.length >= 10) {
              level = "Sports Star";
              icon = "🏅";
              description = "Participated in 10+ sporting events";
              color = "bg-gradient-to-r from-orange-500 to-amber-400 text-white";
            } else if (sportsRecords.length >= 5) {
              level = "Active Sportsperson";
              icon = "🏃";
              description = "Participated in 5+ sporting events";
              color = "bg-gradient-to-r from-amber-500 to-yellow-400 text-white";
            } else {
              level = "Sports Rookie";
              icon = "⚽";
              description = "Started sports journey";
              color = "bg-gradient-to-r from-green-400 to-emerald-300 text-white";
            }
            setSportsBadge({ level, icon, description, color });
          }
          
          // Calculate goals badges
          if (goals.length > 0) {
            let level, icon, description, color;
            const completedGoals = goals.filter(g => g.status === "Completed").length;
            
            if (completedGoals >= 10) {
              level = "Goal Master";
              icon = "🎯";
              description = "Completed 10+ goals";
              color = "bg-gradient-to-r from-red-500 to-rose-400 text-white";
            } else if (completedGoals >= 5) {
              level = "Goal Achiever";
              icon = "🏆";
              description = "Completed 5+ goals";
              color = "bg-gradient-to-r from-pink-500 to-rose-400 text-white";
            } else if (completedGoals >= 1) {
              level = "Goal Setter";
              icon = "🎯";
              description = "Completed your first goal";
              color = "bg-gradient-to-r from-purple-500 to-pink-400 text-white";
            } else {
              level = "Aspiring Achiever";
              icon = "🔮";
              description = "Started setting goals";
              color = "bg-gradient-to-r from-violet-500 to-purple-400 text-white";
            }
            setGoalsBadge({ level, icon, description, color });
          }
          
          // Calculate extracurricular badges
          if (extraRecords.length > 0) {
            let level, icon, description, color;
            
            if (extraRecords.length >= 10) {
              level = "Renaissance Kid";
              icon = "🎭";
              description = "Engaged in 10+ extracurricular activities";
              color = "bg-gradient-to-r from-fuchsia-600 to-pink-400 text-white";
            } else if (extraRecords.length >= 5) {
              level = "Well-rounded";
              icon = "🎨";
              description = "Engaged in 5+ extracurricular activities";
              color = "bg-gradient-to-r from-violet-600 to-fuchsia-400 text-white";
            } else if (extraRecords.length >= 3) {
              level = "Explorer";
              icon = "🔍";
              description = "Tried 3+ extracurricular activities";
              color = "bg-gradient-to-r from-indigo-600 to-violet-400 text-white";
            } else {
              level = "Activity Starter";
              icon = "🌱";
              description = "Started extracurricular journey";
              color = "bg-gradient-to-r from-blue-600 to-indigo-400 text-white";
            }
            setExtraBadge({ level, icon, description, color });
          }
        } catch (error) {
          console.error("Error fetching badge data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBadges();
  }, [currentUser, journalEntries, sportsRecords, extraRecords, goals, academicRecords]);

  return (
    <DashboardCard 
      title={
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <span>Rewards & Badges</span>
        </div>
      }
      gradient
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-primary rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground mb-4">
            Badges are earned through achievements across different activities in TreasureBook.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {quizBadge && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <BadgeDisplay {...quizBadge} />
              </div>
            )}
            
            {journalBadge && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <BadgeDisplay {...journalBadge} />
              </div>
            )}
            
            {sportsBadge && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <BadgeDisplay {...sportsBadge} />
              </div>
            )}
            
            {goalsBadge && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <BadgeDisplay {...goalsBadge} />
              </div>
            )}
            
            {extraBadge && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                <BadgeDisplay {...extraBadge} />
              </div>
            )}
            
            {!quizBadge && !journalBadge && !sportsBadge && !goalsBadge && !extraBadge && (
              <div className="col-span-full text-center py-8">
                <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2">No Badges Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Complete activities in quizzes, journals, sports, goals, and extracurriculars to earn badges!
                </p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              How to Earn Badges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <BrainCircuit className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <span><strong>Quizzes:</strong> Complete quizzes and maintain a high average score</span>
              </div>
              <div className="flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                <span><strong>Journals:</strong> Write and maintain journal entries regularly</span>
              </div>
              <div className="flex items-start gap-2">
                <Trophy className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <span><strong>Sports:</strong> Record sports achievements and participation</span>
              </div>
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <span><strong>Goals:</strong> Set and complete personal goals</span>
              </div>
              <div className="flex items-start gap-2">
                <Award className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <span><strong>Extracurricular:</strong> Participate in diverse activities</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
