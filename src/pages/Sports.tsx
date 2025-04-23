
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { SportsRecordForm } from "@/components/sports/SportsRecordForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SportsRecord {
  id?: string;
  userId: string;
  eventName: string;
  eventType: string;
  date: string;
  position: string;
  venue: string;
  achievement: string;
  level: string;
  coach: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

const Sports = () => {
  const [sportsRecords, setSportsRecords] = useState<SportsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SportsRecord | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSportsRecords = async (userId: string) => {
    try {
      setIsLoading(true);
      const recordsRef = collection(db, "sportsRecords");
      const q = query(recordsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const fetchedRecords: SportsRecord[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRecords.push({ id: doc.id, ...doc.data() } as SportsRecord);
      });
      
      setSportsRecords(fetchedRecords);
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
        fetchSportsRecords(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleAddRecord = async (record: SportsRecord) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to add a record",
        });
        return;
      }

      const newRecord = {
        ...record,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "sportsRecords"), newRecord);
      
      setSportsRecords([...sportsRecords, { ...newRecord, id: docRef.id }]);
      
      toast({
        title: "Success",
        description: "Sports record added successfully",
      });
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding sports record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add sports record",
      });
    }
  };

  const handleEditRecord = (record: SportsRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: SportsRecord) => {
    try {
      if (!updatedRecord.id) {
        throw new Error("Record ID is missing");
      }

      const recordRef = doc(db, "sportsRecords", updatedRecord.id);
      
      await updateDoc(recordRef, {
        ...updatedRecord,
        updatedAt: serverTimestamp(),
      });

      setSportsRecords(
        sportsRecords.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );

      toast({
        title: "Success",
        description: "Sports record updated successfully",
      });
      
      setIsFormOpen(false);
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

  const handleDeleteRecord = async (record: SportsRecord) => {
    try {
      if (!record.id) {
        throw new Error("Record ID is missing");
      }

      await deleteDoc(doc(db, "sportsRecords", record.id));
      
      setSportsRecords(sportsRecords.filter((r) => r.id !== record.id));
      
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

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const columns = [
    {
      header: "Event Name",
      accessor: "eventName" as keyof SportsRecord,
    },
    {
      header: "Event Type",
      accessor: "eventType" as keyof SportsRecord,
    },
    {
      header: "Date",
      accessor: "date" as keyof SportsRecord,
    },
    {
      header: "Position/Result",
      accessor: "position" as keyof SportsRecord,
      render: (record: SportsRecord) => {
        const position = record.position?.toLowerCase();
        return (
          <Badge 
            variant={
              position?.includes("1st") || position?.includes("gold") ? "success" : 
              position?.includes("2nd") || position?.includes("silver") ? "secondary" :
              position?.includes("3rd") || position?.includes("bronze") ? "warning" : 
              "outline"
            }
          >
            {record.position}
          </Badge>
        );
      }
    },
    {
      header: "Level",
      accessor: "level" as keyof SportsRecord,
    },
    {
      header: "Venue",
      accessor: "venue" as keyof SportsRecord,
    },
  ];

  return (
    <AppLayout title="Sports Records">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sports Records</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Sports Achievements</CardTitle>
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
              data={sportsRecords}
              columns={columns}
              searchable={true}
              searchFields={["eventName", "eventType", "venue", "level", "position"]}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              deleteDialogProps={{
                title: "Delete Sports Record",
                description: "Are you sure you want to delete this sports record? This action cannot be undone.",
              }}
            />
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <SportsRecordForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}
          initialData={editingRecord || undefined}
        />
      )}
    </AppLayout>
  );
};

export default Sports;
