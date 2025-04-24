
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import AcademicRecords from "./pages/AcademicRecords";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Resources from "./pages/Resources";
import Directory from "./pages/Directory";
import Sports from "./pages/Sports";
import Extracurricular from "./pages/Extracurricular";
import NotFound from "./pages/NotFound";
import UsersManagement from "./pages/UsersManagement";
import VerificationPending from "./pages/VerificationPending";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminRoute from "./components/auth/AdminRoute";
import Milestones from "./pages/Milestones";
import Goals from "./pages/Goals";
import Journal from "./pages/Journal";
import Documents from "./pages/Documents";
import Feedback from "./pages/Feedback";
import BackupExport from "./pages/BackupExport";
import AIInsights from "./pages/AIInsights";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verification-pending" element={<VerificationPending />} />
              
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/academics" element={<AcademicRecords />} />
                <Route path="/sports" element={<Sports />} />
                <Route path="/extracurricular" element={<Extracurricular />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/milestones" element={<Milestones />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/backup" element={<BackupExport />} />
                <Route path="/ai-insights" element={<AIInsights />} />
              </Route>
              
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UsersManagement />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
