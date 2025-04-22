
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";
import Sidebar from "@/components/navigation/Sidebar";
import { List, Plus, Image } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
}

const sampleGallery: GalleryItem[] = [
  {
    id: "1",
    title: "First Day at School",
    url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1740&auto=format&fit=crop",
    date: "August 15, 2023",
    category: "School"
  },
  {
    id: "2",
    title: "Birthday Celebration",
    url: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?q=80&w=1738&auto=format&fit=crop",
    date: "June 10, 2023",
    category: "Celebration"
  },
  {
    id: "3",
    title: "Swimming Class",
    url: "https://images.unsplash.com/photo-1576013551627-0fd04733777e?q=80&w=1740&auto=format&fit=crop",
    date: "July 5, 2023",
    category: "Sports"
  },
  {
    id: "4",
    title: "Art Project",
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1471&auto=format&fit=crop",
    date: "September 3, 2023",
    category: "Arts"
  },
  {
    id: "5",
    title: "Family Vacation",
    url: "https://images.unsplash.com/photo-1535572290543-960a8046f5af?q=80&w=1470&auto=format&fit=crop",
    date: "December 24, 2023",
    category: "Travel"
  },
  {
    id: "6",
    title: "Science Fair",
    url: "https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?q=80&w=1472&auto=format&fit=crop",
    date: "February 15, 2024",
    category: "School"
  }
];

const Gallery = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
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

  const openImageModal = (image: GalleryItem) => {
    setSelectedImage(image);
  };

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
            <h1 className="text-2xl font-bold">Photo Gallery</h1>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Photo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sampleGallery.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div 
                    className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md bg-white"
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
                      <h3 className="font-medium text-sm text-gray-800">{item.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{item.date}</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full max-h-[70vh] object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{item.title}</h2>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-500">{item.date}</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {sampleGallery.length === 0 && (
            <div className="text-center py-20">
              <Image className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No photos</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new photo.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gallery;
