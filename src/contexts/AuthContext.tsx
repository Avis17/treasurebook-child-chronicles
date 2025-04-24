
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { ADMIN_EMAIL, VERIFICATION_STATUS } from '@/lib/constants';

export interface AuthUser extends User {
  verificationStatus?: string;
  permissions?: {
    storage: boolean;
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
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const enhancedUser = {
              ...user,
              verificationStatus: userData.verificationStatus || VERIFICATION_STATUS.PENDING,
              permissions: userData.permissions || { storage: false },
            };
            setCurrentUser(enhancedUser);
            setIsAdmin(user.email === ADMIN_EMAIL);
          } else {
            setCurrentUser({
              ...user,
              verificationStatus: VERIFICATION_STATUS.PENDING,
              permissions: { storage: false }
            });
            setIsAdmin(user.email === ADMIN_EMAIL);
          }
        } catch (error) {
          console.error("Error fetching user data", error);
          setCurrentUser({
            ...user,
            verificationStatus: VERIFICATION_STATUS.PENDING,
            permissions: { storage: false }
          });
          setIsAdmin(user.email === ADMIN_EMAIL);
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
