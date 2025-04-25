
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileImagePreview from "./ProfileImagePreview";

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  grade: string;
  birthdate?: string;
  age?: string;
}

const ProfileHeader = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const calculateAge = (birthdate: string): string => {
    if (!birthdate) return '';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Check profiles collection first (where Profile page saves data)
        const profileDocRef = doc(db, "profiles", user.uid);
        const profileDoc = await getDoc(profileDocRef);
          
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          const calculatedAge = profileData.birthdate ? calculateAge(profileData.birthdate) : profileData.age || "";
          
          setProfile({
            displayName: profileData.childName || user.displayName || "Student",
            email: profileData.email || user.email || "",
            photoURL: profileData.photoURL || user.photoURL || "",
            role: "Student",
            grade: profileData.currentClass || "Grade 8",
            birthdate: profileData.birthdate || "",
            age: calculatedAge,
          });
        } else {
          // Fall back to users collection if no profile document
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const calculatedAge = userData.birthdate ? calculateAge(userData.birthdate) : userData.age || "";
            
            setProfile({
              displayName: userData.displayName || user.displayName || "Student",
              email: userData.email || user.email || "",
              photoURL: userData.photoURL || user.photoURL || "",
              role: userData.role || "Student",
              grade: userData.grade || "Grade 8",
              birthdate: userData.birthdate || "",
              age: calculatedAge,
            });
          } else {
            setProfile({
              displayName: user.displayName || "Student",
              email: user.email || "",
              photoURL: user.photoURL || "",
              role: "Student",
              grade: "Grade 8",
              age: "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfileData();
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditProfile = () => {
    navigate("/profile");
  };

  // Helper function to safely get initial
  const getInitial = (name: string | undefined | null): string => {
    if (!name || typeof name !== 'string' || name.length === 0) {
      return "U";
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Card className="bg-background/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/60 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-20 h-20 group">
            {profile?.photoURL ? (
              <ProfileImagePreview
                imageUrl={profile.photoURL}
                altText={`${profile.displayName}'s profile`}
                onEditClick={handleEditProfile}
                navigateOnClick={false}
              />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl">
                  {getInitial(profile?.displayName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{profile?.displayName}</h2>
                <p className="text-muted-foreground">
                  {profile?.role} · {profile?.grade}{profile?.age ? ` · ${profile.age} years old` : ''}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="md:self-start flex items-center gap-1"
                onClick={handleEditProfile}
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
