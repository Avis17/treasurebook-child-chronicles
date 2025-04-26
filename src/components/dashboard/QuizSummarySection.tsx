
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"

interface QuizAttempt {
  id: string
  title: string
  percentage: number
  date: any
  userId: string
}

export function QuizSummarySection() {
  const [quizData, setQuizData] = useState<{
    totalAttempts: number
    completedQuizzes: QuizAttempt[]
    averageScore: number
  }>({
    totalAttempts: 0,
    completedQuizzes: [],
    averageScore: 0
  })

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        const quizRef = collection(db, "quizAttempts")
        const q = query(
          quizRef,
          where("userId", "==", user.uid),
          orderBy("date", "desc")
        )

        const querySnapshot = await getDocs(q)
        const attempts: QuizAttempt[] = []
        let totalScore = 0

        querySnapshot.forEach((doc) => {
          const data = doc.data() as QuizAttempt
          attempts.push({
            id: doc.id,
            title: data.title,
            percentage: data.percentage,
            date: data.date,
            userId: data.userId
          })
          totalScore += data.percentage
        })

        setQuizData({
          totalAttempts: attempts.length,
          completedQuizzes: attempts.slice(0, 3), // Show only last 3
          averageScore: attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0
        })
      } catch (error) {
        console.error("Error fetching quiz data:", error)
      }
    }

    fetchQuizData()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Quiz Performance</CardTitle>
        <Badge variant="secondary">{quizData.totalAttempts} Attempts</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Average Score</p>
              <span className="text-sm text-muted-foreground">{quizData.averageScore}%</span>
            </div>
            <Progress value={quizData.averageScore} className="h-2" />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Quizzes</h4>
            <div className="space-y-2">
              {quizData.completedQuizzes.length > 0 ? (
                quizData.completedQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{quiz.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(quiz?.date).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant={quiz.percentage >= 80 ? "success" : "secondary"}>
                      {quiz.percentage}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No quiz attempts yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
