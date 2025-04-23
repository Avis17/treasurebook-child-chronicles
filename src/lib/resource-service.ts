
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
}

// Function to create and save a new resource to Firebase
export const createResource = async (
  data: Omit<Resource, "id" | "createdAt" | "updatedAt">, 
): Promise<Resource | null> => {
  try {
    const resourceData = {
      ...data,
      id: uuidv4(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "resources"), resourceData);
    
    return {
      ...resourceData,
      id: docRef.id
    };
  } catch (error) {
    console.error("Error creating resource:", error);
    return null;
  }
};

// Function to update a resource
export const updateResource = async (resource: Resource): Promise<boolean> => {
  try {
    const { id, ...data } = resource;
    
    await updateDoc(doc(db, "resources", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error updating resource:", error);
    return false;
  }
};

// Function to delete a resource
export const deleteResource = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "resources", id));
    return true;
  } catch (error) {
    console.error("Error deleting resource:", error);
    return false;
  }
};

// Function to fetch all resources for a user
export const fetchResources = async (userId: string): Promise<Resource[]> => {
  try {
    const resourcesQuery = query(
      collection(db, "resources"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(resourcesQuery);
    
    const resources: Resource[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      resources.push({
        ...data,
        id: doc.id,
      } as Resource);
    });
    
    return resources;
  } catch (error) {
    console.error("Error fetching resources:", error);
    return [];
  }
};

// Function to toggle favorite status
export const toggleResourceFavorite = async (resource: Resource): Promise<boolean> => {
  try {
    const updatedResource = {
      ...resource,
      isFavorite: !resource.isFavorite,
    };
    
    return await updateResource(updatedResource);
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    return false;
  }
};
