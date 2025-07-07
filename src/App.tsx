
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Financial from "./pages/Financial";
import Events from "./pages/Events";
import Ministries from "./pages/Ministries";
import Departments from "./pages/Departments";
import Congregations from "./pages/Congregations";
import Reconciliations from "./pages/Reconciliations";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";

// Notification pages
import Notifications from "./pages/Notifications";
import NewNotification from "./pages/notifications/NewNotification";
import ScheduledMessages from "./pages/notifications/ScheduledMessages";
import SentHistory from "./pages/notifications/SentHistory";
import VideoLibrary from "./pages/notifications/VideoLibrary";

// Report pages
import FinancialReports from "./pages/reports/FinancialReports";
import MembersReports from "./pages/reports/MembersReports";
import EventsReports from "./pages/reports/EventsReports";
import ReconciliationsReports from "./pages/reports/ReconciliationsReports";
import SuppliersReports from "./pages/reports/SuppliersReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/membros" element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <Financial />
              </ProtectedRoute>
            } />
            <Route path="/eventos" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/ministerios" element={
              <ProtectedRoute>
                <Ministries />
              </ProtectedRoute>
            } />
            <Route path="/departamentos" element={
              <ProtectedRoute>
                <Departments />
              </ProtectedRoute>
            } />
            <Route path="/congregacoes" element={
              <ProtectedRoute>
                <Congregations />
              </ProtectedRoute>
            } />
            <Route path="/conciliacoes" element={
              <ProtectedRoute>
                <Reconciliations />
              </ProtectedRoute>
            } />
            
            {/* Notification routes - Admin only */}
            <Route path="/notificacoes" element={
              <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/notificacoes/nova" element={
              <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
                <NewNotification />
              </ProtectedRoute>
            } />
            <Route path="/notificacoes/agendadas" element={
              <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
                <ScheduledMessages />
              </ProtectedRoute>
            } />
            <Route path="/notificacoes/historico" element={
              <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
                <SentHistory />
              </ProtectedRoute>
            } />
            <Route path="/notificacoes/videos" element={
              <ProtectedRoute requiredRoles={['admin', 'superadmin']}>
                <VideoLibrary />
              </ProtectedRoute>
            } />

            {/* Report routes */}
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/relatorios/financeiro" element={
              <ProtectedRoute>
                <FinancialReports />
              </ProtectedRoute>
            } />
            <Route path="/relatorios/membros" element={
              <ProtectedRoute>
                <MembersReports />
              </ProtectedRoute>
            } />
            <Route path="/relatorios/eventos" element={
              <ProtectedRoute>
                <EventsReports />
              </ProtectedRoute>
            } />
            <Route path="/relatorios/conciliacoes" element={
              <ProtectedRoute>
                <ReconciliationsReports />
              </ProtectedRoute>
            } />
            <Route path="/relatorios/fornecedores" element={
              <ProtectedRoute>
                <SuppliersReports />
              </ProtectedRoute>
            } />
            <Route path="/fornecedores" element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
