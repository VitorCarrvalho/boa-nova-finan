import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Home,
  Users,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  MessageSquare,
  Receipt,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield,
  HeartHandshake,
  Truck,
  Calculator,
} from 'lucide-react';

interface MenuItemType {
  title: string;
  icon: React.ComponentType<any>;
  route: string;
  module: string;
  requiresCongregationAccess?: boolean;
}

interface SubmenuItemType {
  title: string;
  route: string;
  module: string;
}

const DesktopSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { canViewModule } = usePermissions();
  const { data: congregationAccess } = useUserCongregationAccess();
  const hasAccessToAnyCongregation = congregationAccess?.hasAccess || false;
  const { state } = useSidebar();

  const [reportsOpen, setReportsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountsPayableOpen, setAccountsPayableOpen] = useState(false);

  const menuItems: MenuItemType[] = [
    { title: 'Dashboard', icon: Home, route: '/dashboard', module: 'dashboard' },
    { title: 'Membros', icon: Users, route: '/members', module: 'members' },
    { title: 'Congregações', icon: MapPin, route: '/congregations', module: 'congregations' },
    { title: 'Departamentos', icon: Building2, route: '/departments', module: 'departments' },
    { title: 'Ministérios', icon: HeartHandshake, route: '/ministries', module: 'ministries' },
    { title: 'Eventos', icon: Calendar, route: '/events', module: 'events' },
    { title: 'Financeiro', icon: DollarSign, route: '/financial', module: 'financial', requiresCongregationAccess: true },
    { title: 'Reconciliações', icon: Calculator, route: '/reconciliations', module: 'reconciliations', requiresCongregationAccess: true },
    { title: 'Fornecedores', icon: Truck, route: '/suppliers', module: 'suppliers' },
    { title: 'Documentação', icon: FileText, route: '/documentation', module: 'documentation' },
  ];

  const reportSubmenus: SubmenuItemType[] = [
    { title: 'Relatórios Financeiros', route: '/reports/financial', module: 'reports' },
    { title: 'Relatórios de Membros', route: '/reports/members', module: 'reports' },
    { title: 'Relatórios de Eventos', route: '/reports/events', module: 'reports' },
    { title: 'Relatórios de Reconciliações', route: '/reports/reconciliations', module: 'reports' },
    { title: 'Relatórios de Fornecedores', route: '/reports/suppliers', module: 'reports' },
  ];

  const notificationSubmenus: SubmenuItemType[] = [
    { title: 'Nova Notificação', route: '/notifications/new', module: 'notifications' },
    { title: 'Mensagens Recorrentes', route: '/notifications/recurring', module: 'notifications' },
    { title: 'Mensagens Agendadas', route: '/notifications/scheduled', module: 'notifications' },
    { title: 'Histórico de Envios', route: '/notifications/history', module: 'notifications' },
    { title: 'Biblioteca de Vídeos', route: '/notifications/videos', module: 'notifications' },
  ];

  const accountsPayableSubmenus: SubmenuItemType[] = [
    { title: 'Nova Conta', route: '/accounts-payable/new', module: 'accounts_payable' },
    { title: 'Pendente Aprovação', route: '/accounts-payable/pending', module: 'accounts_payable' },
    { title: 'Autorizar Contas', route: '/accounts-payable/authorize', module: 'accounts_payable' },
    { title: 'Contas Aprovadas', route: '/accounts-payable/approved', module: 'accounts_payable' },
    { title: 'Contas Pagas', route: '/accounts-payable/paid', module: 'accounts_payable' },
  ];

  const visibleItems = menuItems.filter(item => {
    const hasPermission = canViewModule(item.module);
    const hasCongregationAccess = item.requiresCongregationAccess ? hasAccessToAnyCongregation : true;
    return hasPermission && hasCongregationAccess;
  });

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const isActiveRoute = (route: string) => {
    return location.pathname === route;
  };

  const isActiveSubmenu = (submenus: SubmenuItemType[]) => {
    return submenus.some(submenu => location.pathname === submenu.route);
  };

  const MenuItemComponent = ({ item }: { item: MenuItemType }) => {
    const isActive = isActiveRoute(item.route);

    if (state === "collapsed") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                onClick={() => navigate(item.route)}
                className={`w-full justify-center p-3 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5" />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <SidebarMenuButton
        onClick={() => navigate(item.route)}
        className={`w-full justify-start p-3 ${
          isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
        }`}
      >
        <item.icon className="h-5 w-5 mr-3" />
        <span>{item.title}</span>
      </SidebarMenuButton>
    );
  };

  const CollapsibleMenuItem = ({ 
    icon: Icon, 
    title, 
    isOpen, 
    onToggle, 
    children,
    isActiveSubmenu: isActive 
  }: {
    icon: React.ComponentType<any>;
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    isActiveSubmenu: boolean;
  }) => {
    if (state === "collapsed") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                onClick={onToggle}
                className={`w-full justify-center p-3 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right" className="ml-2">
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className={`w-full justify-between p-3 ${
              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-3" />
              <span>{title}</span>
            </div>
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-card"
    >
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.route}>
                  <MenuItemComponent item={item} />
                </SidebarMenuItem>
              ))}

              {canViewModule('reports') && (
                <SidebarMenuItem key="reports">
                  <CollapsibleMenuItem
                    icon={BarChart3}
                    title="Relatórios"
                    isOpen={reportsOpen}
                    onToggle={() => setReportsOpen(!reportsOpen)}
                    isActiveSubmenu={isActiveSubmenu(reportSubmenus)}
                  >
                    <div className="space-y-1">
                      {reportSubmenus.filter(submenu => canViewModule(submenu.module)).map((submenu) => (
                        <Button
                          key={submenu.route}
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(submenu.route)}
                          className={`w-full justify-start text-sm ${
                            isActiveRoute(submenu.route) ? 'bg-muted' : ''
                          }`}
                        >
                          {submenu.title}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleMenuItem>
                </SidebarMenuItem>
              )}

              {canViewModule('notifications') && (
                <SidebarMenuItem key="notifications">
                  <CollapsibleMenuItem
                    icon={MessageSquare}
                    title="Notificações"
                    isOpen={notificationsOpen}
                    onToggle={() => setNotificationsOpen(!notificationsOpen)}
                    isActiveSubmenu={isActiveSubmenu(notificationSubmenus)}
                  >
                    <div className="space-y-1">
                      {notificationSubmenus.filter(submenu => canViewModule(submenu.module)).map((submenu) => (
                        <Button
                          key={submenu.route}
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(submenu.route)}
                          className={`w-full justify-start text-sm ${
                            isActiveRoute(submenu.route) ? 'bg-muted' : ''
                          }`}
                        >
                          {submenu.title}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleMenuItem>
                </SidebarMenuItem>
              )}

              {canViewModule('accounts_payable') && (
                <SidebarMenuItem key="accounts_payable">
                  <CollapsibleMenuItem
                    icon={Receipt}
                    title="Contas a Pagar"
                    isOpen={accountsPayableOpen}
                    onToggle={() => setAccountsPayableOpen(!accountsPayableOpen)}
                    isActiveSubmenu={isActiveSubmenu(accountsPayableSubmenus)}
                  >
                    <div className="space-y-1">
                      {accountsPayableSubmenus.filter(submenu => canViewModule(submenu.module)).map((submenu) => (
                        <Button
                          key={submenu.route}
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(submenu.route)}
                          className={`w-full justify-start text-sm ${
                            isActiveRoute(submenu.route) ? 'bg-muted' : ''
                          }`}
                        >
                          {submenu.title}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleMenuItem>
                </SidebarMenuItem>
              )}

              {canViewModule('access_management') && (
                <SidebarMenuItem key="access_management">
                  <MenuItemComponent item={{
                    title: 'Gestão de Acessos',
                    icon: Shield,
                    route: '/access-management',
                    module: 'access_management'
                  }} />
                </SidebarMenuItem>
              )}

              {canViewModule('settings') && (
                <SidebarMenuItem key="settings">
                  <MenuItemComponent item={{
                    title: 'Configurações',
                    icon: Settings,
                    route: '/settings',
                    module: 'settings'
                  }} />
                </SidebarMenuItem>
              )}

              <SidebarMenuItem key="logout">
                {state === "collapsed" ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          onClick={handleLogout}
                          className="w-full justify-center p-3 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <LogOut className="h-5 w-5" />
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="ml-2">
                        <p>Sair</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="w-full justify-start p-3 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Sair</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DesktopSidebar;