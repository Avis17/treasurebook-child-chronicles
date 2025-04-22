import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// This function is kept for future Supabase storage use if needed
export const createProfileImageBucket = async () => {
  try {
    // Correct API call - using getBucket instead of 'bucket'
    const { data, error } = await supabase.storage.getBucket('profile-images');
    
    if (error && error.message.includes('does not exist')) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('profile-images', {
        public: true,
        fileSizeLimit: 1024 * 1024, // 1MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking/creating bucket:", error);
    return false;
  }
};

// Upload a profile image to Firebase storage instead of Supabase
export const uploadProfileImage = async (userId: string, file: File | string): Promise<string | null> => {
  try {
    // Upload the image to Firebase Storage
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
