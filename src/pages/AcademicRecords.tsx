
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
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
import { List } from "lucide-react";
import { 
  AcademicRecord,
  saveAcademicRecords, 
  loadAcademicRecords,
  filterAcademicRecords
} from "@/lib/academic-service";
import { AcademicFilters, FilterOptions } from "@/components/academic/AcademicFilters";
import { AcademicRecordForm } from "@/components/academic/AcademicRecordForm";
import { AcademicTable } from "@/components/academic/AcademicTable";

const AcademicRecords = () => {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [loading, setLoading] = useState(true);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch records from Firebase instead of localStorage
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
      
      setRecords(fetchedRecords);
      setFilteredRecords(fetchedRecords);
    } catch (error) {
      console.error("Error fetching academic records:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load academic records",
      });
      // Fallback to localStorage if Firebase fails
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
        fetchRecords(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Apply filters when activeFilters changes
  useEffect(() => {
    if (records.length > 0) {
      // Convert "all" values to empty strings for filtering
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
    
    // Apply any active filters to the updated records
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
  };

  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => !!value && value !== "all");

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} />

      <div className="flex-1 overflow-auto md:ml-64">
        {isMobile && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">
                TreasureBook
              </h1>
              <div className="w-6"></div>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Academic Records</h1>
            <div className="flex space-x-2">
              <AcademicFilters 
                onApplyFilters={applyFilters}
                hasActiveFilters={hasActiveFilters}
              />
              <AcademicRecordForm onRecordAdded={handleRecordAdded} />
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
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AcademicRecords;
