
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReportsProvider } from "@/contexts/ReportsContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import all pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Financial from "@/pages/Financial";
import Members from "@/pages/Members";
import Events from "@/pages/Events";
import Reconciliations from "@/pages/Reconciliations";
import Congregations from "@/pages/Congregations";
import Ministries from "@/pages/Ministries";
import Departments from "@/pages/Departments";
import Suppliers from "@/pages/Suppliers";
import Reports from "@/pages/Reports";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import AccessManagement from "@/pages/AccessManagement";

// Import notification pages
import NewNotification from "@/pages/notifications/NewNotification";
import ScheduledMessages from "@/pages/notifications/ScheduledMessages";
import SentHistory from "@/pages/notifications/SentHistory";
import VideoLibrary from "@/pages/notifications/VideoLibrary";

// Import report pages
import EventsReports from "@/pages/reports/EventsReports";
import FinancialReports from "@/pages/reports/FinancialReports";
import MembersReports from "@/pages/reports/MembersReports";
import ReconciliationsReports from "@/pages/reports/ReconciliationsReports";
import SuppliersReports from "@/pages/reports/SuppliersReports";

// Import accounts payable pages
import NewAccount from "@/pages/accounts-payable/NewAccount";
import PendingApproval from "@/pages/accounts-payable/PendingApproval";
import AuthorizeAccounts from "@/pages/accounts-payable/AuthorizeAccounts";
import ApprovedAccounts from "@/pages/accounts-payable/ApprovedAccounts";
import PaidAccounts from "@/pages/accounts-payable/PaidAccounts";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ReportsProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
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
              
              <Route path="/conciliacoes" element={
                <ProtectedRoute 
                  requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}
                  requiresCongregationAccess={true}
                >
                  <Reconciliations />
                </ProtectedRoute>
              } />
              
              <Route path="/congregacoes" element={
                <ProtectedRoute 
                  requiredRoles={['superadmin', 'admin', 'pastor']}
                  requiresCongregationAccess={true}
                >
                  <Congregations />
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
              
              <Route path="/fornecedores" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance']}>
                  <Suppliers />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios/eventos" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}>
                  <EventsReports />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios/financeiro" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}>
                  <FinancialReports />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios/membros" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}>
                  <MembersReports />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios/conciliacoes" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}>
                  <ReconciliationsReports />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios/fornecedores" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin', 'finance', 'pastor']}>
                  <SuppliersReports />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <Notifications />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/nova" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <NewNotification />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/agendadas" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <ScheduledMessages />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/historico" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <SentHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/videos" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <VideoLibrary />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/access-management" element={
                <ProtectedRoute requiredRoles={['superadmin', 'admin']}>
                  <AccessManagement />
                </ProtectedRoute>
              } />
              
              {/* Accounts Payable Routes */}
              <Route path="/accounts-payable/new" element={
                <ProtectedRoute requiredRoles={['assistente', 'analista', 'gerente', 'pastor']}>
                  <NewAccount />
                </ProtectedRoute>
              } />
              
              <Route path="/accounts-payable/pending-approval" element={
                <ProtectedRoute>
                  <PendingApproval />
                </ProtectedRoute>
              } />
              
              <Route path="/accounts-payable/authorize" element={
                <ProtectedRoute requiredRoles={['gerente', 'diretor', 'presidente', 'admin', 'superadmin']}>
                  <AuthorizeAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="/accounts-payable/approved" element={
                <ProtectedRoute>
                  <ApprovedAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="/accounts-payable/paid" element={
                <ProtectedRoute>
                  <PaidAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ReportsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
