
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/shared/DataTable";
import { PlusCircle, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuizAttemptModal } from "@/components/quiz/QuizAttemptModal";
import { QuizResultsModal } from "@/components/quiz/QuizResultsModal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Interface for quiz attempt records
export interface QuizAttempt {
  id?: string;
  userId: string;
  class: string;
  category: string;
  categoryId: number;
  categoryName: string;
  difficulty: string;
  type: string;
  questions: Array<{
    question: string;
    correct_answer: string;
    incorrect_answers: string[];
    userAnswer?: string;
    isCorrect?: boolean;
  }>;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  percentage: number;
  timestamp: any;
  date: string;
}

// Schema for quiz form validation
const quizSchema = z.object({
  class: z.string({ required_error: "Please select a class" }),
  category: z.string({ required_error: "Please select a category" }),
  difficulty: z.string({ required_error: "Please select a difficulty level" }),
  type: z.string({ required_error: "Please select a quiz type" }),
});

type QuizFormValues = z.infer<typeof quizSchema>;

const Quizzes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [viewQuiz, setViewQuiz] = useState<QuizAttempt | null>(null);
  const [filterClass, setFilterClass] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      class: "",
      category: "",
      difficulty: "",
      type: "multiple"
    }
  });

  // Fetch categories from the Open Trivia API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://opentdb.com/api_category.php");
        const data = await response.json();
        setCategories(data.trivia_categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz categories.",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch quiz attempts from Firebase
  useEffect(() => {
    fetchQuizAttempts();
  }, [currentUser]);

  const onSubmit = async (values: QuizFormValues) => {
    setIsLoading(true);
    
    try {
      // Prepare the API URL with selected parameters
      const categoryId = values.category;
      const difficulty = values.difficulty;
      const type = values.type === "multiple" ? "multiple" : "boolean";
      
      const url = `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=${type}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.response_code === 0) {
        // Decode HTML entities in questions and answers
        const decodedQuestions = data.results.map((q: any) => ({
          ...q,
          question: decodeHTMLEntities(q.question),
          correct_answer: decodeHTMLEntities(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(decodeHTMLEntities)
        }));
        
        setQuestions(decodedQuestions);
        
        // Find the category name based on ID
        const categoryObj = categories.find(c => c.id.toString() === categoryId);
        const categoryName = categoryObj ? categoryObj.name : "General Knowledge";
        
        const newQuiz = {
          ...values,
          categoryId: parseInt(categoryId),
          categoryName,
          questions: decodedQuestions
        };
        
        setCurrentQuiz(newQuiz);
        setIsDialogOpen(false);
        setQuizModalOpen(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quiz questions. Please try different options.",
        });
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start quiz. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to decode HTML entities in text
  function decodeHTMLEntities(text: string) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }

  // Reset the quiz state when modal is closed
  const handleQuizModalClose = (open: boolean) => {
    if (!open) {
      // Ask for confirmation before closing
      if (window.confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
        setQuizModalOpen(false);
        // Don't need to reset currentQuiz here as it will be overwritten on next quiz start
      }
    } else {
      setQuizModalOpen(open);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (result: any) => {
    if (!currentUser) return;
    
    setQuizModalOpen(false);
    
    try {
      // Save the quiz attempt to Firebase
      const quizAttempt = {
        userId: currentUser.uid,
        class: currentQuiz.class,
        category: currentQuiz.category,
        categoryId: currentQuiz.categoryId,
        categoryName: currentQuiz.categoryName,
        difficulty: currentQuiz.difficulty,
        type: currentQuiz.type,
        questions: result.questions,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        wrongAnswers: result.wrongAnswers,
        percentage: result.percentage,
        timestamp: Timestamp.now(),
        date: new Date().toISOString(),
      };
      
      await addDoc(collection(db, "quizAttempts"), quizAttempt);
      
      // Update the local state with the new quiz attempt
      setQuizAttempts([{ ...quizAttempt, id: "temp-id" }, ...quizAttempts]);
      
      // Show the results modal
      setViewQuiz(quizAttempt as QuizAttempt);
      setResultModalOpen(true);
      
      // Refresh the quiz attempts list
      fetchQuizAttempts();
      
      toast({
        title: "Quiz Completed",
        description: `You scored ${result.percentage}% in this quiz!`,
      });
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your quiz results.",
      });
    }
  };

  // Function to fetch quiz attempts
  const fetchQuizAttempts = async () => {
    if (!currentUser) return;
    
    setTableLoading(true);
    try {
      // Create a compound query with proper indexing (userId and timestamp)
      const attemptQuery = query(
        collection(db, "quizAttempts"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(attemptQuery);
      const attempts: QuizAttempt[] = [];
      
      querySnapshot.forEach((doc) => {
        attempts.push({ id: doc.id, ...doc.data() } as QuizAttempt);
      });
      
      setQuizAttempts(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load quiz attempts. Please make sure you created the required index in Firebase.",
      });
    } finally {
      setTableLoading(false);
    }
  };

  // Reset form when dialog is closed
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({
        class: "",
        category: "",
        difficulty: "",
        type: "multiple"
      });
    }
    setIsDialogOpen(open);
  };

  // Define DataTable columns
  const columns = [
    {
      header: "Date",
      accessor: "date" as keyof QuizAttempt,
      sortable: true,
      render: (item: QuizAttempt) => (
        <span>{format(new Date(item.date), "MMM dd, yyyy h:mm a")}</span>
      ),
    },
    {
      header: "Class",
      accessor: "class" as keyof QuizAttempt,
      sortable: true,
    },
    {
      header: "Category",
      accessor: "categoryName" as keyof QuizAttempt,
      sortable: true,
    },
    {
      header: "Difficulty",
      accessor: "difficulty" as keyof QuizAttempt,
      sortable: true,
      render: (item: QuizAttempt) => (
        <Badge variant={
          item.difficulty === "easy" ? "outline" : 
          item.difficulty === "medium" ? "secondary" : "destructive"
        } className="capitalize">
          {item.difficulty}
        </Badge>
      ),
    },
    {
      header: "Total Questions",
      accessor: "totalQuestions" as keyof QuizAttempt,
      sortable: true,
    },
    {
      header: "Correct",
      accessor: "correctAnswers" as keyof QuizAttempt,
      sortable: true,
      render: (item: QuizAttempt) => (
        <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
          {item.correctAnswers}
        </Badge>
      ),
    },
    {
      header: "Wrong",
      accessor: "wrongAnswers" as keyof QuizAttempt,
      sortable: true,
      render: (item: QuizAttempt) => (
        <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
          {item.wrongAnswers}
        </Badge>
      ),
    },
    {
      header: "Score",
      accessor: "percentage" as keyof QuizAttempt,
      sortable: true,
      render: (item: QuizAttempt) => (
        <Badge variant={
          item.percentage >= 80 ? "success" : 
          item.percentage >= 50 ? "secondary" : 
          "destructive"
        }>
          {item.percentage}%
        </Badge>
      ),
    },
  ];

  // Filter quiz attempts based on class, difficulty, category, and search term
  const filteredAttempts = quizAttempts.filter(attempt => {
    const classMatch = filterClass === "all" || attempt.class === filterClass;
    const difficultyMatch = filterDifficulty === "all" || attempt.difficulty === filterDifficulty;
    const categoryMatch = filterCategory === "all" || attempt.category === filterCategory;
    
    const searchMatch = !searchTerm || 
      attempt.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.class.toLowerCase().includes(searchTerm.toLowerCase());
    
    return classMatch && difficultyMatch && categoryMatch && searchMatch;
  });

  // Class options for dropdown
  const classOptions = [
    "Pre-KG", "LKG", "UKG", 
    "1st Standard", "2nd Standard", "3rd Standard", "4th Standard", "5th Standard",
    "6th Standard", "7th Standard", "8th Standard", "9th Standard", "10th Standard",
    "11th Standard", "12th Standard"
  ];

  return (
    <AppLayout title="Quiz Master">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Quiz Master</CardTitle>
              <CardDescription>
                Create and attempt quizzes to test your knowledge on various subjects.
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Quiz
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DataTable
              data={filteredAttempts}
              columns={columns}
              onEdit={(quiz) => {
                setViewQuiz(quiz);
                setResultModalOpen(true);
              }}
              searchable={false}
              searchFields={["categoryName", "class"]}
              itemsPerPage={10}
              loading={tableLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quiz Setup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Start New Quiz</DialogTitle>
            <DialogDescription>
              Select your quiz preferences to generate questions.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiple" id="multiple" />
                          <Label htmlFor="multiple">Multiple Choice</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="boolean" id="boolean" />
                          <Label htmlFor="boolean">True/False</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⭮</span>
                      Loading Questions...
                    </>
                  ) : (
                    "Start Quiz"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Quiz Attempt Modal */}
      {currentQuiz && (
        <QuizAttemptModal
          open={quizModalOpen}
          onOpenChange={handleQuizModalClose}
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Quiz Results Modal */}
      {viewQuiz && (
        <QuizResultsModal
          open={resultModalOpen}
          onOpenChange={setResultModalOpen}
          quizAttempt={viewQuiz}
        />
      )}
    </AppLayout>
  );
};

export default Quizzes;
