
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Book, 
  Calendar, 
  Image, 
  Settings, 
  List, 
  User, 
  Sun, 
  Moon, 
  FileText, 
  Users,
  Trophy,
  Award
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMobile, isOpen, setIsOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  
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
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };
  
  const closeMenu = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Base navigation items available to all verified users
  const baseNavItems = [
    { name: "Dashboard", icon: <List className="w-5 h-5" />, path: "/dashboard" },
    { name: "Academic Records", icon: <Book className="w-5 h-5" />, path: "/academics" },
    { name: "Sports", icon: <Trophy className="w-5 h-5" />, path: "/sports" },
    { name: "Extracurricular", icon: <Award className="w-5 h-5" />, path: "/extracurricular" },
    { name: "Gallery", icon: <Image className="w-5 h-5" />, path: "/gallery" },
    { name: "Resources", icon: <FileText className="w-5 h-5" />, path: "/resources" },
    { name: "Directory", icon: <Users className="w-5 h-5" />, path: "/directory" },
    { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];
  
  // Admin-only navigation items
  const adminNavItems = [
    { name: "User Management", icon: <Users className="w-5 h-5" />, path: "/users" }
  ];
  
  // Combine nav items based on user role
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  
  return (
    <div 
      className={`${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar shadow-lg transition-transform duration-200 ease-in-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`
          : "flex h-screen min-w-64 flex-col bg-sidebar shadow-md"
      }`}
    >
      <div className="flex items-center justify-center p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">TreasureBook</h1>
      </div>

      <nav className="flex-1 overflow-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-left font-normal"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light Mode
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start text-left font-normal" 
          onClick={handleLogout}
        >
          <Settings className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
