import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { usePermissions } from '@/hooks/usePermissions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Calendar, 
  Building2, 
  Heart,
  Truck,
  CreditCard,
  LogOut,
  Settings,
  Church,
  Calculator,
  Camera,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Bell,
  MessageSquare,
  Clock,
   Send,
   Video,
   Shield,
   Book
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const MobileSidebar = () => {
  const { signOut, userRole, user } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const { canViewModule, canViewNewAccount, canViewPendingApproval, canViewAuthorizeAccounts, canViewApprovedAccounts, canViewPaidAccounts } = usePermissions();
  const location = useLocation();
  const { toast } = useToast();
  const { state } = useSidebar();
  const [uploading, setUploading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<{ name: string; photo_url: string | null; access_profile_name: string | null } | null>(null);
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [accountsPayableOpen, setAccountsPayableOpen] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, photo_url, access_profiles(name)')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      const profileData = {
        name: data.name,
        photo_url: data.photo_url,
        access_profile_name: data.access_profiles?.name || null
      };
      
      setProfileData(profileData);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const uploadProfilePicture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para enviar.');
      }

      const file = event.target.files[0];
      
      if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
        throw new Error('Apenas arquivos JPG e PNG são permitidos.');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter menos de 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      setProfileData(prev => prev ? { ...prev, photo_url: publicUrl } : null);

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      module: 'dashboard'
    },
    {
      title: 'Financeiro',
      icon: DollarSign,
      href: '/financeiro',
      module: 'financeiro'
    },
    {
      title: 'Membros',
      icon: Users,
      href: '/membros',
      module: 'membros'
    },
    {
      title: 'Eventos',
      icon: Calendar,
      href: '/eventos',
      module: 'eventos'
    },
    {
      title: 'Conciliações',
      icon: Calculator,
      href: '/conciliacoes',
      module: 'conciliacoes'
    },
    {
      title: 'Congregações',
      icon: Church,
      href: '/congregacoes',
      module: 'congregacoes',
      requiresCongregationAccess: true
    },
    {
      title: 'Ministérios',
      icon: Heart,
      href: '/ministerios',
      module: 'ministerios'
    },
    {
      title: 'Departamentos',
      icon: Building2,
      href: '/departamentos',
      module: 'departamentos'
    },
    {
      title: 'Fornecedores',
      icon: Truck,
      href: '/fornecedores',
      module: 'fornecedores'
    }
  ];

  const reportSubmenus = [
    { title: 'Eventos', href: '/relatorios/eventos' },
    { title: 'Financeiro', href: '/relatorios/financeiro' },
    { title: 'Fornecedores', href: '/relatorios/fornecedores' },
    { title: 'Membros', href: '/relatorios/membros' },
    { title: 'Conciliações', href: '/relatorios/conciliacoes' }
  ];

  const notificationSubmenus = [
    { title: 'Biblioteca de Vídeos', href: '/notificacoes/videos', icon: Video },
    { title: 'Histórico Enviado', href: '/notificacoes/historico', icon: Send },
    { title: 'Mensagens Agendadas', href: '/notificacoes/agendadas', icon: Clock },
    { title: 'Nova Notificação', href: '/notificacoes/nova', icon: MessageSquare }
  ];

  const accountsPayableSubmenus = [
    { 
      title: 'Incluir Nova Conta', 
      href: '/contas-pagar/nova',
      checkPermission: () => canViewNewAccount()
    },
    { 
      title: 'Pendentes de Aprovação', 
      href: '/contas-pagar/pendente-aprovacao',
      checkPermission: () => canViewPendingApproval()
    },
    { 
      title: 'Autorizar Contas', 
      href: '/contas-pagar/autorizar',
      checkPermission: () => canViewAuthorizeAccounts()
    },
    { 
      title: 'Contas Aprovadas', 
      href: '/contas-pagar/aprovadas',
      checkPermission: () => canViewApprovedAccounts()
    },
    { 
      title: 'Contas Pagas', 
      href: '/contas-pagar/pagas',
      checkPermission: () => canViewPaidAccounts()
    }
  ];

  const visibleItems = menuItems.filter(item => {
    if (!canViewModule(item.module)) {
      return false;
    }

    if (item.requiresCongregationAccess) {
      if (userRole === 'finance' || userRole === 'worker') {
        return false;
      }
      
      if (userRole === 'admin' || userRole === 'superadmin') {
        return true;
      }
      
      if (userRole === 'pastor') {
        return congregationAccess?.hasAccess || false;
      }
    }

    return true;
  });

  const canAccessReports = canViewModule('relatorios');
  const canAccessNotifications = canViewModule('notificacoes');
  const canAccessAccountsPayable = canViewModule('contas-pagar');
  const canAccessSettings = canViewModule('configuracoes') || userRole === 'admin' || userRole === 'superadmin';
  const canAccessAccessManagement = canViewModule('gestao-acessos') || userRole === 'admin' || userRole === 'superadmin';

  if (!user || !profileData) {
    return (
      <Sidebar className="border-r">
        <SidebarContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* User Profile Section */}
        {state === 'expanded' && (
          <SidebarGroup>
            <div className="p-4 border-b">
              <h1 className="text-lg font-bold mb-3">Gestor iptm</h1>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage 
                      src={profileData.photo_url || undefined} 
                      alt={profileData.name}
                    />
                    <AvatarFallback className="bg-red-100 text-red-600 text-sm">
                      {getInitials(profileData.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-3 w-3 text-white" />
                  </div>
                  
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={uploadProfilePicture}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Enviar nova foto"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {profileData.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {profileData.access_profile_name || 'Membro'}
                    </span>
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarGroup>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Contas a Pagar with Submenu */}
              {canAccessAccountsPayable && (
                <Collapsible open={accountsPayableOpen} onOpenChange={setAccountsPayableOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith('/contas-pagar')}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Contas a Pagar</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {accountsPayableSubmenus
                          .filter(submenu => submenu.checkPermission())
                          .map((submenu) => {
                            const isActive = location.pathname === submenu.href;
                            return (
                              <SidebarMenuSubItem key={submenu.href}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link to={submenu.href}>
                                    {submenu.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Reports with Submenu */}
              {canAccessReports && (
                <Collapsible open={reportsOpen} onOpenChange={setReportsOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith('/relatorios')}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Relatórios</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {reportSubmenus.map((submenu) => {
                          const isActive = location.pathname === submenu.href;
                          return (
                            <SidebarMenuSubItem key={submenu.href}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link to={submenu.href}>
                                  {submenu.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}

              {/* Notifications with Submenu */}
              {canAccessNotifications && (
                <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith('/notificacoes')}
                      >
                        <Bell className="h-4 w-4" />
                        <span>Notificações</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {notificationSubmenus.map((submenu) => {
                          const isActive = location.pathname === submenu.href;
                          const Icon = submenu.icon;
                          return (
                            <SidebarMenuSubItem key={submenu.href}>
                              <SidebarMenuSubButton asChild isActive={isActive}>
                                <Link to={submenu.href}>
                                  <Icon className="h-3 w-3" />
                                  {submenu.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings and Admin */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {canAccessAccessManagement && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/gestao-acessos')}>
                    <Link to="/gestao-acessos">
                      <Shield className="h-4 w-4" />
                      <span>Gestão de Acessos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              
              {canAccessSettings && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/configuracoes')}>
                    <Link to="/configuracoes">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
               )}
               
               <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith('/documentacao')}>
                    <Link to="/documentacao">
                     <Book className="h-4 w-4" />
                     <span>Documentação</span>
                   </Link>
                 </SidebarMenuButton>
               </SidebarMenuItem>
               
               <SidebarMenuItem>
                 <SidebarMenuButton onClick={signOut} className="text-destructive hover:text-destructive">
                   <LogOut className="h-4 w-4" />
                   <span>Sair</span>
                 </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default MobileSidebar;