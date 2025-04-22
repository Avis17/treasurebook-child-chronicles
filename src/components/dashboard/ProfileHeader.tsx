
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Pencil } from "lucide-react";
import { uploadProfileImage } from "@/lib/supabase-storage";

interface ProfileData {
  childName: string;
  currentClass: string;
  age: string;
  photoURL: string;
}

const ProfileHeader = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          setProfileData(profileDoc.data() as ProfileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 1MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageFile(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!imageFile || !auth.currentUser) return;

    setUploading(true);
    try {
      // Upload to Supabase storage
      const downloadURL = await uploadProfileImage(auth.currentUser.uid, imageFile);
      
      if (!downloadURL) {
        throw new Error("Failed to upload image");
      }

      const profileRef = doc(db, "profiles", auth.currentUser.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        await updateDoc(profileRef, { photoURL: downloadURL });
      } else {
        await setDoc(profileRef, {
          photoURL: downloadURL,
          childName: "",
          currentClass: "Pre-KG",
          age: "",
          email: auth.currentUser.email || "",
          createdAt: new Date(),
        });
      }
      
      setProfileData(prev => {
        if (prev) {
          return { ...prev, photoURL: downloadURL };
        }
        return prev;
      });

      toast({
        title: "Success",
        description: "Profile photo updated",
      });
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="relative">
        <Avatar className="h-24 w-24 border-2 border-treasure-blue">
          <AvatarImage src={profileData?.photoURL} alt={profileData?.childName} />
          <AvatarFallback className="text-2xl bg-treasure-lightBlue text-treasure-blue dark:bg-blue-950 dark:text-blue-300">
            {profileData?.childName ? profileData.childName[0].toUpperCase() : "?"}
          </AvatarFallback>
        </Avatar>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="icon" 
              variant="outline" 
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white dark:bg-gray-800"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Update Profile Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {imageFile && (
                <div className="flex justify-center">
                  <img 
                    src={imageFile} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-full" 
                  />
                </div>
              )}
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="dark:bg-gray-700 dark:text-white" 
              />
              <Button 
                onClick={handleImageUpload} 
                disabled={!imageFile || uploading} 
                className="w-full"
              >
                {uploading ? "Uploading..." : "Save Photo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{profileData?.childName || "Child's Name"}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 dark:text-gray-300 mt-1">
          <span className="bg-treasure-lightBlue text-treasure-blue dark:bg-blue-950 dark:text-blue-300 px-2 py-1 rounded-full text-sm font-medium">
            {profileData?.currentClass || "Pre-KG"}
          </span>
          <span className="text-sm">{profileData?.age || "3+"} years old</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
