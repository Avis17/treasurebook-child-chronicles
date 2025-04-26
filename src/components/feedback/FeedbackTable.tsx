
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

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

interface FeedbackTableProps {
  onEdit: (feedback: FeedbackNote) => void;
  onRefresh: () => void;
  filterCategory: string;
  searchTerm: string;
}

export const FeedbackTable = ({ onEdit, onRefresh, filterCategory, searchTerm }: FeedbackTableProps) => {
  const [feedback, setFeedback] = useState<FeedbackNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, [filterCategory]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const user = currentUser;
      if (!user) return;

      let feedbackQuery = query(
        collection(db, "feedback"),
        where("userId", "==", user.uid)
      );

      // Apply category filter if selected
      if (filterCategory !== "all") {
        feedbackQuery = query(
          collection(db, "feedback"),
          where("userId", "==", user.uid),
          where("category", "==", filterCategory)
        );
      }

      const querySnapshot = await getDocs(feedbackQuery);
      const feedbackData: FeedbackNote[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FeedbackNote;
        feedbackData.push({
          id: doc.id,
          ...data,
          date: data.date || "",
        });
      });

      // Sort by date (most recent first)
      feedbackData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        variant: "destructive",
        title: "Error fetching feedback",
        description: "There was an error fetching your feedback data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: FeedbackNote) => {
    try {
      if (!item.id) return;
      await deleteDoc(doc(db, "feedback", item.id));
      toast({
        title: "Feedback deleted",
        description: "Your feedback has been successfully deleted.",
      });
      onRefresh();
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error deleting feedback",
        description: "There was an error deleting your feedback.",
      });
    }
  };

  const columns = [
    {
      header: "Title",
      accessor: "title" as keyof FeedbackNote,
      sortable: true,
    },
    {
      header: "Category",
      accessor: "category" as keyof FeedbackNote,
      sortable: true,
      render: (item: FeedbackNote) => (
        <Badge variant="outline" className="capitalize">
          {item.category}
        </Badge>
      ),
    },
    {
      header: "Date",
      accessor: "date" as keyof FeedbackNote,
      sortable: true,
      render: (item: FeedbackNote) => 
        item.date ? format(new Date(item.date), "MMM dd, yyyy") : "N/A",
    },
    {
      header: "Author",
      accessor: "author" as keyof FeedbackNote,
      sortable: true,
    },
  ];

  // Filter by search term if provided
  const filteredFeedback = searchTerm
    ? feedback.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : feedback;

  return (
    <DataTable
      data={filteredFeedback}
      columns={columns}
      onEdit={onEdit}
      onDelete={handleDelete}
      searchable={false}
      searchFields={["title", "content", "author"]}
      itemsPerPage={5}
      loading={loading}
      deleteDialogProps={{
        title: "Delete Feedback",
        description: "Are you sure you want to delete this feedback? This action cannot be undone.",
      }}
    />
  );
};
