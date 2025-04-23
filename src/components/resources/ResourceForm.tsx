
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { auth } from "@/lib/firebase";
import { createResource, Resource } from "@/lib/resource-service";

interface ResourceFormProps {
  onResourceAdded: (newResource: Resource) => void;
}

export const ResourceForm = ({ onResourceAdded }: ResourceFormProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    category: "Learning",
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddResource = async () => {
    if (!auth.currentUser || !formData.title || !formData.link) {
      toast({
        title: "Error",
        description: "Title and link are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const resourceData = {
        ...formData,
        isFavorite: false,
        userId: auth.currentUser.uid,
      };
      
      const newResource = await createResource(resourceData);
      
      if (newResource) {
        onResourceAdded(newResource);
        
        toast({
          title: "Success",
          description: "Resource added successfully",
        });
        
        // Reset form to defaults
        setFormData({
          title: "",
          description: "",
          link: "",
          category: "Learning",
          tags: [],
        });
        
        setIsAddDialogOpen(false);
      } else {
        throw new Error("Failed to create resource");
      }
    } catch (error) {
      console.error("Error adding resource:", error);
      toast({
        title: "Error",
        description: "Failed to add resource",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Resource
      </Button>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="dark:text-gray-300">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter resource title"
                className="dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link" className="dark:text-gray-300">Link</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder="Enter resource URL"
                className="dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category" className="dark:text-gray-300">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  <SelectItem value="Learning">Learning</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Career">Career</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter resource description"
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="dark:text-gray-300">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags"
                  className="dark:bg-gray-700 dark:text-white flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="secondary"
                  className="dark:bg-gray-700"
                >
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press Enter or click Add to add a tag
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddResource} 
              disabled={!formData.title || !formData.link}
            >
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
