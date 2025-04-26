import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  date: string;
  category: string;
  userId: string;
}

// Export the function names that are being imported in Gallery.tsx
export const uploadImage = async (
  file: File,
  userId: string,
  category: string
): Promise<{ id: string; name: string; url: string; timestamp: any; userId: string; category: string } | null> => {
  try {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
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
    const newItem = {
      id: fileId,
      name: file.name,
      url: downloadURL,
      timestamp: serverTimestamp(),
      userId,
      category
    };
    
    // Save metadata to Firestore
    await addDoc(collection(db, "gallery"), newItem);
    
    return newItem;
  } catch (error) {
    console.error("Error uploading image:", error);
    toast({
      title: "Error",
      description: "Failed to upload image. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Rename to match the import in Gallery.tsx
export const fetchGalleryImages = async (userId: string) => {
  try {
    const galleryQuery = query(
      collection(db, "gallery"), 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(galleryQuery);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.data().id || doc.id,
    }));
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return [];
  }
};

// Rename to match the import in Gallery.tsx
export const deleteImageFromStorage = async (imageId: string, userId?: string | null) => {
  try {
    if (!userId) {
      console.error("No user ID provided for deletion");
      return false;
    }
    
    // Find the metadata record in Firestore
    const galleryQuery = query(
      collection(db, "gallery"), 
      where("id", "==", imageId),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(galleryQuery);
    
    if (querySnapshot.empty) {
      return false;
    }
    
    const galleryDoc = querySnapshot.docs[0];
    const galleryData = galleryDoc.data();
    
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

// Keep the original functions with their original names for backward compatibility
export const uploadGalleryImage = uploadImage;
export const getUserGalleryImages = fetchGalleryImages;
export const deleteGalleryImage = deleteImageFromStorage;
