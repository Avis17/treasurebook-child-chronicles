import { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  Lightbulb
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isMobile: boolean;
}

const Sidebar = ({ isMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, currentUser } = useAuth();
  
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
    const baseItems = [
      { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" },
      { name: "AI Insights", icon: <Lightbulb className="w-5 h-5" />, path: "/ai-insights" },
      { name: "Academic Records", icon: <Book className="w-5 h-5" />, path: "/academics" },
      { name: "Sports", icon: <Trophy className="w-5 h-5" />, path: "/sports" },
      { name: "Extracurricular", icon: <Award className="w-5 h-5" />, path: "/extracurricular" },
    ];

    const storageItems = [
      { name: "Gallery", icon: <ImageIcon className="w-5 h-5" />, path: "/gallery" },
      { name: "Documents", icon: <FileArchive className="w-5 h-5" />, path: "/documents" },
    ];

    const remainingItems = [
      { name: "Resources", icon: <FileText className="w-5 h-5" />, path: "/resources" },
      { name: "Directory", icon: <Users className="w-5 h-5" />, path: "/directory" },
      { name: "Journal", icon: <BookOpen className="w-5 h-5" />, path: "/journal" },
      { name: "Goals", icon: <Target className="w-5 h-5" />, path: "/goals" },
      { name: "Milestones", icon: <Archive className="w-5 h-5" />, path: "/milestones" },
      { name: "Calendar", icon: <Calendar className="w-5 h-5" />, path: "/calendar" },
      { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
      { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
    ];

    const items = [
      ...baseItems,
      ...storageItems.map(item => ({
        ...item,
        disabled: !currentUser?.permissions?.storage,
      })),
      ...remainingItems
    ];

    if (isAdmin) {
      items.push({ name: "User Management", icon: <Users className="w-5 h-5" />, path: "/users" });
    }

    return items;
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          TreasureBook
        </h1>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-3 space-y-1">
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
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 ease-in-out"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-5 h-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-5 h-5" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors duration-150 ease-in-out"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
