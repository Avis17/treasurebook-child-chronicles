
import React from "react";
import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";

export const ProfileCard = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || "User";
  const lastLoginDate = auth.currentUser?.metadata.lastSignInTime 
    ? new Date(auth.currentUser.metadata.lastSignInTime).toLocaleDateString()
    : "N/A";

  return (
    <DashboardCard>
      <div className="flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-4 overflow-hidden rounded-full">
          {currentUser.photoURL ? (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
        <p className="text-muted-foreground mb-2">Pioneer School</p>
        <p className="text-sm text-muted-foreground">Last Login: {lastLoginDate}</p>
      </div>
    </DashboardCard>
  );
};
