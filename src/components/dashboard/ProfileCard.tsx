
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
        <div className="w-24 h-24 mb-4">
          <Avatar className="w-full h-full">
            {currentUser.photoURL ? (
              <AvatarImage 
                src={currentUser.photoURL} 
                alt="Profile" 
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold w-full h-full">
              {getInitial()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
        <p className="text-muted-foreground mb-2">Pioneer School</p>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">Student</Badge>
        </div>
        <p className="text-sm text-muted-foreground">Last Login: {lastLoginDate}</p>
      </div>
    </DashboardCard>
  );
};
