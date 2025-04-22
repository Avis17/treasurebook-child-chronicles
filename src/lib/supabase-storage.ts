
import { toast } from "@/components/ui/use-toast";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";

// Upload a profile image to Firebase storage
export const uploadProfileImage = async (userId: string, file: File | string): Promise<string | null> => {
  try {
    // Check file size (1MB limit)
    let fileData: File | Blob;
    
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Convert data URL to blob
      const res = await fetch(file);
      fileData = await res.blob();
    } else if (file instanceof File) {
      fileData = file;
    } else {
      throw new Error("Invalid file format");
    }
    
    // Check file size (1MB limit)
    if (fileData.size > 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 1MB",
        variant: "destructive",
      });
      return null;
    }
    
    const fileName = `profile-images/${userId}-${Date.now()}`;
    const storageRef = ref(storage, fileName);
    
    // Upload to Firebase Storage
    await uploadBytes(storageRef, fileData);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    toast({
      title: "Error",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Delete a profile image from Firebase storage
export const deleteProfileImage = async (url: string): Promise<boolean> => {
  try {
    // Extract file path from Firebase Storage URL
    const storageRef = ref(storage, url);
    
    await deleteObject(storageRef);
    
    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return false;
  }
};
