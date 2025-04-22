
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
import { GalleryItem, uploadGalleryImage, deleteGalleryImage } from "@/lib/gallery-service";

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("School");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
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

  useEffect(() => {
    // Load gallery items from localStorage for now
    // In a real app, this would fetch from a database
    const savedItems = localStorage.getItem('galleryItems');
    if (savedItems) {
      setGalleryItems(JSON.parse(savedItems));
    } else {
      setGalleryItems([]);
    }
  }, []);

  const saveGalleryItems = (items: GalleryItem[]) => {
    localStorage.setItem('galleryItems', JSON.stringify(items));
    setGalleryItems(items);
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
      const newItem = await uploadGalleryImage(
        auth.currentUser.uid,
        imageFile,
        title,
        category
      );

      if (newItem) {
        const updatedGallery = [...galleryItems, newItem];
        saveGalleryItems(updatedGallery);

        toast({
          title: "Success",
          description: "Photo added to gallery",
        });

        // Reset form
        setTitle("");
        setCategory("School");
        setImageFile(null);
        setIsAddDialogOpen(false);
      }
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
      const success = await deleteGalleryImage(auth.currentUser.uid, item.id);
      
      if (success) {
        const updatedGallery = galleryItems.filter(galleryItem => galleryItem.id !== item.id);
        saveGalleryItems(updatedGallery);
        
        toast({
          title: "Success",
          description: "Photo removed from gallery",
        });
      }
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
            <h1 className="text-2xl font-bold dark:text-white">Photo Gallery</h1>
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

          {galleryItems.length === 0 && (
            <div className="text-center py-20">
              <Image className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No photos</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new photo.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gallery;
