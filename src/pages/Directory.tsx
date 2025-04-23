
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from "@/components/navigation/Sidebar";
import { List } from "lucide-react";
import { DirectoryForm } from "@/components/directory/DirectoryForm";
import { DirectoryTable } from "@/components/directory/DirectoryTable";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  userId: string;
}

const Directory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch contacts from Firebase
  const fetchContacts = async (userId: string) => {
    try {
      setLoading(true);
      const contactsRef = collection(db, "contacts");
      const q = query(contactsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const fetchedContacts: Contact[] = [];
      querySnapshot.forEach((doc) => {
        fetchedContacts.push({ 
          id: doc.id, 
          ...doc.data() 
        } as Contact);
      });
      
      setContacts(fetchedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contacts"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        fetchContacts(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleContactAdded = (newContact: Contact) => {
    // Refetch the contacts list after a contact is added or updated
    if (auth.currentUser) {
      fetchContacts(auth.currentUser.uid);
    }
  };

  const handleContactDeleted = () => {
    // Refetch contacts after deletion
    if (auth.currentUser) {
      fetchContacts(auth.currentUser.uid);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 overflow-auto">
        {isMobile && (
          <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b shadow-sm z-10">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)}
              >
                <List className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">
                TreasureBook
              </h1>
              <div className="w-6"></div>
            </div>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">Contact Directory</h1>
            <DirectoryForm onContactAdded={handleContactAdded} />
          </div>

          <Card className="dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="dark:text-white">My Contacts</CardTitle>
              <CardDescription className="dark:text-gray-300">
                Manage your personal and professional contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
                </div>
              ) : (
                <DirectoryTable 
                  contacts={contacts}
                  onContactDeleted={handleContactDeleted}
                  onContactUpdated={handleContactAdded}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Directory;
