import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ReportsProvider } from "@/contexts/ReportsContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import all pages
import Index from "@/pages/Index";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
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
import Documentation from "@/pages/Documentation";

// Import notification pages
import NewNotification from "@/pages/notifications/NewNotification";
import ScheduledMessages from "@/pages/notifications/ScheduledMessages";
import SentHistory from "@/pages/notifications/SentHistory";
import VideoLibrary from "@/pages/notifications/VideoLibrary";
import RecurringMessages from "@/pages/notifications/RecurringMessages";
import ReportsMenu from "@/pages/ReportsMenu";
import AccountsPayableMenu from "@/pages/AccountsPayableMenu";

// Import report pages
import EventsReports from "@/pages/reports/EventsReports";
import FinancialReports from "@/pages/reports/FinancialReports";
import MembersReports from "@/pages/reports/MembersReports";
import ReconciliationsReports from "@/pages/reports/ReconciliationsReports";
import SuppliersReports from "@/pages/reports/SuppliersReports";

// Import accounts payable pages
import NewAccount from "@/pages/accounts-payable/NewAccount";
import ImportAccounts from "@/pages/accounts-payable/ImportAccounts";
import PendingApproval from "@/pages/accounts-payable/PendingApproval";
import AuthorizeAccounts from "@/pages/accounts-payable/AuthorizeAccounts";
import ApprovedAccounts from "@/pages/accounts-payable/ApprovedAccounts";
import PaidAccounts from "@/pages/accounts-payable/PaidAccounts";
import TestDropdowns from "@/pages/TestDropdowns";

// Import Conecta IPTM pages
import ConectaIPTM from "@/pages/ConectaIPTM";
import ConectaProviderProfile from "@/pages/ConectaProviderProfile";

import NotFound from "@/pages/NotFound";
import VerifyRedirect from "@/components/VerifyRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ReportsProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                
                {/* Conecta IPTM - Public Routes */}
                <Route path="/conecta" element={<ConectaIPTM />} />
                <Route path="/conecta/perfil/:slug" element={<ConectaProviderProfile />} />
                
                <Route path="/auth" element={<Auth />} />
                <Route path="/verify" element={<VerifyRedirect />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/financeiro" element={
                <ProtectedRoute>
                  <Financial />
                </ProtectedRoute>
              } />
              
              <Route path="/membros" element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              } />
              
              <Route path="/eventos" element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              } />
              
              <Route path="/conciliacoes" element={
                <ProtectedRoute>
                  <Reconciliations />
                </ProtectedRoute>
              } />
              
              <Route path="/congregacoes" element={
                <ProtectedRoute 
                  requiresCongregationAccess={true}
                >
                  <Congregations />
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
              
              <Route path="/fornecedores" element={
                <ProtectedRoute>
                  <Suppliers />
                </ProtectedRoute>
              } />
              
              {/* Reports Routes */}
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <ReportsMenu />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios/eventos" element={
                <ProtectedRoute>
                  <EventsReports />
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
              
              {/* Notifications Routes */}
              <Route path="/notificacoes" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/nova" element={
                <ProtectedRoute>
                  <NewNotification />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/agendadas" element={
                <ProtectedRoute>
                  <ScheduledMessages />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/historico" element={
                <ProtectedRoute>
                  <SentHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/recorrentes" element={
                <ProtectedRoute>
                  <RecurringMessages />
                </ProtectedRoute>
              } />
              
              <Route path="/notificacoes/videos" element={
                <ProtectedRoute>
                  <VideoLibrary />
                </ProtectedRoute>
              } />
              
              {/* Access Management & Settings Routes */}
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="/gestao-acessos" element={
                <ProtectedRoute>
                  <AccessManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/documentacao" element={
                <ProtectedRoute>
                  <Documentation />
                </ProtectedRoute>
              } />
              
              {/* Accounts Payable Routes */}
              <Route path="/contas-pagar" element={
                <ProtectedRoute>
                  <AccountsPayableMenu />
                </ProtectedRoute>
              } />
              
              <Route path="/contas-pagar/nova" element={
                <ProtectedRoute>
                  <NewAccount />
                </ProtectedRoute>
              } />
              
              <Route path="/contas-pagar/importar" element={
                <ProtectedRoute>
                  <ImportAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="/contas-pagar/pendente-aprovacao" element={
                <ProtectedRoute>
                  <PendingApproval />
                </ProtectedRoute>
              } />
              
              <Route path="/contas-pagar/autorizar" element={
                <ProtectedRoute>
                  <AuthorizeAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="/contas-pagar/aprovadas" element={
                <ProtectedRoute>
                  <ApprovedAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="/contas-pagar/pagas" element={
                <ProtectedRoute>
                  <PaidAccounts />
                </ProtectedRoute>
              } />
              
              {/* Legacy routes for compatibility */}
              <Route path="/settings" element={<Navigate to="/configuracoes" replace />} />
              <Route path="/access-management" element={<Navigate to="/gestao-acessos" replace />} />
              <Route path="/accounts-payable/new" element={<Navigate to="/contas-pagar/nova" replace />} />
              <Route path="/accounts-payable/pending-approval" element={<Navigate to="/contas-pagar/pendente-aprovacao" replace />} />
              <Route path="/accounts-payable/authorize" element={<Navigate to="/contas-pagar/autorizar" replace />} />
              <Route path="/accounts-payable/approved" element={<Navigate to="/contas-pagar/aprovadas" replace />} />
              <Route path="/accounts-payable/paid" element={<Navigate to="/contas-pagar/pagas" replace />} />
               
                <Route path="/test-dropdowns" element={
                  <ProtectedRoute>
                    <TestDropdowns />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ReportsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;