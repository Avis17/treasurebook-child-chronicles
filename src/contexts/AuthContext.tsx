
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ADMIN_EMAIL, VERIFICATION_STATUS } from '@/lib/constants';

export interface AuthUser extends User {
  verificationStatus?: string;
  permissions?: {
    storage: boolean;
    aiInsights: boolean;
    quiz: boolean;
    voicePractice: boolean;
    funLearning: boolean;
  };
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log("Setting up auth state listener");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User authenticated:", user.email);
        try {
          // Check if user is admin first before fetching additional data
          const isAdminUser = user.email === ADMIN_EMAIL;
          console.log("Is admin user check:", user.email, ADMIN_EMAIL, isAdminUser);
          setIsAdmin(isAdminUser);

          // For admin, skip verification checks and set default permissions
          if (isAdminUser) {
            console.log("Admin user detected, setting enhanced permissions");
            const enhancedAdmin = {
              ...user,
              verificationStatus: VERIFICATION_STATUS.APPROVED, // Always approved for admin
              permissions: { 
                storage: true, 
                aiInsights: true, 
                quiz: true, 
                voicePractice: true,
                funLearning: true 
              }, // Full permissions for admin
            };
            setCurrentUser(enhancedAdmin);
            setLoading(false);
            return; // Skip further processing for admin
          }

          // For regular users, fetch their data from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const enhancedUser = {
              ...user,
              verificationStatus: userData.verificationStatus || VERIFICATION_STATUS.PENDING,
              permissions: userData.permissions || { 
                storage: false, 
                aiInsights: false, 
                quiz: false, 
                voicePractice: false,
                funLearning: false 
              },
            };
            setCurrentUser(enhancedUser);
          } else {
            setCurrentUser({
              ...user,
              verificationStatus: VERIFICATION_STATUS.PENDING,
              permissions: { 
                storage: false, 
                aiInsights: false, 
                quiz: false, 
                voicePractice: false,
                funLearning: false 
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user data", error);
          setCurrentUser({
            ...user,
            verificationStatus: VERIFICATION_STATUS.PENDING,
            permissions: { 
              storage: false, 
              aiInsights: false, 
              quiz: false, 
              voicePractice: false,
              funLearning: false 
            }
          });
        }
      } else {
        console.log("No authenticated user");
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
