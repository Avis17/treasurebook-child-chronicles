
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  userId: string;
}

// Create a bucket for gallery images if it doesn't exist
export const createGalleryBucket = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('gallery-images');
    if (error && error.message.includes('does not exist')) {
      await supabase.storage.createBucket('gallery-images', {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
      });
    }
    return true;
  } catch (error) {
    console.error("Error creating bucket:", error);
    return false;
  }
};

// Upload a gallery image to Supabase storage
export const uploadGalleryImage = async (
  userId: string, 
  file: File,
  title: string,
  category: string
): Promise<GalleryItem | null> => {
  try {
    // Create bucket if not exists
    await createGalleryBucket();
    
    const fileId = uuidv4();
    const fileName = `${userId}/${fileId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload the image
    const { data, error } = await supabase.storage
      .from('gallery-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('gallery-images')
      .getPublicUrl(data.path);

    // Create gallery item
    const newItem: GalleryItem = {
      id: fileId,
      title,
      url: urlData.publicUrl,
      date: new Date().toISOString().split('T')[0],
      category,
      userId
    };
    
    return newItem;
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    toast({
      title: "Error",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Delete a gallery image from Supabase storage
export const deleteGalleryImage = async (userId: string, fileId: string): Promise<boolean> => {
  try {
    // Get all user's files
    const { data } = await supabase.storage
      .from('gallery-images')
      .list(userId);
      
    if (!data) return false;
    
    // Find the file with the matching ID
    const fileToDelete = data.find(file => file.name.includes(fileId));
    if (!fileToDelete) return false;
    
    // Delete the file
    const { error } = await supabase.storage
      .from('gallery-images')
      .remove([`${userId}/${fileToDelete.name}`]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return false;
  }
};
