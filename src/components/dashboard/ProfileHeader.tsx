
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileImagePreview from "./ProfileImagePreview";

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  grade: string;
}

const ProfileHeader = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile({
              displayName: docSnap.data().displayName || user.displayName || "Student",
              email: docSnap.data().email || user.email || "",
              photoURL: docSnap.data().photoURL || user.photoURL || "",
              role: docSnap.data().role || "Student",
              grade: docSnap.data().grade || "Grade 8",
            });
          } else {
            setProfile({
              displayName: user.displayName || "Student",
              email: user.email || "",
              photoURL: user.photoURL || "",
              role: "Student",
              grade: "Grade 8",
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
          <div className="w-20 h-20">
            {profile?.photoURL ? (
              <ProfileImagePreview
                imageUrl={profile.photoURL}
                altText={`${profile.displayName}'s profile`}
              />
            ) : (
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl">
                  {profile?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold">{profile?.displayName}</h2>
            <p className="text-muted-foreground">
              {profile?.role} · {profile?.grade}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{profile?.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
