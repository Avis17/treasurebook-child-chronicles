
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface QuizSummary {
  totalAttempts: number
  completedQuizzes: { id: string; title: string; score: number; date: string }[]
  averageScore: number
}

// This would normally come from your backend
const mockQuizData: QuizSummary = {
  totalAttempts: 12,
  averageScore: 85,
  completedQuizzes: [
    { id: "1", title: "Mathematics Basics", score: 90, date: "2024-04-25" },
    { id: "2", title: "Science Quiz", score: 85, date: "2024-04-24" },
    { id: "3", title: "English Grammar", score: 80, date: "2024-04-23" },
  ]
}

export function QuizSummarySection() {
  const { totalAttempts, completedQuizzes, averageScore } = mockQuizData

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">Quiz Performance</CardTitle>
        <Badge variant="secondary">{totalAttempts} Attempts</Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Average Score</p>
              <span className="text-sm text-muted-foreground">{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-2" />
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Quizzes</h4>
            <div className="space-y-2">
              {completedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{quiz.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(quiz.date).toLocaleDateString()}
                    </span>
                  </div>
                  <Badge variant={quiz.score >= 80 ? "success" : "secondary"}>
                    {quiz.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
