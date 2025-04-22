
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Create a bucket for profile images if it doesn't exist
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

// Upload a profile image to Supabase storage
export const uploadProfileImage = async (userId: string, file: File | string): Promise<string | null> => {
  try {
    // Create bucket if not exists
    const bucketCreated = await createProfileImageBucket();
    if (!bucketCreated) {
      throw new Error("Failed to create or access storage bucket");
    }
    
    // Upload the image
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
    
    const fileName = `${userId}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, fileData, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path);
      
    return urlData.publicUrl;
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

// Delete a profile image from Supabase storage
export const deleteProfileImage = async (url: string): Promise<boolean> => {
  try {
    const path = url.split('/').pop();
    if (!path) return false;
    
    const { error } = await supabase.storage
      .from('profile-images')
      .remove([path]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return false;
  }
};
