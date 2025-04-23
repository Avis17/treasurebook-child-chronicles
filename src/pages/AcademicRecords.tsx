
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AcademicRecord[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        // Load records from localStorage
        const loadedRecords = loadAcademicRecords().filter(
          record => record.userId === user.uid
        );
        setRecords(loadedRecords);
        setFilteredRecords(loadedRecords);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Apply filters when activeFilters changes
  useEffect(() => {
    if (records.length > 0) {
      const filtered = filterAcademicRecords(records, activeFilters);
      setFilteredRecords(filtered);
    }
  }, [activeFilters, records]);

  const handleRecordAdded = (newRecord: AcademicRecord) => {
    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveAcademicRecords(updatedRecords);
    
    // Apply any active filters to the updated records
    const filtered = filterAcademicRecords(updatedRecords, activeFilters);
    setFilteredRecords(filtered);
  };

  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(value => !!value);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">
                TreasureBook
              </h1>
              <div className="w-6"></div> {/* Placeholder for balance */}
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
              <AcademicTable 
                records={filteredRecords}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AcademicRecords;
