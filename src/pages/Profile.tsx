
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import ProfileHeader from "@/components/dashboard/ProfileHeader";

interface ProfileData {
  childName: string;
  email: string;
  currentClass: string;
  age: string;
  photoURL: string;
  address?: string;
  birthdate?: string;
  allergies?: string;
  emergencyContact?: string;
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          const data = profileDoc.data() as ProfileData;
          setProfileData(data);
          setFormData(data);
        } else {
          // Initialize with default values if document doesn't exist
          const defaultData = {
            childName: "",
            email: user.email || "",
            currentClass: "Pre-KG",
            age: "",
            photoURL: "",
          };
          setProfileData(defaultData as ProfileData);
          setFormData(defaultData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const profileDocRef = doc(db, "profiles", user.uid);
      const profileDoc = await getDoc(profileDocRef);
      
      if (profileDoc.exists()) {
        await updateDoc(profileDocRef, formData);
      } else {
        // Create the document if it doesn't exist
        await setDoc(profileDocRef, {
          ...formData,
          email: user.email || "",
          createdAt: new Date(),
        });
      }

      setProfileData((prev) => ({ ...prev, ...formData } as ProfileData));

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Profile">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          <div className="h-64 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile">
      <div className="space-y-6">
        <ProfileHeader />

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your child's personal information here</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name</Label>
                  <Input
                    id="childName"
                    name="childName"
                    value={formData.childName || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentClass">Current Class</Label>
                  <Select
                    value={formData.currentClass || ""}
                    onValueChange={(value) => handleSelectChange("currentClass", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pre-KG">Pre-KG</SelectItem>
                      <SelectItem value="KG">KG</SelectItem>
                      <SelectItem value="Grade 1">Grade 1</SelectItem>
                      <SelectItem value="Grade 2">Grade 2</SelectItem>
                      <SelectItem value="Grade 3">Grade 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    value={formData.age || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birth Date</Label>
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies or Health Concerns</Label>
                <Input
                  id="allergies"
                  name="allergies"
                  value={formData.allergies || ""}
                  onChange={handleChange}
                  placeholder="List any allergies or health concerns"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={handleChange}
                  placeholder="Name and phone number"
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
