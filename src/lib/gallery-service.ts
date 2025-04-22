import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  userId: string;
}

// Upload a gallery image to Firebase storage with 1MB limit
export const uploadGalleryImage = async (
  userId: string, 
  file: File,
  title: string,
  category: string
): Promise<GalleryItem | null> => {
  try {
    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 1MB",
        variant: "destructive",
      });
      return null;
    }

    const fileId = uuidv4();
    const fileName = `gallery-images/${userId}/${fileId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload the image to Firebase Storage
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    // Create gallery item
    const newItem: GalleryItem = {
      id: fileId,
      title,
      url: downloadURL,
      date: new Date().toISOString().split('T')[0],
      category,
      userId
    };
    
    // Save metadata to Firestore
    await addDoc(collection(db, "gallery"), newItem);
    
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

// Delete a gallery image from Firebase storage
export const deleteGalleryImage = async (userId: string, fileId: string): Promise<boolean> => {
  try {
    // Find the metadata record in Firestore
    const galleryQuery = query(
      collection(db, "gallery"), 
      where("id", "==", fileId),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(galleryQuery);
    
    if (querySnapshot.empty) {
      return false;
    }
    
    const galleryDoc = querySnapshot.docs[0];
    const galleryData = galleryDoc.data() as GalleryItem;
    
    // Delete from Firebase Storage
    if (galleryData.url) {
      try {
        // Extract storage reference from URL
        const fileRef = ref(storage, galleryData.url);
        await deleteObject(fileRef);
      } catch (storageError) {
        console.error("Error deleting from storage:", storageError);
      }
    }
    
    // Delete metadata from Firestore
    await deleteDoc(doc(db, "gallery", galleryDoc.id));
    
    return true;
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return false;
  }
};

// Get all gallery images for a user
export const getUserGalleryImages = async (userId: string): Promise<GalleryItem[]> => {
  try {
    const galleryQuery = query(
      collection(db, "gallery"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(galleryQuery);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.data().id || doc.id,
    })) as GalleryItem[];
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
};
