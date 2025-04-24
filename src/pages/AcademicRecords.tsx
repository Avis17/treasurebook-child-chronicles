import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/navigation/Sidebar";
import { 
  AcademicRecord,
  saveAcademicRecords, 
  loadAcademicRecords,
  filterAcademicRecords
} from "@/lib/academic-service";
import { AcademicFilters, FilterOptions } from "@/components/academic/AcademicFilters";
import { AcademicRecordForm } from "@/components/academic/AcademicRecordForm";
import { AcademicTable } from "@/components/academic/AcademicTable";
import AppLayout from "@/components/layout/AppLayout";

const AcademicRecords = () => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRecords = async (userId: string) => {
    try {
      setLoading(true);
      const recordsRef = collection(db, "academicRecords");
      const q = query(recordsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const fetchedRecords: AcademicRecord[] = [];
      querySnapshot.forEach((doc) => {
        fetchedRecords.push({ id: doc.id, ...doc.data() } as AcademicRecord);
      });
      
      console.log("Fetched academic records:", fetchedRecords.length);
      setRecords(fetchedRecords);
      setFilteredRecords(fetchedRecords);
    } catch (error) {
      console.error("Error fetching academic records:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load academic records",
      });
      const loadedRecords = loadAcademicRecords().filter(
        record => record.userId === userId
      );
      setRecords(loadedRecords);
      setFilteredRecords(loadedRecords);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        console.log("Fetching records for user:", user.uid);
        fetchRecords(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (records.length > 0) {
      const processedFilters = Object.entries(activeFilters).reduce((acc, [key, value]) => {
        acc[key] = value === "all" ? "" : value;
        return acc;
      }, {} as FilterOptions);
      
      const filtered = filterAcademicRecords(records, processedFilters);
      setFilteredRecords(filtered);
    }
  }, [activeFilters, records]);

  const handleRecordAdded = (newRecord: AcademicRecord) => {
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveAcademicRecords(updatedRecords);
    
    const processedFilters = Object.entries(activeFilters).reduce((acc, [key, value]) => {
      acc[key] = value === "all" ? "" : value;
      return acc;
    }, {} as FilterOptions);
    
    const filtered = filterAcademicRecords(updatedRecords, processedFilters);
    setFilteredRecords(filtered);
    
    toast({
      title: "Success",
      description: "Academic record added successfully",
    });
    setIsFormOpen(false);
  };

  const handleEditRecord = (record: AcademicRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleDeleteRecord = async (record: AcademicRecord) => {
    try {
      if (!record.id) {
        throw new Error("Record ID is missing");
      }

      await deleteDoc(doc(db, "academicRecords", record.id));
      
      const updatedRecords = records.filter((r) => r.id !== record.id);
      setRecords(updatedRecords);
      
      const processedFilters = Object.entries(activeFilters).reduce((acc, [key, value]) => {
        acc[key] = value === "all" ? "" : value;
        return acc;
      }, {} as FilterOptions);
      
      const filtered = filterAcademicRecords(updatedRecords, processedFilters);
      setFilteredRecords(filtered);
      
      toast({
        title: "Success",
        description: "Academic record deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting academic record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete academic record",
      });
    }
  };

  const handleUpdateRecord = async (updatedRecord: AcademicRecord) => {
    try {
      if (!updatedRecord.id) {
        throw new Error("Record ID is missing");
      }

      const recordRef = doc(db, "academicRecords", updatedRecord.id);
      
      const { id, ...recordData } = updatedRecord;
      
      await updateDoc(recordRef, recordData);

      const updatedRecords = records.map((record) =>
        record.id === updatedRecord.id ? updatedRecord : record
      );
      
      setRecords(updatedRecords);
      
      const processedFilters = Object.entries(activeFilters).reduce((acc, [key, value]) => {
        acc[key] = value === "all" ? "" : value;
        return acc;
      }, {} as FilterOptions);
      
      const filtered = filterAcademicRecords(updatedRecords, processedFilters);
      setFilteredRecords(filtered);
      
      toast({
        title: "Success",
        description: "Academic record updated successfully",
      });
      
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error updating academic record:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update academic record",
      });
    }
  };

  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => !!value && value !== "all");

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
  };

  return (
    <AppLayout title="Academic Records">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <AcademicFilters 
            onApplyFilters={applyFilters}
            hasActiveFilters={hasActiveFilters}
          />
          <AcademicRecordForm 
            onRecordAdded={handleRecordAdded} 
            onRecordUpdated={handleUpdateRecord}
            initialData={editingRecord}
            isOpen={isFormOpen}
            onClose={closeForm}
          />
        </div>
      </div>

      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="dark:text-white">Subject Performance</CardTitle>
          <CardDescription className="dark:text-gray-300">
            Track academic progress across different subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
            </div>
          ) : (
            <AcademicTable 
              records={filteredRecords}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              onEdit={handleEditRecord}
              onDelete={handleDeleteRecord}
            />
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default AcademicRecords;
