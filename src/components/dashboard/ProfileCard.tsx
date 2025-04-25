
import React, { useState, useEffect } from "react";
import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Star, User } from "lucide-react";

export const ProfileCard = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;
      
      try {
        // Try to get from profiles collection first
        let profile = null;
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          profile = profileSnap.data();
        } else {
          // Fallback to users collection
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            profile = userSnap.data();
          }
        }
        
        setProfileData(profile || {});
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [currentUser]);
  
  const calculateAge = (birthdate: string | null | undefined) => {
    if (!birthdate) return null;
    
    try {
      const today = new Date();
      const birthDate = new Date(birthdate);
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) return null;
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      console.error("Error calculating age:", error);
      return null;
    }
  };
  
  // Use optional chaining and nullish coalescing for safer property access
  const displayName = currentUser?.displayName || 
                      profileData?.childName || 
                      profileData?.displayName || 
                      currentUser?.email?.split('@')[0] || 
                      "User";
  
  const grade = profileData?.currentClass || 
                profileData?.grade || 
                "Grade --";
                
  const school = profileData?.schoolName || 
                 profileData?.school || 
                 "School --";
  
  // Always calculate age from birthdate if available
  const calculatedAge = calculateAge(profileData?.birthdate);
  const age = calculatedAge !== null ? 
              calculatedAge.toString() : 
              profileData?.age || 
              "--";
  
  const lastLoginDate = auth.currentUser?.metadata.lastSignInTime 
    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString()
    : "--";
  
  // Safely get the first character for the avatar fallback
  const getInitial = () => {
    if (!displayName || typeof displayName !== 'string' || displayName.length === 0) {
      return "U";
    }
    return displayName.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <DashboardCard>
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-24 h-24 mb-4 rounded-full bg-gray-200 animate-pulse"></div>
          <div className="w-3/4 h-6 mb-2 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-2/4 h-4 mb-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard gradient>
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
          <Avatar className="w-full h-full border-4 border-white shadow-md">
            {currentUser?.photoURL ? (
              <AvatarImage 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-2xl font-bold w-full h-full">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          {displayName}
        </h2>
        <p className="text-muted-foreground mb-1">{school}</p>
        <p className="text-muted-foreground mb-3">{age !== "--" ? `${age} years old` : ""}</p>
        
        <div className="flex flex-wrap items-center gap-2 mb-3 justify-center">
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800 dark:text-blue-300">
            <User className="h-3 w-3" /> Student
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-100 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800 dark:text-amber-300">
            <BookOpen className="h-3 w-3" /> {grade}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border border-green-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800 dark:text-emerald-300">
            <Award className="h-3 w-3" /> Achiever
          </Badge>
        </div>
        
        <div className="w-full pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-muted-foreground">Last Login: {lastLoginDate}</p>
        </div>
      </div>
    </DashboardCard>
  );
};
