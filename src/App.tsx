
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PocListPage from "./pages/PocListPage";
import PocDetailPage from "./pages/PocDetailPage";
import PocFormPage from "./pages/PocFormPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import MyInfoPage from "./pages/MyInfoPage";
import CustomersPage from "./pages/CustomersPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pocs" 
              element={
                <ProtectedRoute>
                  <PocListPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pocs/:id" 
              element={
                <ProtectedRoute>
                  <PocDetailPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pocs/create" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'poc', action: 'create' }}>
                  <PocFormPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/pocs/:id/edit" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'poc', action: 'edit' }}>
                  <PocFormPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employees" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'employee', action: 'view' }}>
                  <EmployeeListPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/my-info" 
              element={
                <ProtectedRoute>
                  <MyInfoPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/customers" 
              element={
                <ProtectedRoute requiredPermission={{ resource: 'customer', action: 'view' }}>
                  <CustomersPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
