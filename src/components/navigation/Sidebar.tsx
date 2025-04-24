
import { useState, useEffect } from "react";
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
  Award,
  Milestone,
  BookText,
  MessageSquare,
  Download,
  Target,
  ChevronLeft,
  ChevronRight,
  Home
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
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMobile, isOpen, setIsOpen }: SidebarProps) => {
  const navigate = useNavigate();
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
  
  const closeMenu = () => {
    if (isMobile) {
      setIsOpen(false);
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

  return (
    <>
      <div 
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar shadow-lg transition-transform duration-200 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out ${
                isOpen ? "w-64" : "w-20"
              } bg-sidebar shadow-md`
        }`}
      >
        <div className={`flex items-center justify-between p-4 border-b border-sidebar-border ${!isOpen && !isMobile ? "justify-center" : ""}`}>
          {(isOpen || isMobile) ? (
            <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">TreasureBook</h1>
          ) : (
            <h1 className="text-xl font-bold text-treasure-blue dark:text-blue-400">TB</h1>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          )}
        </div>

        <nav className="flex-1 overflow-auto p-4">
          <TooltipProvider delayDuration={300}>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.path}
                        onClick={closeMenu}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            !isOpen && !isMobile ? "justify-center" : ""
                          )
                        }
                      >
                        {item.icon}
                        {(isOpen || isMobile) && <span>{item.name}</span>}
                      </NavLink>
                    </TooltipTrigger>
                    {!isOpen && !isMobile && (
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        </nav>

        <div className="border-t border-sidebar-border p-4 space-y-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full text-left font-normal",
                    !isOpen && !isMobile ? "justify-center" : "justify-start"
                  )}
                  onClick={toggleTheme}
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-4 w-4 mr-2" />
                      {(isOpen || isMobile) && "Dark Mode"}
                    </>
                  ) : (
                    <>
                      <Sun className="h-4 w-4 mr-2" />
                      {(isOpen || isMobile) && "Light Mode"}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              {!isOpen && !isMobile && (
                <TooltipContent side="right">
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full font-normal",
                    !isOpen && !isMobile ? "justify-center" : "justify-start"
                  )}
                  onClick={handleLogout}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {(isOpen || isMobile) && "Log out"}
                </Button>
              </TooltipTrigger>
              {!isOpen && !isMobile && (
                <TooltipContent side="right">
                  Log out
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Overlay for mobile view */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Main content spacing adjustment */}
      {!isMobile && (
        <div 
          className={`transition-all duration-300 ease-in-out ${isOpen ? "ml-64" : "ml-20"}`} 
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
