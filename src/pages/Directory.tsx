
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/shared/DataTable";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Globe, Facebook, Twitter, Instagram } from "lucide-react";

interface ContactSocial {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  photoURL?: string;
  social?: ContactSocial;
  type: "teacher" | "friend" | "other";
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Ms. Sarah Johnson",
    role: "Head Teacher",
    email: "sarah.johnson@school.edu",
    phone: "555-123-4567",
    photoURL: "",
    social: {
      website: "https://school.edu/staff/sjohnson"
    },
    type: "teacher",
  },
  {
    id: "2",
    name: "Mr. Robert Chen",
    role: "Math Teacher",
    email: "robert.chen@school.edu",
    phone: "555-234-5678",
    photoURL: "",
    type: "teacher",
  },
  {
    id: "3",
    name: "Mrs. Diana Patel",
    role: "Art Teacher",
    email: "diana.patel@school.edu",
    photoURL: "",
    social: {
      instagram: "artwithdianapatel"
    },
    type: "teacher",
  },
  {
    id: "4",
    name: "Ethan Smith",
    role: "Classmate",
    email: "ethan.parent@email.com",
    photoURL: "",
    type: "friend",
  },
  {
    id: "5",
    name: "Olivia Garcia",
    role: "Classmate",
    email: "olivia.parent@email.com",
    photoURL: "",
    type: "friend",
  },
  {
    id: "6",
    name: "Noah Wilson",
    role: "Friend from Art Class",
    email: "noah.parent@email.com",
    photoURL: "",
    type: "friend",
  },
];

const Directory = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("teachers");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState<Omit<Contact, "id">>({
    name: "",
    role: "",
    email: "",
    phone: "",
    type: "other",
    social: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: contacts = mockContacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      // In a real app, this would fetch from Firestore
      return mockContacts;
    },
  });

  const filteredContacts = contacts.filter(contact => {
    if (activeTab === "teachers") return contact.type === "teacher";
    if (activeTab === "friends") return contact.type === "friend";
    return contact.type === "other";
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("social.")) {
      const socialField = name.split(".")[1];
      setNewContact(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else {
      setNewContact(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real app, this would save to Firestore
      toast({
        title: "Contact added",
        description: "Your contact has been successfully added",
      });
      
      setNewContact({
        name: "",
        role: "",
        email: "",
        phone: "",
        type: "other",
        social: {},
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContactCard = (contact: Contact) => (
    <Card key={contact.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={contact.photoURL} alt={contact.name} />
            <AvatarFallback>
              {contact.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{contact.name}</CardTitle>
            <CardDescription>{contact.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
            {contact.email}
          </a>
        </div>
        
        {contact.phone && (
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${contact.phone}`} className="hover:underline">
              {contact.phone}
            </a>
          </div>
        )}

        {contact.social && (
          <div className="flex space-x-2 mt-2 pt-2 border-t">
            {contact.social.facebook && (
              <a 
                href={`https://facebook.com/${contact.social.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <Facebook className="h-5 w-5" />
              </a>
            )}
            {contact.social.twitter && (
              <a 
                href={`https://twitter.com/${contact.social.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:text-sky-700"
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {contact.social.instagram && (
              <a 
                href={`https://instagram.com/${contact.social.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-800"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {contact.social.website && (
              <a 
                href={contact.social.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800"
              >
                <Globe className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const columns = [
    {
      header: "Name",
      accessor: "name" as keyof Contact,
      render: (contact: Contact) => (
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={contact.photoURL} alt={contact.name} />
            <AvatarFallback>
              {contact.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{contact.name}</div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Role",
      accessor: "role" as keyof Contact,
      sortable: true,
    },
    {
      header: "Email",
      accessor: "email" as keyof Contact,
      render: (contact: Contact) => (
        <a href={`mailto:${contact.email}`} className="text-primary hover:underline flex items-center">
          <Mail className="h-4 w-4 mr-1" />
          {contact.email}
        </a>
      ),
    },
    {
      header: "Phone",
      accessor: "phone" as keyof Contact,
      render: (contact: Contact) => (
        contact.phone ? (
          <a href={`tel:${contact.phone}`} className="hover:underline flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            {contact.phone}
          </a>
        ) : (
          <span className="text-muted-foreground">Not provided</span>
        )
      ),
    },
    {
      header: "Social",
      accessor: "social" as keyof Contact,
      render: (contact: Contact) => (
        <div className="flex space-x-2">
          {contact.social?.facebook && (
            <a 
              href={`https://facebook.com/${contact.social.facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {contact.social?.twitter && (
            <a 
              href={`https://twitter.com/${contact.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-700"
            >
              <Twitter className="h-4 w-4" />
            </a>
          )}
          {contact.social?.instagram && (
            <a 
              href={`https://instagram.com/${contact.social.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 hover:text-pink-800"
            >
              <Instagram className="h-4 w-4" />
            </a>
          )}
          {contact.social?.website && (
            <a 
              href={contact.social.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              <Globe className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppLayout title="Directory">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ml-2">Add Contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={newContact.type}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border"
                    required
                  >
                    <option value="teacher">Teacher</option>
                    <option value="friend">Friend</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={newContact.role}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Math Teacher, Classmate, etc."
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
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newContact.phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Social Media (optional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="social.facebook"
                      value={newContact.social?.facebook || ""}
                      onChange={handleInputChange}
                      placeholder="Facebook username"
                    />
                    <Input
                      name="social.twitter"
                      value={newContact.social?.twitter || ""}
                      onChange={handleInputChange}
                      placeholder="Twitter username"
                    />
                    <Input
                      name="social.instagram"
                      value={newContact.social?.instagram || ""}
                      onChange={handleInputChange}
                      placeholder="Instagram username"
                    />
                    <Input
                      name="social.website"
                      value={newContact.social?.website || ""}
                      onChange={handleInputChange}
                      placeholder="Website URL"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Contact"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "teachers" ? "Teachers" : 
               activeTab === "friends" ? "Friends" : "Other Contacts"}
            </CardTitle>
            <CardDescription>
              {activeTab === "teachers" ? "School faculty and staff" : 
               activeTab === "friends" ? "Classmates and friends" : "Additional contacts"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:hidden gap-4">
              {filteredContacts.map(renderContactCard)}
            </div>
            
            <div className="hidden md:block">
              <DataTable
                data={filteredContacts}
                columns={columns}
                searchable
                searchFields={["name", "role", "email"]}
                itemsPerPage={5}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Directory;
