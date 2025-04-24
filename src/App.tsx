
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import VerificationPending from "@/pages/VerificationPending";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import PrivateRoute from "@/components/auth/PrivateRoute";
import UsersManagement from "@/pages/UsersManagement";
import AcademicRecords from "@/pages/AcademicRecords";
import Extracurricular from "@/pages/Extracurricular";
import Sports from "@/pages/Sports";
import Goals from "@/pages/Goals";
import Journal from "@/pages/Journal";
import Resources from "@/pages/Resources";
import Gallery from "@/pages/Gallery";
import Documents from "@/pages/Documents";
import Directory from "@/pages/Directory";
import Milestones from "@/pages/Milestones";
import AIInsights from "@/pages/AIInsights";
import BackupExport from "@/pages/BackupExport";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Feedback from "@/pages/Feedback";
import Calendar from "@/pages/Calendar";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route index element={<Index />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verification-pending" element={<VerificationPending />} />
            <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="academic-records" element={<PrivateRoute><AcademicRecords /></PrivateRoute>} />
            <Route path="academics" element={<PrivateRoute><AcademicRecords /></PrivateRoute>} /> 
            <Route path="extracurricular" element={<PrivateRoute><Extracurricular /></PrivateRoute>} />
            <Route path="sports" element={<PrivateRoute><Sports /></PrivateRoute>} />
            <Route path="goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
            <Route path="journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
            <Route path="calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
            <Route path="resources" element={<PrivateRoute><Resources /></PrivateRoute>} />
            <Route path="gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
            <Route path="documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
            <Route path="directory" element={<PrivateRoute><Directory /></PrivateRoute>} />
            <Route path="milestones" element={<PrivateRoute><Milestones /></PrivateRoute>} />
            <Route path="ai-insights" element={<PrivateRoute><AIInsights /></PrivateRoute>} />
            <Route path="backup-export" element={<PrivateRoute><BackupExport /></PrivateRoute>} />
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
            <Route path="users" element={<PrivateRoute requiresAdmin={true}><UsersManagement /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
