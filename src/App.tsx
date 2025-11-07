import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminSidebar } from "./components/AdminSidebar";
import { EmployeeSidebar } from "./components/EmployeeSidebar";

import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import Employees from "@/pages/Employees";
import TimeTracking from "@/pages/TimeTracking";
import Projects from "@/pages/Projects";
import Absences from "@/pages/Absences";
import Settings from "@/pages/Settings";
import MyTimes from "@/pages/MyTimes";
import MyAbsences from "@/pages/MyAbsences";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function DashboardRouter() {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {isAdmin ? <AdminSidebar /> : <EmployeeSidebar />}
        <SidebarInset className="flex-1 w-full min-w-0">
          <Routes>
            <Route path="/dashboard" element={isAdmin ? <AdminDashboard /> : <EmployeeDashboard />} />
            <Route path="/employees" element={isAdmin ? <Employees /> : <Navigate to="/dashboard" />} />
            <Route path="/time-tracking" element={isAdmin ? <TimeTracking /> : <Navigate to="/dashboard" />} />
            <Route path="/projects" element={isAdmin ? <Projects /> : <Navigate to="/dashboard" />} />
            <Route path="/absences" element={isAdmin ? <Absences /> : <Navigate to="/dashboard" />} />
            <Route path="/settings" element={isAdmin ? <Settings /> : <Navigate to="/dashboard" />} />
            <Route path="/my-times" element={!isAdmin ? <MyTimes /> : <Navigate to="/dashboard" />} />
            <Route path="/my-absences" element={!isAdmin ? <MyAbsences /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;