
import { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Book, 
  Trophy,
  Award,
  ImageIcon,
  FileText,
  Users,
  User,
  Settings,
  Moon,
  Sun,
  LogOut,
  Archive,
  Target,
  BookOpen,
  Calendar,
  FileArchive,
  Lightbulb,
  Home,
  GraduationCap,
  CalendarDays,
  BookOpenText,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

interface SidebarProps {
  isMobile: boolean;
}

// Define an interface for the navigation items
interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  requiresPermission?: 'storage' | 'aiInsights'; // Make this optional with specific allowed values
}

const Sidebar = ({ isMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, currentUser } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);
  
  // Fetch profile name from Firestore when component mounts
  useEffect(() => {
    const fetchProfileName = async () => {
      if (!currentUser?.uid) return;
      
      try {
        // Try profiles collection first
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (data.childName) {
            setProfileName(data.childName);
            return;
          }
        }
        
        // Try users collection as fallback
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.displayName) {
            setProfileName(data.displayName);
            return;
          }
        }
        
        // Default to Firebase auth display name as last resort
        setProfileName(currentUser.displayName);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    
    fetchProfileName();
  }, [currentUser]);
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out",
      });
    }
  };

  const getNavItems = () => {
    // Now all of these items are typed as NavItem
    const baseItems: NavItem[] = [
      { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" },
      { name: "AI Insights", icon: <Lightbulb className="w-5 h-5" />, path: "/ai-insights", requiresPermission: 'aiInsights' },
      { name: "Academic Records", icon: <Book className="w-5 h-5" />, path: "/academics" },
      { name: "Sports", icon: <Trophy className="w-5 h-5" />, path: "/sports" },
      { name: "Extracurricular", icon: <Award className="w-5 h-5" />, path: "/extracurricular" },
    ];

    const storageItems: NavItem[] = [
      { name: "Gallery", icon: <ImageIcon className="w-5 h-5" />, path: "/gallery", requiresPermission: 'storage' },
      { name: "Documents", icon: <FileArchive className="w-5 h-5" />, path: "/documents", requiresPermission: 'storage' },
    ];

    const remainingItems: NavItem[] = [
      { name: "Resources", icon: <FileText className="w-5 h-5" />, path: "/resources" },
      { name: "Directory", icon: <Users className="w-5 h-5" />, path: "/directory" },
      { name: "Journal", icon: <BookOpen className="w-5 h-5" />, path: "/journal" },
      { name: "Goals", icon: <Target className="w-5 h-5" />, path: "/goals" },
      { name: "Milestones", icon: <Archive className="w-5 h-5" />, path: "/milestones" },
      { name: "Calendar", icon: <Calendar className="w-5 h-5" />, path: "/calendar" },
      { name: "Feedback", icon: <MessageSquare className="w-5 h-5" />, path: "/feedback" },
      { name: "Help", icon: <HelpCircle className="w-5 h-5" />, path: "/help" },
      { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
      { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
    ];

    const items = [
      ...baseItems,
      ...storageItems,
      ...remainingItems
    ];

    const processedItems = items.map(item => ({
      ...item,
      // Update this line to bypass permission check for admin users
      disabled: item.requiresPermission && !isAdmin ? !currentUser?.permissions?.[item.requiresPermission] : false,
    }));

    if (isAdmin) {
      processedItems.push({ name: "User Management", icon: <Users className="w-5 h-5" />, path: "/users", disabled: false });
    }

    return processedItems;
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen">
      {/* Header */}
      <div className="flex flex-col items-center justify-center h-32 px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <img 
          src="/lovable-uploads/48331f19-76fe-409d-9a1d-f0861cac4194.png" 
          alt="Treasure Book Logo" 
          className="h-16 w-auto mb-2"
        />
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          TreasureBook
        </h1>
      </div>

      {/* Navigation Items - Using ScrollArea for scrollable content */}
      <ScrollArea className="flex-1 overflow-auto">
        <nav className="px-3 py-2">
          <div className="space-y-1">
            {getNavItems().map((item) => (
              <NavLink
                key={item.path}
                to={item.disabled ? "#" : item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                  transition-colors duration-150 ease-in-out
                  ${item.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isActive 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
                `}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.disabled && (
                  <span className="ml-auto text-xs text-gray-500">(Disabled)</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </ScrollArea>

      {/* Footer Actions - Completely separate from scrollable area */}
      <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
            text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? (
            <>
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </div>
            </>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-between w-full gap-3 px-3 py-2 mt-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
            text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    requiresAuth: true,
  },
  {
    title: "Academic Records",
    href: "/academic-records",
    icon: GraduationCap,
    requiresAuth: true,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
    requiresAuth: true,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
    requiresAuth: true,
  },
  {
    title: "Journal",
    href: "/journal",
    icon: BookOpenText,
    requiresAuth: true,
  },
];
