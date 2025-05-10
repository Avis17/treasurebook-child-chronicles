import { useState, useEffect, useRef } from "react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, TabletSmartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  userId?: string;
  fatherName?: string;
  motherName?: string;
  parentOccupation?: string;
  parentEmail?: string;
  guardian?: string;
  schoolName?: string;
  admissionNumber?: string;
  previousSchool?: string;
  city?: string;
  pincode?: string;
  state?: string;
  country?: string;
  medicalConditions?: string;
  vaccinationHistory?: string;
  doctorContact?: string;
  aadharNumber?: string;
  transportArrangement?: string;
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData & {
    parentName?: string;
    parentContact?: string;
    bloodGroup?: string;
    additionalInfo?: string;
  }>>({});
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");

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
          const defaultData = {
            childName: "",
            email: user.email || "",
            currentClass: "Pre-KG",
            age: "",
            photoURL: "",
            userId: user.uid,
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

  useEffect(() => {
    if (profileData) {
      const isChanged = Object.keys(formData).some(key => {
        return formData[key as keyof ProfileData] !== profileData[key as keyof ProfileData];
      });
      setIsDirty(isChanged);
    }
  }, [formData, profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    setUploadingImage(true);

    try {
      const storageRef = ref(storage, `profile-images/${user.uid}/${file.name}`);

      await uploadBytes(storageRef, file);

      const photoURL = await getDownloadURL(storageRef);

      setFormData((prev) => ({ ...prev, photoURL }));

      const profileDocRef = doc(db, "profiles", user.uid);
      const profileDoc = await getDoc(profileDocRef);

      if (profileDoc.exists()) {
        await updateDoc(profileDocRef, { photoURL });
      } else {
        await setDoc(profileDocRef, {
          photoURL,
          email: user.email || "",
          createdAt: new Date(),
        });
      }

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });

    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) return;

      const updatedFormData = {
        ...formData,
        userId: user.uid
      };

      const profileDocRef = doc(db, "profiles", user.uid);
      const profileDoc = await getDoc(profileDocRef);

      if (profileDoc.exists()) {
        await updateDoc(profileDocRef, updatedFormData);
      } else {
        await setDoc(profileDocRef, {
          ...updatedFormData,
          email: user.email || "",
          createdAt: new Date(),
        });
      }

      setProfileData((prev) => ({ ...prev, ...updatedFormData } as ProfileData));
      setIsDirty(false);

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
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Profile">
      <div className="space-y-6">
        <Card className="bg-background/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-32 h-32 group">
                <div
                  className="cursor-pointer w-full h-full rounded-full overflow-hidden border-2 border-primary/20"
                  onClick={handleImageClick}
                >
                  {formData.photoURL ? (
                    <img
                      src={formData.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Avatar className="w-full h-full">
                      <AvatarFallback className="text-4xl">
                        {formData.childName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                  onClick={handleImageClick}
                >
                  <Camera className="text-white h-8 w-8" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{formData.childName || "Set your name"}</h2>
                    <p className="text-muted-foreground">
                      {formData.currentClass || "Select your class"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{formData.email}</p>
                  </div>
                  {uploadingImage && (
                    <p className="text-sm text-muted-foreground">Uploading image...</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Update your child's information here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-wrap gap-2 justify-start sm:justify-between w-full overflow-x-auto">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="family">Family</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="medical">Medical</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="childName" className="dark:text-gray-300">Child's Name</Label>
                      <Input
                        id="childName"
                        name="childName"
                        value={formData.childName || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        disabled
                        className="dark:bg-gray-700 dark:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentClass" className="dark:text-gray-300">Current Class</Label>
                      <Select
                        value={formData.currentClass || ""}
                        onValueChange={(value) => handleSelectChange("currentClass", value)}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="Pre-KG">Pre-KG</SelectItem>
                          <SelectItem value="KG">KG</SelectItem>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                          <SelectItem value="College 1st Year">College 1st Year</SelectItem>
                          <SelectItem value="College 2nd Year">College 2nd Year</SelectItem>
                          <SelectItem value="College 3rd Year">College 3rd Year</SelectItem>
                          <SelectItem value="College 4th Year">College 4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="dark:text-gray-300">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        value={formData.age || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthdate" className="dark:text-gray-300">Birth Date</Label>
                      <Input
                        id="birthdate"
                        name="birthdate"
                        type="date"
                        value={formData.birthdate || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup" className="dark:text-gray-300">Blood Group</Label>
                      <Input
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aadharNumber" className="dark:text-gray-300">Aadhar/ID Number (Optional)</Label>
                      <Input
                        id="aadharNumber"
                        name="aadharNumber"
                        value={formData.aadharNumber || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                        placeholder="For internal use only"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transportArrangement" className="dark:text-gray-300">Transport Arrangement</Label>
                      <Select
                        value={formData.transportArrangement || ""}
                        onValueChange={(value) => handleSelectChange("transportArrangement", value)}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select transport arrangement" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="Own">Own</SelectItem>
                          <SelectItem value="School Van">School Van</SelectItem>
                          <SelectItem value="Public">Public Transport</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName" className="dark:text-gray-300">Father's Name</Label>
                      <Input
                        id="fatherName"
                        name="fatherName"
                        value={formData.fatherName || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motherName" className="dark:text-gray-300">Mother's Name</Label>
                      <Input
                        id="motherName"
                        name="motherName"
                        value={formData.motherName || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentOccupation" className="dark:text-gray-300">Parents' Occupation</Label>
                      <Input
                        id="parentOccupation"
                        name="parentOccupation"
                        value={formData.parentOccupation || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentEmail" className="dark:text-gray-300">Parent's Email</Label>
                      <Input
                        id="parentEmail"
                        name="parentEmail"
                        type="email"
                        value={formData.parentEmail || ""}
                        onChange={handleChange}
                        placeholder="If different from login email"
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guardian" className="dark:text-gray-300">Guardian (If applicable)</Label>
                      <Input
                        id="guardian"
                        name="guardian"
                        value={formData.guardian || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentContact" className="dark:text-gray-300">Parent's Contact</Label>
                      <Input
                        id="parentContact"
                        name="parentContact"
                        value={formData.parentContact || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="education" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName" className="dark:text-gray-300">Current School Name</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admissionNumber" className="dark:text-gray-300">Admission Number / Student ID</Label>
                      <Input
                        id="admissionNumber"
                        name="admissionNumber"
                        value={formData.admissionNumber || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="previousSchool" className="dark:text-gray-300">Previous School</Label>
                      <Input
                        id="previousSchool"
                        name="previousSchool"
                        value={formData.previousSchool || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                        placeholder="If applicable"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="dark:text-gray-300">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="dark:text-gray-300">City/Town</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode" className="dark:text-gray-300">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="dark:text-gray-300">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="dark:text-gray-300">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country || ""}
                        onChange={handleChange}
                        className="dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="medicalConditions" className="dark:text-gray-300">Known Medical Conditions</Label>
                      <textarea
                        id="medicalConditions"
                        name="medicalConditions"
                        rows={3}
                        value={formData.medicalConditions || ""}
                        onChange={handleChange}
                        placeholder="List any known medical conditions"
                        className="w-full p-2 rounded dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="dark:text-gray-300">Allergies</Label>
                      <Input
                        id="allergies"
                        name="allergies"
                        value={formData.allergies || ""}
                        onChange={handleChange}
                        placeholder="List any allergies or health concerns"
                        className="dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vaccinationHistory" className="dark:text-gray-300">Vaccination History</Label>
                      <Select
                        value={formData.vaccinationHistory || ""}
                        onValueChange={(value) => handleSelectChange("vaccinationHistory", value)}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700">
                          <SelectItem value="Complete">Complete</SelectItem>
                          <SelectItem value="Partial">Partial</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Documentation Available">Documentation Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctorContact" className="dark:text-gray-300">Doctor's Contact Info</Label>
                      <Input
                        id="doctorContact"
                        name="doctorContact"
                        value={formData.doctorContact || ""}
                        onChange={handleChange}
                        placeholder="For emergencies"
                        className="dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="dark:text-gray-300">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact || ""}
                        onChange={handleChange}
                        placeholder="Name and phone number"
                        className="dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="dark:bg-gray-600" />

              <div className="space-y-2">
                <Label htmlFor="additionalInfo" className="dark:text-gray-300">Additional Information</Label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={3}
                  value={formData.additionalInfo || ""}
                  onChange={handleChange}
                  placeholder="Provide any other important information here"
                  className="w-full p-2 rounded dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 border"
                />
              </div>

              <Button type="submit" disabled={saving || !isDirty}>
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
