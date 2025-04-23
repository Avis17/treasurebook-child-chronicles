
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import { ExtraCurricularForm } from "@/components/extracurricular/ExtraCurricularForm";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ExtraCurricularRecord {
  id?: string;
  userId: string;
  activity: string;
  category: string;
  date: string;
  level: string;
  organizer: string;
  achievement: string;
  certificate: boolean;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

const Extracurricular = () => {
  const [records, setRecords] = useState<ExtraCurricularRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExtraCurricularRecord | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRecords = async (userId: string) => {
    try {
      setIsLoading(true);
      const recordsRef = collection(db, "extraCurricularRecords");
      const q = query(recordsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const fetchedRecords: ExtraCurricularRecord[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRecords.push({ id: doc.id, ...doc.data() } as ExtraCurricularRecord);
      });
      
      setRecords(fetchedRecords);
    } catch (error) {
      console.error("Error fetching extracurricular records:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load extracurricular records",
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

  const handleAddRecord = async (record: ExtraCurricularRecord) => {
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

      const docRef = await addDoc(collection(db, "extraCurricularRecords"), newRecord);
      
      setRecords([...records, { ...newRecord, id: docRef.id }]);
      
      toast({
        title: "Success",
        description: "Extracurricular record added successfully",
      });
      
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error adding extracurricular record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add extracurricular record",
      });
    }
  };

  const handleEditRecord = (record: ExtraCurricularRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleUpdateRecord = async (updatedRecord: ExtraCurricularRecord) => {
    try {
      if (!updatedRecord.id) {
        throw new Error("Record ID is missing");
      }

      const recordRef = doc(db, "extraCurricularRecords", updatedRecord.id);
      
      await updateDoc(recordRef, {
        ...updatedRecord,
        updatedAt: serverTimestamp(),
      });

      setRecords(
        records.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record
        )
      );

      toast({
        title: "Success",
        description: "Extracurricular record updated successfully",
      });
      
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating extracurricular record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update extracurricular record",
      });
    }
  };

  const handleDeleteRecord = async (record: ExtraCurricularRecord) => {
    try {
      if (!record.id) {
        throw new Error("Record ID is missing");
      }

      await deleteDoc(doc(db, "extraCurricularRecords", record.id));
      
      setRecords(records.filter((r) => r.id !== record.id));
      
      toast({
        title: "Success",
        description: "Extracurricular record deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting extracurricular record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete extracurricular record",
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  const columns = [
    {
      header: "Activity",
      accessor: "activity" as keyof ExtraCurricularRecord,
    },
    {
      header: "Category",
      accessor: "category" as keyof ExtraCurricularRecord,
    },
    {
      header: "Date",
      accessor: "date" as keyof ExtraCurricularRecord,
    },
    {
      header: "Level",
      accessor: "level" as keyof ExtraCurricularRecord,
    },
    {
      header: "Organizer",
      accessor: "organizer" as keyof ExtraCurricularRecord,
    },
    {
      header: "Achievement",
      accessor: "achievement" as keyof ExtraCurricularRecord,
    },
    {
      header: "Certificate",
      accessor: "certificate" as keyof ExtraCurricularRecord,
      render: (record: ExtraCurricularRecord) => (
        <span>{record.certificate ? "Yes" : "No"}</span>
      ),
    },
  ];

  return (
    <AppLayout title="Extracurricular Activities">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Extracurricular Activities</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Activity
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Activities & Achievements</CardTitle>
          <CardDescription>
            Track and manage all your extracurricular activities and achievements
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
              searchFields={["activity", "category", "organizer", "achievement", "level"]}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
              deleteDialogProps={{
                title: "Delete Extracurricular Record",
                description: "Are you sure you want to delete this extracurricular record? This action cannot be undone.",
              }}
            />
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <ExtraCurricularForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}
          initialData={editingRecord || undefined}
        />
      )}
    </AppLayout>
  );
};

export default Extracurricular;
