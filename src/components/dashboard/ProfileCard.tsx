
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Star } from "lucide-react";

export const ProfileCard = () => {
  const { currentUser } = useAuth();
  
  // Add early return with console log for debugging
  if (!currentUser) {
    console.log("ProfileCard: No current user");
    return null;
  }

  console.log("ProfileCard: Current user data", {
    displayName: currentUser.displayName,
    email: currentUser.email,
    photoURL: currentUser.photoURL
  });
  
  // Use optional chaining and nullish coalescing for safer property access
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || "User";
  const lastLoginDate = auth.currentUser?.metadata.lastSignInTime 
    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString()
    : "N/A";
  
  // Safely get the first character for the avatar fallback
  const getInitial = () => {
    if (!displayName || typeof displayName !== 'string' || displayName.length === 0) {
      console.log("ProfileCard: Using fallback initial");
      return "U";
    }
    console.log("ProfileCard: Using initial from displayName", displayName.charAt(0));
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <DashboardCard>
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
          <Avatar className="w-full h-full border-4 border-white shadow-md">
            {currentUser.photoURL ? (
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
        <p className="text-muted-foreground mb-3">Pioneer School</p>
        
        <div className="flex flex-wrap items-center gap-2 mb-3 justify-center">
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
            <BookOpen className="h-3 w-3" /> Student
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-100">
            <Star className="h-3 w-3" /> Grade 1
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-emerald-700 border border-green-100">
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
