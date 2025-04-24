
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download, Database, FileDown, ArrowDownToLine, Calendar, Award, BookText, MessageSquare, FileText, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface DataCollection {
  name: string;
  label: string;
  icon: JSX.Element;
  selected: boolean;
}

const BackupExportPage = () => {
  const [collections, setCollections] = useState<DataCollection[]>([
    { name: "profiles", label: "Profile Information", icon: <Database className="h-4 w-4" />, selected: true },
    { name: "academics", label: "Academic Records", icon: <FileText className="h-4 w-4" />, selected: true },
    { name: "sports", label: "Sports Records", icon: <Award className="h-4 w-4" />, selected: true },
    { name: "extracurricular", label: "Extracurricular", icon: <Award className="h-4 w-4" />, selected: true },
    { name: "milestones", label: "Milestones", icon: <Calendar className="h-4 w-4" />, selected: true },
    { name: "goals", label: "Goals & Vision", icon: <Award className="h-4 w-4" />, selected: true },
    { name: "journal", label: "Journal Entries", icon: <BookText className="h-4 w-4" />, selected: true },
    { name: "feedback", label: "Feedback Notes", icon: <MessageSquare className="h-4 w-4" />, selected: true },
    // Documents collection is handled differently since it contains file references
  ]);
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectAll, setSelectAll] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const allSelected = collections.every(col => col.selected);
    setSelectAll(allSelected);
  }, [collections]);

  const handleExport = async () => {
    const selectedCollections = collections.filter(col => col.selected);
    
    if (selectedCollections.length === 0) {
      toast({
        title: "No collections selected",
        description: "Please select at least one collection to export",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setProgress(0);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const exportData: Record<string, any> = {
        metadata: {
          exportDate: new Date().toISOString(),
          userId: user.uid,
          email: user.email,
          collections: selectedCollections.map(col => col.name),
        }
      };

      let completed = 0;
      
      for (const collectionItem of selectedCollections) {
        const collectionRef = collectionItem.name;
        const q = query(
          collection(db, collectionRef),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const collectionData: any[] = [];
        
        querySnapshot.forEach((doc) => {
          collectionData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        exportData[collectionItem.name] = collectionData;
        
        completed++;
        setProgress(Math.floor((completed / selectedCollections.length) * 100));
      }
      
      // Convert to JSON and create download
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `treasurebook_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Successfully exported ${selectedCollections.length} collections`,
      });
      
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setProgress(0);
      }, 2000);
    }
  };

  const handleToggleSelectAll = () => {
    const newSelectAllValue = !selectAll;
    setSelectAll(newSelectAllValue);
    
    const updatedCollections = collections.map(col => ({
      ...col,
      selected: newSelectAllValue
    }));
    
    setCollections(updatedCollections);
  };

  const handleToggleCollection = (index: number) => {
    const updatedCollections = [...collections];
    updatedCollections[index].selected = !updatedCollections[index].selected;
    setCollections(updatedCollections);
  };

  return (
    <AppLayout title="Backup & Export">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Backup & Export</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Export your data</CardTitle>
            <CardDescription>
              Download your data as a JSON file for safekeeping or transfer to another system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="selectAll" 
                checked={selectAll} 
                onCheckedChange={handleToggleSelectAll}
              />
              <Label htmlFor="selectAll" className="font-medium">Select All Collections</Label>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((col, index) => (
                <div key={col.name} className="flex items-center space-x-2">
                  <Checkbox 
                    id={col.name}
                    checked={col.selected}
                    onCheckedChange={() => handleToggleCollection(index)}
                  />
                  <Label htmlFor={col.name} className="flex items-center">
                    {col.icon}
                    <span className="ml-2">{col.label}</span>
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Note: Document files (PDFs, images, etc.) must be downloaded separately from the Documents page.
                </p>
              </div>
              
              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exporting data...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              <Button 
                onClick={handleExport}
                disabled={loading || collections.every(col => !col.selected)}
                className="w-full md:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="mr-2 h-4 w-4" />
                    Export Selected Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Data Management Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium">Regular Backups</h3>
                <p className="text-sm text-muted-foreground">
                  We recommend exporting your data regularly to ensure you always have a backup.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Secure Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Store your exported data in a secure location, such as an encrypted drive or password-protected folder.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Document Files</h3>
                <p className="text-sm text-muted-foreground">
                  Remember to download your document files separately from the Documents page.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Data Restoration</h3>
                <p className="text-sm text-muted-foreground">
                  If you need to restore your data, please contact our support team for assistance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default BackupExportPage;
