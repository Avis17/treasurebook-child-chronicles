
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is admin first before fetching additional data
          const isAdminUser = user.email === ADMIN_EMAIL;
          setIsAdmin(isAdminUser);

          // For admin, skip verification checks and set default permissions
          if (isAdminUser) {
            const enhancedAdmin = {
              ...user,
              verificationStatus: VERIFICATION_STATUS.APPROVED, // Always approved for admin
              permissions: { storage: true, aiInsights: true }, // Full permissions for admin
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
              permissions: userData.permissions || { storage: false, aiInsights: false },
            };
            setCurrentUser(enhancedUser);
          } else {
            setCurrentUser({
              ...user,
              verificationStatus: VERIFICATION_STATUS.PENDING,
              permissions: { storage: false, aiInsights: false }
            });
          }
        } catch (error) {
          console.error("Error fetching user data", error);
          setCurrentUser({
            ...user,
            verificationStatus: VERIFICATION_STATUS.PENDING,
            permissions: { storage: false, aiInsights: false }
          });
        }
      } else {
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
