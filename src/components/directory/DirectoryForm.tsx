
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
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

interface DirectoryFormProps {
  onContactAdded: (newContact: any) => void;
}

interface ContactFormData {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

export const DirectoryForm = ({ onContactAdded }: DirectoryFormProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("basicInfo");
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    relationship: "Family",
    phone: "",
    email: "",
    address: "",
    notes: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleAddContact = async () => {
    if (!auth.currentUser || !formData.name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const contactData = {
        id: uuidv4(),
        ...formData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "contacts"), contactData);
      
      const newContact = {
        ...contactData,
        id: docRef.id
      };
      
      onContactAdded(newContact);
      
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
      
      // Reset form to defaults
      setFormData({
        name: "",
        relationship: "Family",
        phone: "",
        email: "",
        address: "",
        notes: "",
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      });
      
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Add Contact
      </Button>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Add Contact</DialogTitle>
          </DialogHeader>
          
          <Accordion type="single" collapsible defaultValue="basicInfo" className="mt-4">
            <AccordionItem value="basicInfo">
              <AccordionTrigger className="dark:text-white">Basic Information</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-300">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter name"
                      className="dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship" className="dark:text-gray-300">Relationship</Label>
                    <Select value={formData.relationship} onValueChange={(value) => handleSelectChange("relationship", value)}>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700">
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Friend">Friend</SelectItem>
                        <SelectItem value="Colleague">Colleague</SelectItem>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Coach">Coach</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="address">
              <AccordionTrigger className="dark:text-white">Address</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="address" className="dark:text-gray-300">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="socialMedia">
              <AccordionTrigger className="dark:text-white">Social Media</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="dark:text-gray-300">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="Facebook profile URL"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="twitter" className="dark:text-gray-300">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="Twitter profile URL"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="dark:text-gray-300">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="Instagram profile URL"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="dark:text-gray-300">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn profile URL"
                      className="dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notes">
              <AccordionTrigger className="dark:text-white">Notes</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="dark:text-gray-300">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Add additional notes"
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddContact} 
              disabled={!formData.name}
            >
              Add Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
