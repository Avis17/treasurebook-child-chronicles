
import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Book, Calendar, Image, Settings, List, User } from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isMobile, isOpen, setIsOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const navItems = [
    { name: "Dashboard", icon: <List className="w-5 h-5" />, path: "/dashboard" },
    { name: "Academic Records", icon: <Book className="w-5 h-5" />, path: "/academics" },
    { name: "Gallery", icon: <Image className="w-5 h-5" />, path: "/gallery" },
    { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
    { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
  ];
  
  return (
    <div 
      className={`${
        isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`
          : "flex h-screen min-w-64 flex-col bg-white shadow-md"
      }`}
    >
      <div className="flex items-center justify-center p-4 border-b">
        <h1 className="text-xl font-bold text-treasure-blue">TreasureBook</h1>
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
                      ? "bg-treasure-blue text-white"
                      : "hover:bg-treasure-lightBlue hover:text-treasure-blue"
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

      <div className="border-t p-4">
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
