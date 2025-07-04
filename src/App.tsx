
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthPage from "@/components/auth/AuthPage";
import Dashboard from "@/pages/Dashboard";
import Financial from "@/pages/Financial";
import Members from "@/pages/Members";
import Events from "@/pages/Events";
import Ministries from "@/pages/Ministries";
import Departments from "@/pages/Departments";
import Congregations from "@/pages/Congregations";
import Reconciliations from "@/pages/Reconciliations";
import Suppliers from "@/pages/Suppliers";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance']}>
                <Financial />
              </ProtectedRoute>
            } />
            <Route path="/membros" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'pastor', 'worker']}>
                <Members />
              </ProtectedRoute>
            } />
            <Route path="/eventos" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'pastor']}>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/ministerios" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'pastor']}>
                <Ministries />
              </ProtectedRoute>
            } />
            <Route path="/departamentos" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'pastor']}>
                <Departments />
              </ProtectedRoute>
            } />
            <Route path="/congregacoes" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'pastor']}>
                <Congregations />
              </ProtectedRoute>
            } />
            <Route path="/conciliacoes" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance']}>
                <Reconciliations />
              </ProtectedRoute>
            } />
            <Route path="/fornecedores" element={
              <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance']}>
                <Suppliers />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
