
import { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Book, 
  Calendar, 
  Image, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  FileText, 
  Users,
  Trophy,
  Award,
  Milestone,
  BookText,
  MessageSquare,
  Download,
  Target,
  Home,
  LogOut
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const baseNavItems = [
    { name: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/dashboard" },
    { name: "Academic Records", icon: <Book className="w-5 h-5" />, path: "/academics" },
    { name: "Sports", icon: <Trophy className="w-5 h-5" />, path: "/sports" },
    { name: "Extracurricular", icon: <Award className="w-5 h-5" />, path: "/extracurricular" },
    { name: "Milestones", icon: <Milestone className="w-5 h-5" />, path: "/milestones" },
    { name: "Goals & Vision", icon: <Target className="w-5 h-5" />, path: "/goals" },
    { name: "Daily Journal", icon: <BookText className="w-5 h-5" />, path: "/journal" },
    { name: "Documents", icon: <FileText className="w-5 h-5" />, path: "/documents" },
    { name: "Feedback Notes", icon: <MessageSquare className="w-5 h-5" />, path: "/feedback" },
    { name: "Gallery", icon: <Image className="w-5 h-5" />, path: "/gallery" },
    { name: "Resources", icon: <FileText className="w-5 h-5" />, path: "/resources" },
    { name: "Directory", icon: <Users className="w-5 h-5" />, path: "/directory" },
    { name: "Backup & Export", icon: <Download className="w-5 h-5" />, path: "/backup" },
    { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];
  
  const adminNavItems = [
    { name: "User Management", icon: <Users className="w-5 h-5" />, path: "/users" }
  ];
  
  const showAdmin = currentUser && currentUser.email === "ashrav.siva@gmail.com";
  const navItems = showAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">TreasureBook</h1>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
        <nav className="p-4">
          <TooltipProvider delayDuration={300}>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 relative",
                            isActive
                              ? "bg-blue-50 text-treasure-blue font-semibold dark:bg-blue-900/30 dark:text-blue-300"
                              : "text-gray-700 hover:bg-blue-50 hover:text-treasure-blue dark:text-gray-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                          )
                        }
                      >
                        <span className={cn(
                          "flex items-center justify-center",
                          isActiveRoute(item.path) ? "text-treasure-blue dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
                        )}>
                          {item.icon}
                        </span>
                        <span>
                          {item.name}
                        </span>
                        {isActiveRoute(item.path) && (
                          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-treasure-blue dark:bg-blue-400 rounded-r-md" />
                        )}
                      </NavLink>
                    </TooltipTrigger>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>
      </ScrollArea>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-left font-normal justify-start text-gray-700 dark:text-gray-200"
          onClick={toggleTheme}
        >
          {theme === "light" ? (
            <>
              <Moon className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
              Dark Mode
            </>
          ) : (
            <>
              <Sun className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
              Light Mode
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full font-normal justify-start text-gray-700 dark:text-gray-200"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
          Log out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
