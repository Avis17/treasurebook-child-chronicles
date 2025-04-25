
// Update Journal.tsx to use the hideHeader prop and fix any Firebase query issues
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { BookText, Edit, Trash2, Plus, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  date: string;
  userId: string;
  [key: string]: any; // Add index signature for Firebase compatibility
}

const JournalPage = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    mood: "Neutral",
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Check journal collection
      const journalRef1 = collection(db, "journal");
      const q1 = query(
        journalRef1,
        where("userId", "==", user.uid)
      );

      // Also check journalEntries collection for backward compatibility
      const journalRef2 = collection(db, "journalEntries");
      const q2 = query(
        journalRef2,
        where("userId", "==", user.uid)
      );

      // Fetch from both collections
      const [querySnapshot1, querySnapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2)
      ]);

      const entriesData: JournalEntry[] = [];
      
      // Process entries from journal collection
      querySnapshot1.forEach((doc) => {
        entriesData.push({
          id: doc.id,
          ...doc.data()
        } as JournalEntry);
      });
      
      // Process entries from journalEntries collection
      querySnapshot2.forEach((doc) => {
        const data = doc.data();
        if (!entriesData.some(entry => entry.id === doc.id)) {
          entriesData.push({
            id: doc.id,
            ...data
          } as JournalEntry);
        }
      });
      
      // Sort locally
      entriesData.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Sort in descending order (newest first)
      });
      
      setJournalEntries(entriesData);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      toast({
        title: "Error",
        description: "Failed to load journal entries",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      const entryData = {
        ...formData,
        userId: user.uid,
        mood: formData.mood || "Neutral",
        tags: formData.tags || []
      } as JournalEntry;
      
      // Always use the journal collection for new entries
      if (isEditing && currentId) {
        // Try to update in both collections to ensure consistency
        try {
          // Update in journalEntries collection
          await updateDoc(doc(db, "journalEntries", currentId), entryData);
        } catch (error) {
          console.log("Entry not found in journalEntries, trying journal collection");
        }
        
        try {
          // Update in journal collection
          await updateDoc(doc(db, "journal", currentId), entryData);
        } catch (error) {
          console.log("Entry not found in journal collection");
        }
        
        toast({
          title: "Journal entry updated",
          description: "Your journal entry has been successfully updated",
        });
      } else {
        // Always add new entries to the journal collection
        await addDoc(collection(db, "journal"), {
          ...entryData,
          createdAt: new Date()
        });
        
        toast({
          title: "Journal entry added",
          description: "Your journal entry has been successfully added",
        });
      }
      
      resetForm();
      fetchEntries();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to save journal entry",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setIsEditing(true);
    setCurrentId(entry.id);
    setFormData({
      title: entry.title,
      content: entry.content,
      date: entry.date
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      // Try deleting from both collections to ensure consistency
      try {
        await deleteDoc(doc(db, "journalEntries", id));
      } catch (error) {
        console.log("Entry not found in journalEntries or already deleted");
      }
      
      try {
        await deleteDoc(doc(db, "journal", id));
      } catch (error) {
        console.log("Entry not found in journal or already deleted");
      }
      
      toast({
        title: "Journal entry deleted",
        description: "The journal entry has been successfully deleted",
      });
      fetchEntries();
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      mood: "Neutral",
      tags: []
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  if (loading) {
    return (
      <AppLayout title="Daily Journal">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Daily Journal" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Daily Journal</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">{isEditing ? "Edit Journal Entry" : "Add New Journal Entry"}</DialogTitle>
                <DialogDescription className="dark:text-gray-300">
                  Record your thoughts and experiences in your daily journal.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium dark:text-white">Title</label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Today's Reflection"
                    required
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-medium dark:text-white">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content || ""}
                    onChange={handleInputChange}
                    placeholder="Write about your day"
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium dark:text-white">Date</label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date || ""}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    resetForm();
                    setOpenDialog(false);
                  }}
                  className="dark:text-white">
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

        {journalEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <BookText className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No journal entries yet</h3>
                <p className="text-muted-foreground">Start recording your daily thoughts and experiences</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journalEntries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{entry.title}</CardTitle>
                      <CardDescription>
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {entry.date && format(new Date(entry.date), "MMMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                  <Separator className="my-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default JournalPage;
