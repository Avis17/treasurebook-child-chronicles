import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, Edit, Trash2, Plus, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FeedbackNote {
  id?: string;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
  userId: string;
  createdAt: Date;
  [key: string]: any; // Add index signature for Firebase compatibility
}

const FeedbackPage = () => {
  const [notes, setNotes] = useState<FeedbackNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<FeedbackNote>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    category: "Teacher",
    author: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbackNotes();
  }, [filterCategory]);

  const fetchFeedbackNotes = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const feedbackRef = collection(db, "feedback");
      const q = query(
        feedbackRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const notesData: FeedbackNote[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({
          id: doc.id,
          ...doc.data() as FeedbackNote
        });
      });
      
      // Sort locally instead of in the query
      notesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Filter by category if needed
      let filteredNotes = notesData;
      if (filterCategory !== "all") {
        filteredNotes = notesData.filter(note => note.category === filterCategory);
      }

      setNotes(filteredNotes);
    } catch (error) {
      console.error("Error fetching feedback notes:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback notes",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const noteData = {
        ...formData,
        userId: user.uid,
        createdAt: new Date()
      } as FeedbackNote;
      
      if (isEditing && currentId) {
        // Create a copy without id before updating
        const { id, ...updateData } = noteData;
        await updateDoc(doc(db, "feedback", currentId), updateData);
        toast({
          title: "Feedback note updated",
          description: "Your feedback note has been successfully updated",
        });
      } else {
        await addDoc(collection(db, "feedback"), noteData);
        toast({
          title: "Feedback note added",
          description: "Your feedback note has been successfully added",
        });
      }
      
      resetForm();
      fetchFeedbackNotes();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving feedback note:", error);
      toast({
        title: "Error",
        description: "Failed to save feedback note",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: FeedbackNote) => {
    setIsEditing(true);
    setCurrentId(note.id);
    setFormData({
      title: note.title,
      content: note.content,
      date: note.date,
      category: note.category,
      author: note.author
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      await deleteDoc(doc(db, "feedback", id));
      toast({
        title: "Feedback note deleted",
        description: "The feedback note has been successfully deleted",
      });
      fetchFeedbackNotes();
    } catch (error) {
      console.error("Error deleting feedback note:", error);
      toast({
        title: "Error",
        description: "Failed to delete feedback note",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      category: "Teacher",
      author: ""
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  if (loading) {
    return (
      <AppLayout title="Feedback & Notes">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Feedback & Notes">
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold">Feedback & Notes</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Feedback Note" : "Add New Feedback Note"}</DialogTitle>
                <DialogDescription>
                  Record feedback and notes from teachers, mentors, or personal reflections.
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
                    placeholder="e.g., Feedback on Presentation Skills"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content || ""}
                    onChange={handleInputChange}
                    placeholder="Details about this feedback"
                    className="w-full p-2 rounded border min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date || ""}
                      onChange={handleInputChange}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Mentor">Mentor</SelectItem>
                        <SelectItem value="Self">Self</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="author" className="text-sm font-medium">Author</label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author || ""}
                    onChange={handleInputChange}
                    placeholder="Name of the person providing feedback"
                    required
                  />
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
            <CardTitle>Filter Notes</CardTitle>
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
                    <SelectItem value="Teacher">Teacher</SelectItem>
                    <SelectItem value="Mentor">Mentor</SelectItem>
                    <SelectItem value="Self">Self</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No feedback notes yet</h3>
                <p className="text-muted-foreground">Record feedback from teachers, mentors, or your own reflections</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center">
                        <CardTitle className="text-xl">{note.title}</CardTitle>
                        <Badge variant="secondary">{note.category}</Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {note.date && format(new Date(note.date), "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(note)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{note.content}</p>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Author:</span>
                    <span className="text-sm text-muted-foreground">{note.author}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default FeedbackPage;
