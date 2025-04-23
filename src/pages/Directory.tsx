
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, where } from "firebase/firestore";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/shared/DataTable";

interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  createdBy?: string;
}

const Directory = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Omit<Contact, "id" | "createdBy">>({
    name: "",
    email: "",
    phone: "",
    relation: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to view contacts",
        });
        return;
      }

      // Create a query against the directory collection
      const contactsQuery = query(
        collection(db, "contacts"),
        where("createdBy", "==", user.uid)
      );
      const querySnapshot = await getDocs(contactsQuery);
      
      const contactsList: Contact[] = [];
      querySnapshot.forEach((doc) => {
        contactsList.push({ id: doc.id, ...doc.data() } as Contact);
      });
      
      setContacts(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load contacts directory",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to add a contact",
        });
        return;
      }
      
      // Validate required fields
      if (!newContact.name || !newContact.relation) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Name and relation are required",
        });
        return;
      }

      // Add the contact to Firestore
      const docRef = await addDoc(collection(db, "contacts"), {
        ...newContact,
        createdBy: user.uid,
        timestamp: serverTimestamp(),
      });

      // Add the new contact to the state
      const addedContact = {
        id: docRef.id,
        ...newContact,
        createdBy: user.uid,
      };
      setContacts([...contacts, addedContact]);

      // Reset form and close dialog
      setNewContact({
        name: "",
        email: "",
        phone: "",
        relation: "",
      });
      setIsAddDialogOpen(false);

      toast({
        title: "Contact Added",
        description: `${newContact.name} has been added to your directory`,
      });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add contact",
      });
    }
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (!contact.id) return;
    
    try {
      await deleteDoc(doc(db, "contacts", contact.id));
      
      setContacts(contacts.filter(c => c.id !== contact.id));
      
      toast({
        title: "Contact Deleted",
        description: `${contact.name} has been removed from your directory`,
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact",
      });
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name" as keyof Contact,
      sortable: true,
    },
    {
      header: "Relation",
      accessor: "relation" as keyof Contact,
      sortable: true,
    },
    {
      header: "Email",
      accessor: "email" as keyof Contact,
    },
    {
      header: "Phone",
      accessor: "phone" as keyof Contact,
    },
  ];

  return (
    <AppLayout title="Directory">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Contact Directory</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newContact.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relation">Relation</Label>
                  <Input
                    id="relation"
                    name="relation"
                    value={newContact.relation}
                    onChange={handleInputChange}
                    placeholder="E.g., Teacher, Friend, Family"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newContact.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newContact.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Contact</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-6 h-6 border-t-2 border-b-2 border-blue-500 rounded-full"></div>
          </div>
        ) : (
          <DataTable
            data={contacts}
            columns={columns}
            searchable
            searchFields={["name", "email", "relation", "phone"]}
            onDelete={handleDeleteContact}
            deleteDialogProps={{
              title: "Delete Contact",
              description: "Are you sure you want to delete this contact? This action cannot be undone.",
            }}
          />
        )}

        {contacts.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              You haven't added any contacts yet. Add your first contact to get started.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Directory;
