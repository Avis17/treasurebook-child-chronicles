
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { uploadImage, fetchGalleryImages, deleteImageFromStorage } from "@/lib/gallery-service";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TrashIcon, ExternalLink, Search } from "lucide-react";

interface GalleryImage {
  id: string;
  name: string;
  url: string;
  timestamp: any;
  userId: string;
  category: string;
}

const Gallery = () => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [imageCategory, setImageCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    loadImages();
  }, [currentUser, navigate]);

  const loadImages = async () => {
    try {
      if (!currentUser) return;
      
      setLoading(true);
      const fetchedImages = await fetchGalleryImages(currentUser.uid);
      setImages(fetchedImages);
    } catch (error) {
      console.error("Error loading images:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load gallery images.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !currentUser) return;
    
    try {
      setUploading(true);
      await uploadImage(selectedImage, currentUser.uid, imageCategory);
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
      setSelectedImage(null);
      loadImages();
      
      // Reset file input
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    try {
      await deleteImageFromStorage(image.id, currentUser?.uid);
      toast({
        title: "Success",
        description: "Image deleted successfully.",
      });
      loadImages();
    } catch (error) {
      console.error("Error deleting image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image.",
      });
    }
  };

  const categoryOptions = [
    "general", 
    "academic", 
    "extracurricular", 
    "sports", 
    "events", 
    "awards", 
    "projects", 
    "field trips",
    "personal"
  ];

  // Filter images by category and search query
  const filteredImages = images.filter(image => {
    const categoryMatch = selectedCategory === 'all' || image.category === selectedCategory;
    const searchMatch = !searchQuery || 
      image.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && searchMatch;
  });

  return (
    <AppLayout title="Gallery">
      <div className="space-y-6 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Upload New Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image">Select Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Image Category</Label>
                <Select value={imageCategory} onValueChange={setImageCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedImage || uploading}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-12 w-12 border-t-2 border-primary rounded-full"></div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-16 bg-muted/40 rounded-lg">
              <p className="text-muted-foreground">No images found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
                      {image.category}
                    </div>
                  </div>
                  <CardFooter className="flex justify-between p-3">
                    <div className="max-w-[70%] overflow-hidden">
                      <p className="text-sm font-medium truncate">{image.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => window.open(image.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(image)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Gallery;
