
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { collection, addDoc, Timestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FeedbackTable } from "@/components/feedback/FeedbackTable";
import { PlusCircle, Search } from "lucide-react";

// Define the schema for the form
const feedbackSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackNote {
  id?: string;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
  userId: string;
  createdAt: Date;
}

const Feedback = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackNote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  const handleCreateFeedback = () => {
    setCurrentFeedback(null);
    form.reset({
      title: "",
      content: "",
      category: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditFeedback = (feedback: FeedbackNote) => {
    setCurrentFeedback(feedback);
    form.reset({
      title: feedback.title,
      content: feedback.content,
      category: feedback.category,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: FeedbackFormValues) => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to submit feedback.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        title: values.title,
        content: values.content,
        category: values.category,
        author: currentUser.displayName || currentUser.email || "Anonymous",
        userId: currentUser.uid,
        date: new Date().toISOString(),
        createdAt: Timestamp.now(),
      };

      if (currentFeedback?.id) {
        // Update existing feedback
        await updateDoc(doc(db, "feedback", currentFeedback.id), feedbackData);
        toast({
          title: "Feedback Updated",
          description: "Your feedback has been updated successfully.",
        });
      } else {
        // Create new feedback
        await addDoc(collection(db, "feedback"), feedbackData);
        toast({
          title: "Feedback Submitted",
          description: "Your feedback has been submitted successfully.",
        });
      }

      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error submitting your feedback.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    // This will trigger useEffect in FeedbackTable to reload data
    setFilterCategory(filterCategory);
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "academic", label: "Academic" },
    { value: "sports", label: "Sports" },
    { value: "extracurricular", label: "Extracurricular" },
    { value: "parent", label: "Parent" },
    { value: "general", label: "General" },
    { value: "other", label: "Other" },
  ];

  return (
    <AppLayout title="Feedback">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Manage Feedback</CardTitle>
              <CardDescription>
                Submit and track feedback for various aspects of the student's journey.
              </CardDescription>
            </div>
            <Button onClick={handleCreateFeedback}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Feedback
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
              <div className="relative w-full sm:w-1/2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search feedback..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-1/3">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FeedbackTable
              onEdit={handleEditFeedback}
              onRefresh={handleRefresh}
              filterCategory={filterCategory}
              searchTerm={searchTerm}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentFeedback ? "Edit Feedback" : "Create Feedback"}
            </DialogTitle>
            <DialogDescription>
              {currentFeedback
                ? "Update your feedback information below."
                : "Fill out the form below to submit your feedback."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your feedback details"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="extracurricular">Extracurricular</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⭮</span>
                      {currentFeedback ? "Updating..." : "Submitting..."}
                    </>
                  ) : (
                    <>{currentFeedback ? "Update" : "Submit"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Feedback;
