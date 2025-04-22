
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/DataTable";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  createdAt: string;
  createdBy: string;
}

// Predefined categories
const resourceCategories = [
  "Learning",
  "Entertainment",
  "Science",
  "Reading",
  "Math",
  "Art",
  "Music",
  "Physical Education",
  "Social Studies",
  "Languages"
];

const Resources = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    description: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: resources = [], refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      try {
        const resourcesCollection = collection(db, "resources");
        const q = query(resourcesCollection, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Resource[];
      } catch (error) {
        console.error("Error fetching resources:", error);
        return [];
      }
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewResource((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewResource((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");
      
      const docRef = await addDoc(collection(db, "resources"), {
        ...newResource,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });

      toast({
        title: "Resource added",
        description: "Your resource has been successfully added",
      });
      
      setNewResource({
        title: "",
        url: "",
        description: "",
        category: "",
      });
      
      setIsDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Title",
      accessor: "title" as keyof Resource,
      render: (resource: Resource) => (
        <div className="font-medium">{resource.title}</div>
      ),
      sortable: true,
    },
    {
      header: "Category",
      accessor: "category" as keyof Resource,
      render: (resource: Resource) => (
        <div className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs inline-block">
          {resource.category}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Description",
      accessor: "description" as keyof Resource,
      render: (resource: Resource) => (
        <div className="truncate max-w-xs">{resource.description}</div>
      ),
    },
    {
      header: "Link",
      accessor: "url" as keyof Resource,
      render: (resource: Resource) => (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-blue-600 hover:underline"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Visit
        </a>
      ),
    },
  ];

  return (
    <AppLayout title="Resources">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Educational Resources</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Resource</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newResource.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    value={newResource.url}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newResource.category}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newResource.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Resource"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Resources</CardTitle>
            <CardDescription>
              A collection of educational resources for your child
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={resources}
              columns={columns}
              searchable
              searchFields={["title", "description", "category"]}
              itemsPerPage={5}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Resources;
