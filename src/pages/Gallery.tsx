
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/navigation/Sidebar";
import { List, Plus, Image, Trash2 } from "lucide-react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import AppLayout from "@/components/layout/AppLayout";

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  userId: string;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("School");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        // Fetch gallery items when user is logged in
        fetchGalleryItems(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchGalleryItems = async (userId: string) => {
    try {
      setLoading(true);
      const galleryQuery = query(
        collection(db, "gallery"), 
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(galleryQuery);
      
      const items: GalleryItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title,
          url: data.url,
          date: data.date || new Date().toISOString().split('T')[0],
          category: data.category,
          userId: data.userId
        });
      });
      
      setGalleryItems(items);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB max
      setImageFile(file);
    } else if (file) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      e.target.value = '';
    }
  };

  const handleAddImage = async () => {
    if (!imageFile || !title || !category || !auth.currentUser) return;

    setUploading(true);
    try {
      const userId = auth.currentUser.uid;
      const fileId = Date.now().toString();
      const fileName = `gallery-images/${userId}/${fileId}-${imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload the image to Firebase Storage
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, imageFile);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Create gallery item metadata
      const newItem: Omit<GalleryItem, 'id'> = {
        title,
        url: downloadURL,
        date: new Date().toISOString().split('T')[0],
        category,
        userId,
      };
      
      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, "gallery"), {
        ...newItem,
        createdAt: serverTimestamp()
      });
      
      // Update local state
      setGalleryItems([...galleryItems, { ...newItem, id: docRef.id }]);
      
      toast({
        title: "Success",
        description: "Photo added to gallery",
      });

      // Reset form
      setTitle("");
      setCategory("School");
      setImageFile(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding image:", error);
      toast({
        title: "Error",
        description: "Failed to add image to gallery",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (item: GalleryItem) => {
    if (!auth.currentUser) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "gallery", item.id));
      
      // Extract filename from URL
      if (item.url) {
        try {
          // Delete from Firebase Storage
          const storageRef = ref(storage, item.url);
          await deleteObject(storageRef);
        } catch (storageError) {
          console.error("Error deleting from storage:", storageError);
        }
      }
      
      // Update state
      setGalleryItems(galleryItems.filter(galleryItem => galleryItem.id !== item.id));
      
      toast({
        title: "Success",
        description: "Photo removed from gallery",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const openImageModal = (image: GalleryItem) => {
    setSelectedImage(image);
  };

  return (
    <AppLayout title="Gallery">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Photo Gallery</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Add New Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {imageFile && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="w-full h-40 object-cover" 
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="photo-upload" className="dark:text-gray-300">Photo</Label>
                <Input 
                  id="photo-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="dark:text-gray-300">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for this photo"
                  className="dark:bg-gray-700 dark:text-white" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700">
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Celebration">Celebration</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddImage} 
                disabled={!imageFile || !title || uploading}
              >
                {uploading ? "Uploading..." : "Add Photo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div 
                  className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800"
                  onClick={() => openImageModal(item)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-800 dark:text-gray-100">{item.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.date}</span>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl dark:bg-gray-800">
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.title}
                      className="w-full max-h-[70vh] object-contain"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold dark:text-white">{item.title}</h2>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{item.date}</span>
                        <span className="ml-2 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => handleDeleteImage(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {galleryItems.length === 0 && !loading && (
        <div className="text-center py-20">
          <Image className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No photos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new photo.</p>
        </div>
      )}
    </AppLayout>
  );
};

export default Gallery;
