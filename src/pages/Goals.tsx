import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Target, Edit, Trash2, Plus, Calendar, CheckCircle, Circle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Goal {
  id?: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  status: string;
  steps?: { text: string; completed: boolean }[];
  userId: string;
  createdAt: Date;
  [key: string]: any; // Add index signature for Firebase compatibility
}

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Goal>>({
    title: "",
    description: "",
    category: "Academic",
    timeframe: "Short-term",
    status: "In Progress",
    steps: [{ text: "", completed: false }]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, [filterCategory, filterStatus]);

  const fetchGoals = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Remove the orderBy clause to avoid composite index requirement
      const goalsRef = collection(db, "goals");
      const q = query(
        goalsRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const goalsData = [];
      querySnapshot.forEach((doc) => {
        goalsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Sort locally instead of in the query
      goalsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply filters
      let filteredGoals = goalsData;
      if (filterCategory !== "all") {
        filteredGoals = filteredGoals.filter(goal => goal.category === filterCategory);
      }
      if (filterStatus !== "all") {
        filteredGoals = filteredGoals.filter(goal => goal.status === filterStatus);
      }
      
      setGoals(filteredGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Error",
        description: "Failed to load goals data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps[index] = { ...updatedSteps[index], text: value };
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleStepToggle = (index: number) => {
    setFormData((prev) => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps[index] = { 
        ...updatedSteps[index], 
        completed: !updatedSteps[index].completed 
      };
      return { ...prev, steps: updatedSteps };
    });
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...(prev.steps || []), { text: "", completed: false }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => {
      const updatedSteps = [...(prev.steps || [])];
      updatedSteps.splice(index, 1);
      return { ...prev, steps: updatedSteps };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Filter out empty steps
      const filteredSteps = formData.steps?.filter(step => step.text.trim() !== "") || [];

      const goalData = {
        ...formData,
        steps: filteredSteps,
        userId: user.uid,
        createdAt: new Date()
      } as Goal;
      
      if (isEditing && currentId) {
        // Create a copy without id before updating
        const { id, ...updateData } = goalData;
        await updateDoc(doc(db, "goals", currentId), updateData);
        toast({
          title: "Goal updated",
          description: "Your goal has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "goals"), goalData);
        toast({
          title: "Goal added",
          description: "Your goal has been successfully added",
        });
      }
      
      resetForm();
      fetchGoals();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: "Error",
        description: "Failed to save goal",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (goal: Goal) => {
    setIsEditing(true);
    setCurrentId(goal.id);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      timeframe: goal.timeframe,
      status: goal.status,
      steps: goal.steps || []
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "goals", id));
      toast({
        title: "Goal deleted",
        description: "The goal has been successfully deleted",
      });
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Academic",
      timeframe: "Short-term",
      status: "In Progress",
      steps: [{ text: "", completed: false }]
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "In Progress":
        return "bg-blue-500";
      case "Not Started":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Academic":
        return "bg-purple-500";
      case "Career":
        return "bg-blue-500";
      case "Personal":
        return "bg-pink-500";
      case "Health":
        return "bg-green-500";
      case "Financial":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <AppLayout title="Goals & Vision" hideHeader={true}>
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Goals & Vision" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Goals & Vision</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Goal" : "Add New Goal"}</DialogTitle>
                <DialogDescription>
                  Define your goals and track your progress towards achieving them.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Title</label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Improve Math Grades"
                    required
                    className="dark:bg-gray-800 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    placeholder="Details about this goal"
                    className="w-full p-2 rounded border dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Career">Career</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Financial">Financial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="timeframe" className="text-sm font-medium">Timeframe</label>
                    <Select
                      value={formData.timeframe}
                      onValueChange={(value) => handleSelectChange("timeframe", value)}
                    >
                      <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Short-term">Short-term</SelectItem>
                        <SelectItem value="Medium-term">Medium-term</SelectItem>
                        <SelectItem value="Long-term">Long-term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Action Steps</label>
                    <Button type="button" variant="outline" size="sm" onClick={addStep}>
                      <Plus className="h-4 w-4 mr-1" /> Add Step
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {formData.steps?.map((step, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStepToggle(index)}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                        <Input
                          value={step.text}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder={`Step ${index + 1}`}
                          className={step.completed ? "line-through text-muted-foreground" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeStep(index)}
                          disabled={formData.steps?.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    resetForm();
                    setOpenDialog(false);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? "Update" : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Career">Career</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <Target className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No goals yet</h3>
                <p className="text-muted-foreground">Start setting goals to track your progress</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <CardTitle className="text-xl">{goal.title}</CardTitle>
                        <Badge className={`${getCategoryColor(goal.category)} text-white`}>
                          {goal.category}
                        </Badge>
                        <Badge className={`${getStatusColor(goal.status)} text-white`}>
                          {goal.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        {goal.timeframe} goal
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap mb-4">{goal.description}</p>
                  
                  {goal.steps && goal.steps.length > 0 && (
                    <Collapsible className="w-full">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Action Steps</h4>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {goal.steps.filter(step => step.completed).length} / {goal.steps.length} completed
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="mt-2">
                        <ul className="space-y-1">
                          {goal.steps.map((step, index) => (
                            <li key={index} className="flex items-center gap-2">
                              {step.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                              <span className={step.completed ? "line-through text-muted-foreground" : ""}>
                                {step.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default GoalsPage;
