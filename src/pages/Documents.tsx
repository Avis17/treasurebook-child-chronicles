import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Upload, Download, Trash2, Search, Filter, Plus, File, Image, FileArchive } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Document {
  id?: string;
  fileName: string;
  description: string;
  category: string;
  fileType: string;
  fileURL: string;
  storageRef: string;
  uploadDate: string;
  userId: string;
  fileSize?: number;
}

const categories = [
  { name: "Academic Records", icon: <FileText className="h-4 w-4" /> },
  { name: "Certificates", icon: <FileText className="h-4 w-4" /> },
  { name: "ID Documents", icon: <FileText className="h-4 w-4" /> },
  { name: "Medical Records", icon: <FileText className="h-4 w-4" /> },
  { name: "Report Cards", icon: <FileText className="h-4 w-4" /> },
  { name: "Others", icon: <FileText className="h-4 w-4" /> },
];

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Document>>({
    fileName: "",
    description: "",
    category: "Academic Records",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const documentsRef = collection(db, "documents");
      const q = query(
        documentsRef,
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const documentsData: Document[] = [];
      querySnapshot.forEach((doc) => {
        documentsData.push({
          id: doc.id,
          ...doc.data() as Document
        });
      });
      
      documentsData.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
      
      setDocuments(documentsData);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents",
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, fileName: file.name }));
    }
  };

  const getFileType = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'doc';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'spreadsheet';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return 'presentation';
    } else {
      return 'other';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <Image className="h-10 w-10 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-10 w-10 text-red-500" />;
      case 'doc':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'spreadsheet':
        return <FileText className="h-10 w-10 text-green-500" />;
      case 'presentation':
        return <FileText className="h-10 w-10 text-orange-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const user = auth.currentUser;
      if (!user) return;

      setIsUploading(true);
      setUploadProgress(10);
      
      const fileType = getFileType(selectedFile);
      const storageReference = ref(storage, `documents/${user.uid}/${Date.now()}_${selectedFile.name}`);
      
      await uploadBytes(storageReference, selectedFile);
      setUploadProgress(70);
      
      const downloadURL = await getDownloadURL(storageReference);
      
      const documentData: Document = {
        fileName: formData.fileName || selectedFile.name,
        description: formData.description || "",
        category: formData.category || "Academic Records",
        fileType: fileType,
        fileURL: downloadURL,
        storageRef: storageReference.fullPath,
        uploadDate: new Date().toISOString(),
        userId: user.uid,
        fileSize: selectedFile.size
      };
      
      setUploadProgress(90);
      
      await addDoc(collection(db, "documents"), documentData);
      
      setUploadProgress(100);
      
      toast({
        title: "Document uploaded",
        description: "Your document has been successfully uploaded",
      });
      
      resetForm();
      fetchDocuments();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (document: Document) => {
    try {
      if (!document.id) return;
      
      const storageRef = ref(storage, document.storageRef);
      await deleteObject(storageRef);
      
      await deleteDoc(doc(db, "documents", document.id));
      
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted",
      });
      
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      fileName: "",
      description: "",
      category: "Academic Records",
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const categoryMatch = selectedCategory === "all" || doc.category === selectedCategory;
    const searchMatch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  if (loading) {
    return (
      <AppLayout title="Documents">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Documents" hideHeader={true}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Documents</h1>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}>
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Upload important school-related PDFs, ID scans, etc.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="file" className="text-sm font-medium">Select File</label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleFileChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="fileName" className="text-sm font-medium">File Name</label>
                  <Input
                    id="fileName"
                    name="fileName"
                    value={formData.fileName || ""}
                    onChange={handleInputChange}
                    placeholder="Display name for this document"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    placeholder="Brief description of this document"
                    className="w-full p-2 rounded border min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          <div className="flex items-center">
                            {category.icon}
                            <span className="ml-2">{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <label className="text-sm">Upload Progress</label>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-center">{uploadProgress}%</p>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => {
                    resetForm();
                    setOpenDialog(false);
                  }} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading || !selectedFile}>
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center">
                          {category.icon}
                          <span className="ml-2">{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <FileArchive className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">No documents uploaded yet</h3>
                <p className="text-muted-foreground">Upload important documents for safekeeping</p>
              </div>
              <Button onClick={() => setOpenDialog(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">No matching documents</h3>
                <p className="text-muted-foreground">Try changing your search or category filter</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="overflow-hidden">
                <div className="flex items-center justify-center p-6 bg-muted/20">
                  {getFileIcon(document.fileType)}
                </div>
                <CardHeader className="p-4 pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base truncate" title={document.fileName}>
                        {document.fileName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {document.uploadDate && format(new Date(document.uploadDate), "MMM d, yyyy")}
                        {document.fileSize && ` • ${formatFileSize(document.fileSize)}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm text-muted-foreground line-clamp-2" title={document.description}>
                    {document.description || "No description provided"}
                  </p>
                  <Badge className="mt-2" variant="outline">
                    {document.category}
                  </Badge>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <a href={document.fileURL} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-1" /> Download
                    </a>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(document)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default DocumentsPage;
