
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VerificationPending from "./pages/VerificationPending";
import PrivateRoute from "./components/auth/PrivateRoute";
import AdminRoute from "./components/auth/AdminRoute";
import UsersManagement from "./pages/UsersManagement";
import AcademicRecords from "./pages/AcademicRecords";
import Sports from "./pages/Sports";
import Profile from "./pages/Profile";
import Directory from "./pages/Directory";
import Extracurricular from "./pages/Extracurricular";
import Journal from "./pages/Journal";
import Goals from "./pages/Goals";
import Calendar from "./pages/Calendar";
import AIInsights from "./pages/AIInsights";
import Documents from "./pages/Documents";
import Gallery from "./pages/Gallery";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Quizzes from "./pages/Quizzes";
import VoicePractice from "./pages/VoicePractice";
import FunLearning from "./pages/FunLearning";
import AnimalsGame from "./pages/fun-learning/Animals";
import ShapesGame from "./pages/fun-learning/Shapes";
import NumbersGame from "./pages/fun-learning/Numbers";
import ColorsGame from "./pages/fun-learning/Colors";
import FlagsGame from "./pages/fun-learning/Flags";

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster as ShadcnToaster } from "./components/ui/toaster";

// Create query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Add mobile-specific meta tag for proper viewport
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Handle status bar for iOS
    document.body.classList.add('capacitor-app');
    
    return () => {
      document.body.classList.remove('capacitor-app');
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="treasurebook-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verification-pending" element={<VerificationPending />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/academics"
                element={
                  <PrivateRoute>
                    <AcademicRecords />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sports"
                element={
                  <PrivateRoute>
                    <Sports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/directory"
                element={
                  <PrivateRoute>
                    <Directory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/extracurricular"
                element={
                  <PrivateRoute>
                    <Extracurricular />
                  </PrivateRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <PrivateRoute>
                    <Journal />
                  </PrivateRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <PrivateRoute>
                    <Goals />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <Calendar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ai-insights"
                element={
                  <PrivateRoute requirePermission="aiInsights">
                    <AIInsights />
                  </PrivateRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <PrivateRoute requirePermission="storage">
                    <Documents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <PrivateRoute requirePermission="storage">
                    <Gallery />
                  </PrivateRoute>
                }
              />
              <Route
                path="/resources"
                element={
                  <PrivateRoute>
                    <Resources />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/help"
                element={
                  <PrivateRoute>
                    <Help />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <UsersManagement />
                  </AdminRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <PrivateRoute requirePermission="quiz">
                    <Quizzes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/voice-practice"
                element={
                  <PrivateRoute requirePermission="voicePractice">
                    <VoicePractice />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fun-learning"
                element={
                  <PrivateRoute requirePermission="funLearning">
                    <FunLearning />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fun-learning/animals"
                element={
                  <PrivateRoute requirePermission="funLearning">
                    <AnimalsGame />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fun-learning/shapes"
                element={
                  <PrivateRoute requirePermission="funLearning">
                    <ShapesGame />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fun-learning/numbers"
                element={
                  <PrivateRoute requirePermission="funLearning">
                    <NumbersGame />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fun-learning/colors"
                element={
                  <PrivateRoute requirePermission="funLearning">
                    <ColorsGame />
                  </PrivateRoute>
                }
              />
              <Route
                path="/fun-learning/flags"
                element={
                  <PrivateRoute requirePermission="funLearning">
                    <FlagsGame />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-center" />
          <ShadcnToaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
