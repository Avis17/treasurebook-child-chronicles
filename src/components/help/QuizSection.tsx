
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Award, Flame, Plus, ListChecks, Trophy, BarChart } from "lucide-react";

export function QuizSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Quiz Master</h2>
        <p className="text-muted-foreground">
          Learn through fun and interactive quizzes on various subjects
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <BrainCircuit className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">What are Quizzes?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Quizzes are interactive tests that help you assess and improve your knowledge across various subjects.
              They are designed to be both educational and engaging.
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Multiple-choice questions with instant feedback</li>
              <li>Timed challenges to test your knowledge</li>
              <li>Categories across various subjects</li>
              <li>Different difficulty levels to match your skill</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <ListChecks className="h-4 w-4 text-purple-700 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Taking a Quiz</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Taking a quiz is simple and straightforward:
            </p>
            <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
              <li>Browse available quizzes by category</li>
              <li>Select a quiz that interests you</li>
              <li>Answer the questions within the time limit</li>
              <li>Submit your answers to see your results</li>
              <li>Review detailed feedback on your performance</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                <BarChart className="h-4 w-4 text-green-700 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">Quiz Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Track your progress and improve your performance:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>View detailed performance metrics</li>
              <li>Track improvement over time</li>
              <li>Identify strengths and weaknesses</li>
              <li>Compare your scores with previous attempts</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                <Trophy className="h-4 w-4 text-amber-700 dark:text-amber-400" />
              </div>
              <CardTitle className="text-lg">Achievements & Rewards</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Earn badges and rewards for your quiz performance:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Earn badges for completing quizzes</li>
              <li>Unlock special rewards for high scores</li>
              <li>Special recognitions for consistent improvement</li>
              <li>Track your achievements on your dashboard</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
