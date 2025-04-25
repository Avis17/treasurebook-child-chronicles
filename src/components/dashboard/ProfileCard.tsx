
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProfileCard = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || "User";
  const lastLoginDate = auth.currentUser?.metadata.lastSignInTime 
    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString()
    : "N/A";

  // Safely get the first character for the avatar fallback
  const getInitial = () => {
    if (!displayName || displayName.length === 0) return "U";
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <DashboardCard>
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-4 overflow-hidden rounded-full">
          {currentUser.photoURL ? (
            <Avatar className="w-full h-full">
              <AvatarImage src={currentUser.photoURL} alt="Profile" />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {getInitial()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-full h-full">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold w-full h-full">
                {getInitial()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
        <p className="text-muted-foreground mb-2">Pioneer School</p>
        <p className="text-sm text-muted-foreground">Last Login: {lastLoginDate}</p>
      </div>
    </DashboardCard>
  );
};
