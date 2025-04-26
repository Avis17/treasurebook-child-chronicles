
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { Sparkles, Award, ThumbsUp, TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"

interface QuizAttempt {
  id: string
  title: string
  percentage: number
  date: any
  userId: string
  category?: string
}

export function QuizSummarySection() {
  const [quizData, setQuizData] = useState<{
    totalAttempts: number
    completedQuizzes: QuizAttempt[]
    averageScore: number
    highestScore: number
    recentImprovement: number
  }>({
    totalAttempts: 0,
    completedQuizzes: [],
    averageScore: 0,
    highestScore: 0,
    recentImprovement: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        // First check the profile for the count
        const profileRef = doc(db, "profiles", user.uid)
        const profileSnap = await getDoc(profileRef)
        let totalAttempts = 0
        
        if (profileSnap.exists()) {
          const profileData = profileSnap.data()
          totalAttempts = profileData?.quizAttemptsCount || 0
        }
        
        // Get the quiz attempts for detailed data
        const quizRef = collection(db, "quizAttempts")
        const q = query(
          quizRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        )

        const querySnapshot = await getDocs(q)
        const attempts: QuizAttempt[] = []
        let totalScore = 0
        let highestScore = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data() as QuizAttempt
          attempts.push({
            id: doc.id,
            title: data.title || data.category || 'Unnamed Quiz',
            percentage: data.percentage || 0,
            date: data.date,
            userId: data.userId
          })
          
          totalScore += data.percentage || 0
          highestScore = Math.max(highestScore, data.percentage || 0)
        })

        // If the profile count doesn't match the actual count, update it
        if (profileSnap.exists() && attempts.length !== totalAttempts) {
          totalAttempts = attempts.length
        }

        // Calculate improvement (difference between most recent and previous quiz)
        const recentImprovement = attempts.length >= 2 ? 
          attempts[0].percentage - attempts[1].percentage : 0

        setQuizData({
          totalAttempts: totalAttempts,
          completedQuizzes: attempts.slice(0, 3), // Show only last 3
          averageScore: attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0,
          highestScore,
          recentImprovement
        })
      } catch (error) {
        console.error("Error fetching quiz data:", error)
        toast({
          title: "Error",
          description: "Failed to load quiz data",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
    
    // Set up listener for new badge unlocks
    const handleStorageChange = () => {
      if (localStorage.getItem('newlyUnlockedBadge') === 'true') {
        fetchQuizData()
        localStorage.removeItem('newlyUnlockedBadge')
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Check on mount as well
    if (localStorage.getItem('newlyUnlockedBadge') === 'true') {
      fetchQuizData()
      localStorage.removeItem('newlyUnlockedBadge')
    }
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Get appropriate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500"
    if (score >= 75) return "bg-emerald-500"
    if (score >= 60) return "bg-blue-500"
    if (score >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  // Get badge variant based on score
  const getBadgeVariant = (score: number) => {
    if (score >= 90) return "success"
    if (score >= 75) return "default"
    if (score >= 60) return "secondary"
    if (score >= 40) return "warning"
    return "destructive"
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-t-4 border-t-primary dark:border-t-indigo-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-white to-slate-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl font-bold">Quiz Performance</CardTitle>
        </div>
        <Badge variant="outline" className="text-xs font-medium bg-primary/10 hover:bg-primary/20">
          {quizData.totalAttempts} Attempts
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Average</p>
                  <Award className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {quizData.averageScore}%
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Best Score</p>
                  <ThumbsUp className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {quizData.highestScore}%
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Recent</p>
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <p className={`text-2xl font-bold ${quizData.recentImprovement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {quizData.recentImprovement > 0 ? '+' : ''}{quizData.recentImprovement}%
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Average Score Progress</p>
                <span className="text-sm text-muted-foreground">{quizData.averageScore}%</span>
              </div>
              <Progress 
                value={quizData.averageScore} 
                className="h-2.5 bg-gray-200 dark:bg-gray-700" 
                indicatorClassName={getScoreColor(quizData.averageScore)}
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-500" /> 
                Recent Quiz Results
              </h4>
              <div className="space-y-3">
                {quizData.completedQuizzes.length > 0 ? (
                  quizData.completedQuizzes.map((quiz) => (
                    <TooltipProvider key={quiz.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:border-primary/30 dark:hover:border-indigo-500/30 transition-all">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{quiz.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(quiz?.date?.toDate ? quiz.date.toDate() : quiz.date).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getScoreColor(quiz.percentage)}`}
                                  style={{ width: `${quiz.percentage}%` }}
                                ></div>
                              </div>
                              <Badge variant={getBadgeVariant(quiz.percentage)} className="ml-2">
                                {quiz.percentage}%
                              </Badge>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Score: {quiz.percentage}% {quiz.percentage >= 80 ? '- Great job!' : quiz.percentage >= 60 ? '- Good effort!' : '- Keep practicing!'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                    <Award className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-muted-foreground">No quiz attempts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Take a quiz to see your results here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
