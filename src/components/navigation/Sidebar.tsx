
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
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-sidebar-primary/10 to-sidebar-primary/5 backdrop-blur-sm shadow-md transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-treasure-blue to-blue-500 dark:from-blue-300 dark:to-blue-500">TreasureBook</h1>
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
                              ? "bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary-foreground font-semibold shadow-sm"
                              : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )
                        }
                      >
                        <span className={cn(
                          "flex items-center justify-center",
                          isActiveRoute(item.path) && "text-sidebar-primary"
                        )}>
                          {item.icon}
                        </span>
                        <span className={cn(
                          isActiveRoute(item.path) && "text-sidebar-primary"
                        )}>
                          {item.name}
                        </span>
                        {isActiveRoute(item.path) && (
                          <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-md" />
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

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-left font-normal"
                onClick={toggleTheme}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                )}
              </Button>
            </TooltipTrigger>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full font-normal"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;

