import { useState, useEffect } from "react"
import { useNavigate, NavLink, useLocation } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  BrainCircuit,
  Mic,
  ChevronDown,
  ChevronRight,
  Home,
  GraduationCap,
  CalendarDays,
  BookOpenText,
  MessageSquare,
  HelpCircle,
  File,
  Image,
  ChevronLeft,
  Lock,
  Gamepad
} from "lucide-react"
import { useTheme } from "@/providers/ThemeProvider"
import { useAuth } from "@/contexts/AuthContext"
import { doc, getDoc } from "firebase/firestore"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavGroup {
  title: string
  items: NavItem[]
}

interface NavItem {
  name: string
  icon: React.ReactNode
  path: string
  requiresPermission?: 'storage' | 'aiInsights' | 'quiz' | 'voicePractice' | 'funLearning'
  disabled?: boolean
}

interface SidebarProps {
  isMobile: boolean;
}

const saveSidebarState = (isCollapsed: boolean, openGroups: string[]) => {
  try {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    localStorage.setItem('sidebarOpenGroups', JSON.stringify(openGroups));
  } catch (error) {
    console.error("Error saving sidebar state to localStorage:", error);
  }
};

const getSidebarState = () => {
  try {
    const isCollapsed = localStorage.getItem('sidebarCollapsed');
    const openGroups = localStorage.getItem('sidebarOpenGroups');
    return {
      isCollapsed: isCollapsed ? JSON.parse(isCollapsed) : false,
      openGroups: openGroups ? JSON.parse(openGroups) : ['Overview']
    };
  } catch (error) {
    console.error("Error getting sidebar state from localStorage:", error);
    return { isCollapsed: false, openGroups: ['Overview'] };
  }
};

const Sidebar = ({ isMobile }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, currentUser } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  const { isCollapsed: initialCollapsed, openGroups: initialOpenGroups } = getSidebarState();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return window.innerWidth < 768 ? false : initialCollapsed;
  });
  const [openGroups, setOpenGroups] = useState<string[]>(initialOpenGroups);

  useEffect(() => {
    const fetchProfileName = async () => {
      if (!currentUser?.uid) return;

      try {
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (data.childName) {
            setProfileName(data.childName);
            return;
          }
        }

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.displayName) {
            setProfileName(data.displayName);
            return;
          }
        }

        setProfileName(currentUser.displayName);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileName();
  }, [currentUser]);

  useEffect(() => {
    saveSidebarState(isCollapsed, openGroups);
  }, [isCollapsed, openGroups]);

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

  const getNavGroups = (): NavGroup[] => {
    const hasStorageAccess = currentUser?.permissions?.storage || isAdmin;
    const hasAIInsightsAccess = currentUser?.permissions?.aiInsights || isAdmin;
    const hasQuizAccess = currentUser?.permissions?.quiz || isAdmin;
    const hasVoicePracticeAccess = currentUser?.permissions?.voicePractice || isAdmin;
    const hasFunLearningAccess = currentUser?.permissions?.funLearning || isAdmin;

    const groups: NavGroup[] = [
      {
        title: "Overview",
        items: [
          { name: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashboard" },
          {
            name: "AI Insights",
            icon: hasAIInsightsAccess ? <Lightbulb className="w-5 h-5" /> : <Lock className="w-5 h-5" />,
            path: "/ai-insights",
            requiresPermission: 'aiInsights',
            disabled: !hasAIInsightsAccess
          },
        ]
      },
      {
        title: "Learning",
        items: [
          { name: "Academic Records", icon: <Book className="w-5 h-5" />, path: "/academics" },
          {
            name: "Quiz Master",
            icon: hasQuizAccess ? <BrainCircuit className="w-5 h-5" /> : <Lock className="w-5 h-5" />,
            path: "/quizzes",
            requiresPermission: 'quiz',
            disabled: !hasQuizAccess
          },
          {
            name: "Fun Learning",
            icon: hasFunLearningAccess ? <Gamepad className="w-5 h-5" /> : <Lock className="w-5 h-5" />,
            path: "/fun-learning",
            requiresPermission: 'funLearning',
            disabled: !hasFunLearningAccess
          },
          {
            name: "Voice Practice",
            icon: hasVoicePracticeAccess ? <Mic className="w-5 h-5" /> : <Lock className="w-5 h-5" />,
            path: "/voice-practice",
            requiresPermission: 'voicePractice',
            disabled: !hasVoicePracticeAccess
          },
        ]
      },
      {
        title: "Activities",
        items: [
          { name: "Sports", icon: <Trophy className="w-5 h-5" />, path: "/sports" },
          { name: "Extracurricular", icon: <Award className="w-5 h-5" />, path: "/extracurricular" },
          { name: "Goals", icon: <Target className="w-5 h-5" />, path: "/goals" },
          { name: "Journal", icon: <BookOpen className="w-5 h-5" />, path: "/journal" },
        ]
      },
      {
        title: "Resources",
        items: [
          {
            name: "Gallery",
            icon: hasStorageAccess ? <ImageIcon className="w-5 h-5" /> : <Lock className="w-5 h-5" />,
            path: "/gallery",
            requiresPermission: 'storage',
            disabled: !hasStorageAccess
          },
          {
            name: "Documents",
            icon: hasStorageAccess ? <FileArchive className="w-5 h-5" /> : <Lock className="w-5 h-5" />,
            path: "/documents",
            requiresPermission: 'storage',
            disabled: !hasStorageAccess
          },
          { name: "Resources", icon: <FileText className="w-5 h-5" />, path: "/resources" },
        ]
      },
      {
        title: "Management",
        items: [
          { name: "Directory", icon: <Users className="w-5 h-5" />, path: "/directory" },
          { name: "Calendar", icon: <Calendar className="w-5 h-5" />, path: "/calendar" },
          { name: "Profile", icon: <User className="w-5 h-5" />, path: "/profile" },
          { name: "Settings", icon: <Settings className="w-5 h-5" />, path: "/settings" },
        ]
      },
    ]

    if (isAdmin) {
      groups.push({
        title: "Admin",
        items: [
          { name: "User Management", icon: <Users className="w-5 h-5" />, path: "/users" },
        ]
      })
    }

    return groups
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <img
            src="/lovable-uploads/48331f19-76fe-409d-9a1d-f0861cac4194.png"
            alt="Treasure Book Logo"
            className="h-10 w-auto"
          />
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={`${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <nav className="px-3 py-2">
          <div className="space-y-1">
            {getNavGroups().map((group) => (
              <Collapsible
                key={group.title}
                open={!isCollapsed && openGroups.includes(group.title)}
                onOpenChange={() => !isCollapsed && toggleGroup(group.title)}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <button className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md ${isCollapsed ? 'justify-center' : ''
                    }`}>
                    {!isCollapsed && group.title}
                    {!isCollapsed && (
                      openGroups.includes(group.title) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1">
                  {group.items.map((item) => (
                    <TooltipProvider key={item.path} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <NavLink
                              to={item.disabled ? "#" : item.path}
                              className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                                transition-colors duration-150 ease-in-out ${isCollapsed ? 'justify-center' : 'ml-2'
                                }
                                ${item.disabled
                                  ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
                                  : isActive
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
                              `}
                              onClick={(e) => {
                                if (item.disabled) {
                                  e.preventDefault();
                                }
                              }}
                              title={isCollapsed ? item.name : undefined}
                            >
                              {item.icon}
                              {!isCollapsed && <span>{item.name}</span>}
                              {!isCollapsed && item.disabled && (
                                <span className="ml-auto text-xs text-red-500">(Restricted)</span>
                              )}
                            </NavLink>
                          </div>
                        </TooltipTrigger>
                        {(isCollapsed || item.disabled) && (
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                            {item.disabled && <p className="text-xs text-red-500">Access Restricted</p>}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </nav>
      </ScrollArea>

      <div className="shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-${isCollapsed ? 'center' : 'between'} w-full gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
            text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={`flex items-center justify-${isCollapsed ? 'center' : 'between'} w-full gap-3 px-3 py-2 mt-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
            text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Log out</span>}
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
