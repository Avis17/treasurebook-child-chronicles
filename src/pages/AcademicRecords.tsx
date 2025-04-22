
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Sidebar from "@/components/navigation/Sidebar";
import { List, Plus } from "lucide-react";

interface AcademicRecord {
  id: string;
  year: string;
  subject: string;
  score: number;
  grade: string;
  remarks: string;
}

const sampleRecords: AcademicRecord[] = [
  {
    id: "1",
    year: "2024",
    subject: "Mathematics",
    score: 92,
    grade: "A",
    remarks: "Excellent understanding of concepts",
  },
  {
    id: "2",
    year: "2024",
    subject: "English",
    score: 88,
    grade: "B+",
    remarks: "Good vocabulary and writing skills",
  },
  {
    id: "3",
    year: "2024",
    subject: "Science",
    score: 95,
    grade: "A+",
    remarks: "Outstanding performance in experiments",
  },
  {
    id: "4",
    year: "2024",
    subject: "Social Studies",
    score: 85,
    grade: "B+",
    remarks: "Good grasp of historical concepts",
  },
];

const AcademicRecords = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="sticky top-0 bg-white p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue">
                TreasureBook
              </h1>
              <div className="w-6"></div> {/* Placeholder for balance */}
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Academic Records</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Record
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subject Performance</CardTitle>
              <CardDescription>
                Track academic progress across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Remarks
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.year}</TableCell>
                        <TableCell>{record.subject}</TableCell>
                        <TableCell>{record.score}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.grade.startsWith("A")
                                ? "bg-green-100 text-green-800"
                                : record.grade.startsWith("B")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {record.grade}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {record.remarks}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AcademicRecords;
