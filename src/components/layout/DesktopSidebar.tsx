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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { 
    canViewModule,
    canViewPaidAccounts,
    canViewPendingApproval,
    canViewAuthorizeAccounts,
    canViewApprovedAccounts,
    canViewNewAccount
  } = usePermissions();
  const { data: congregationAccess } = useUserCongregationAccess();
  const hasAccessToAnyCongregation = congregationAccess?.hasAccess || false;
  const { state } = useSidebar();

  const [reportsOpen, setReportsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountsPayableOpen, setAccountsPayableOpen] = useState(false);

  const menuItems: MenuItemType[] = [
    { title: 'Dashboard', icon: Home, route: '/dashboard', module: 'dashboard' },
    { title: 'Membros', icon: Users, route: '/membros', module: 'membros' },
    { title: 'Congregações', icon: MapPin, route: '/congregacoes', module: 'congregacoes' },
    { title: 'Departamentos', icon: Building2, route: '/departamentos', module: 'departamentos' },
    { title: 'Ministérios', icon: HeartHandshake, route: '/ministerios', module: 'ministerios' },
    { title: 'Eventos', icon: Calendar, route: '/eventos', module: 'eventos' },
    { title: 'Financeiro', icon: DollarSign, route: '/financeiro', module: 'financeiro', requiresCongregationAccess: true },
    { title: 'Reconciliações', icon: Calculator, route: '/conciliacoes', module: 'conciliacoes', requiresCongregationAccess: true },
    { title: 'Fornecedores', icon: Truck, route: '/fornecedores', module: 'fornecedores' },
  ];

  const reportSubmenus: SubmenuItemType[] = [
    { title: 'Relatórios Financeiros', route: '/relatorios/financeiro', module: 'relatorios' },
    { title: 'Relatórios de Membros', route: '/relatorios/membros', module: 'relatorios' },
    { title: 'Relatórios de Eventos', route: '/relatorios/eventos', module: 'relatorios' },
    { title: 'Relatórios de Reconciliações', route: '/relatorios/conciliacoes', module: 'relatorios' },
    { title: 'Relatórios de Fornecedores', route: '/relatorios/fornecedores', module: 'relatorios' },
  ];

  const notificationSubmenus: SubmenuItemType[] = [
    { title: 'Nova Notificação', route: '/notificacoes/nova', module: 'notificacoes' },
    { title: 'Mensagens Recorrentes', route: '/notificacoes/recorrentes', module: 'notificacoes' },
    { title: 'Mensagens Agendadas', route: '/notificacoes/agendadas', module: 'notificacoes' },
    { title: 'Histórico de Envios', route: '/notificacoes/historico', module: 'notificacoes' },
    { title: 'Biblioteca de Vídeos', route: '/notificacoes/videos', module: 'notificacoes' },
  ];

  const accountsPayableSubmenus: SubmenuItemType[] = [
    { title: 'Nova Conta', route: '/contas-pagar/nova', module: 'contas-pagar' },
    { title: 'Pendente Aprovação', route: '/contas-pagar/pendente-aprovacao', module: 'contas-pagar' },
    { title: 'Autorizar Contas', route: '/contas-pagar/autorizar', module: 'contas-pagar' },
    { title: 'Contas Aprovadas', route: '/contas-pagar/aprovadas', module: 'contas-pagar' },
    { title: 'Contas Pagas', route: '/contas-pagar/pagas', module: 'contas-pagar' },
  ];

  const visibleItems = menuItems.filter(item => {
    if (!item) return false; // Guard against undefined items
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
    if (!item) return null; // Guard clause
    
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
        <ScrollArea className="h-[calc(100vh-2rem)]">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.route}>
                  <MenuItemComponent item={item} />
                </SidebarMenuItem>
              ))}

              {canViewModule('contas-pagar') && (
                <SidebarMenuItem key="contas-pagar">
                  <MenuItemComponent item={{
                    title: 'Contas a Pagar',
                    icon: Receipt,
                    route: '/contas-pagar',
                    module: 'contas-pagar'
                  }} />
                </SidebarMenuItem>
              )}

              {canViewModule('relatorios') && (
                <SidebarMenuItem key="relatorios">
                  <MenuItemComponent item={{
                    title: 'Relatórios',
                    icon: BarChart3,
                    route: '/relatorios',
                    module: 'relatorios'
                  }} />
                </SidebarMenuItem>
              )}

              {canViewModule('notificacoes') && (
                <SidebarMenuItem key="notificacoes">
                  <MenuItemComponent item={{
                    title: 'Notificações',
                    icon: MessageSquare,
                    route: '/notificacoes',
                    module: 'notificacoes'
                  }} />
                </SidebarMenuItem>
              )}

              {canViewModule('gestao-acessos') && (
                <SidebarMenuItem key="gestao-acessos">
                  <MenuItemComponent item={{
                    title: 'Gestão de Acessos',
                    icon: Shield,
                    route: '/gestao-acessos',
                    module: 'gestao-acessos'
                  }} />
                </SidebarMenuItem>
              )}

              {canViewModule('documentacao') && (
                <SidebarMenuItem key="documentacao">
                  <MenuItemComponent item={{
                    title: 'Documentação',
                    icon: FileText,
                    route: '/documentacao',
                    module: 'documentacao'
                  }} />
                </SidebarMenuItem>
              )}

              {canViewModule('configuracoes') && (
                <SidebarMenuItem key="configuracoes">
                  <MenuItemComponent item={{
                    title: 'Configurações',
                    icon: Settings,
                    route: '/configuracoes',
                    module: 'configuracoes'
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
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
};

export default DesktopSidebar;