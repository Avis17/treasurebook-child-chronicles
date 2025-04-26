
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SportsForm } from "@/components/sports/SportsForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface SportsRecord {
  id?: string;
  userId: string;
  sport: string;
  date: string;
  level: string;
  position: string;
  organizer: string;
  achievement: string;
  certificate: boolean;
  notes?: string;
  createdAt?: any;
}

const Sports = () => {
  const [records, setRecords] = useState<SportsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SportsRecord | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRecords = async (userId: string) => {
    try {
      setIsLoading(true);
      const recordsRef = collection(db, "sportsRecords");
      const q = query(recordsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const fetchedRecords: SportsRecord[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRecords.push({ id: doc.id, ...doc.data() } as SportsRecord);
      });
      
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Error fetching sports records:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load sports records",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        fetchRecords(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAddRecord = async (values: SportsRecord) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newRecord = {
        ...values,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "sportsRecords"), newRecord);

      // Update profile counter
      const userProfileRef = doc(db, "profiles", user.uid);
      await updateDoc(userProfileRef, {
        sportsParticipationsCount: increment(1)
      });

      setRecords([...records, { id: docRef.id, ...values }]);
      
      toast({
        title: "Success",
        description: "Sports record added successfully",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding sports record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add sports record",
      });
    }
  };

  const handleEdit = (record: SportsRecord) => {
    setEditingRecord(record);
    setIsDialogOpen(true);
  };

  const handleUpdate = async (updatedRecord: SportsRecord) => {
    try {
      if (!updatedRecord.id) {
        throw new Error("Record ID is missing");
      }

      // Create a copy of the record without the id field for Firestore update
      const { id, ...recordData } = updatedRecord;
      const recordRef = doc(db, "sportsRecords", id);
      
      await updateDoc(recordRef, recordData);

      setRecords(
        records.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );

      toast({
        title: "Success",
        description: "Sports record updated successfully",
      });
      
      setIsDialogOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating sports record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update sports record",
      });
    }
  };

  const handleDelete = async (record: SportsRecord) => {
    try {
      if (!record.id) {
        throw new Error("Record ID is missing");
      }
      
      await deleteDoc(doc(db, "sportsRecords", record.id));
      
      // Update profile counter
      const user = auth.currentUser;
      if (user?.uid) {
        const userProfileRef = doc(db, "profiles", user.uid);
        await updateDoc(userProfileRef, {
          sportsParticipationsCount: increment(-1)
        });
      }
      
      setRecords(records.filter(item => item.id !== record.id));
      
      toast({
        title: "Success",
        description: "Sports record deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting sports record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete sports record",
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRecord(null);
  };

  const columns = [
    {
      header: "Sport",
      accessor: "sport" as keyof SportsRecord,
    },
    {
      header: "Date",
      accessor: "date" as keyof SportsRecord,
    },
    {
      header: "Level",
      accessor: "level" as keyof SportsRecord,
    },
    {
      header: "Position",
      accessor: "position" as keyof SportsRecord,
    },
    {
      header: "Organizer",
      accessor: "organizer" as keyof SportsRecord,
    },
    {
      header: "Achievement",
      accessor: "achievement" as keyof SportsRecord,
    },
    {
      header: "Certificate",
      accessor: "certificate" as keyof SportsRecord,
      render: (record: SportsRecord) => (
        <span>{record.certificate ? "Yes" : "No"}</span>
      ),
    },
  ];

  return (
    <AppLayout title="Sports Activities">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Sport
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Sports Activities & Achievements</CardTitle>
          <CardDescription>
            Track and manage all your sports activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            </div>
          ) : (
            <DataTable
              data={records}
              columns={columns}
              searchable={true}
              searchFields={["sport", "organizer", "achievement", "level", "position"]}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteDialogProps={{
                title: "Delete Sports Record",
                description: "Are you sure you want to delete this sports record? This action cannot be undone.",
              }}
            />
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <SportsForm
          isOpen={isDialogOpen}
          onClose={closeDialog}
          onSubmit={editingRecord ? handleUpdate : handleAddRecord}
          initialData={editingRecord || undefined}
        />
      )}
    </AppLayout>
  );
};

export default Sports;
