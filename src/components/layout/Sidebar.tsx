import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  Shield
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Sidebar = () => {
  const { signOut, userRole, user } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const { canViewModule } = usePermissions();
  const location = useLocation();
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<{ name: string; photo_url: string | null; access_profile_name: string | null } | null>(null);
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [financialOpen, setFinancialOpen] = React.useState(false);

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
      
      // Validate file type
      if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
        throw new Error('Apenas arquivos JPG e PNG são permitidos.');
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter menos de 2MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/profile.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', user!.id);

      if (updateError) throw updateError;

      // Update local state
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

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      'superadmin': 'Super Administrador',
      'admin': 'Administrador',
      'finance': 'Financeiro',
      'pastor': 'Pastor',
      'worker': 'Obreiro',
      'assistente': 'Assistente',
      'analista': 'Analista',
      'coordenador': 'Coordenador',
      'gerente': 'Gerente',
      'diretor': 'Diretor',
      'presidente': 'Presidente'
    };
    return roleNames[role as keyof typeof roleNames] || role;
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
      title: 'Contas a Pagar',
      icon: CreditCard,
      href: '/accounts-payable',
      module: 'contas-pagar',
      hasSubmenu: true
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

  // Report submenus in alphabetical order
  const reportSubmenus = [
    { title: 'Eventos', href: '/relatorios/eventos' },
    { title: 'Financeiro', href: '/relatorios/financeiro' },
    { title: 'Fornecedores', href: '/relatorios/fornecedores' },
    { title: 'Membros', href: '/relatorios/membros' },
    { title: 'Conciliações', href: '/relatorios/conciliacoes' }
  ];

  // Notification submenus in alphabetical order
  const notificationSubmenus = [
    { title: 'Biblioteca de Vídeos', href: '/notificacoes/videos', icon: Video },
    { title: 'Histórico Enviado', href: '/notificacoes/historico', icon: Send },
    { title: 'Mensagens Agendadas', href: '/notificacoes/agendadas', icon: Clock },
    { title: 'Nova Notificação', href: '/notificacoes/nova', icon: MessageSquare }
  ];

  // Financial submenus for accounts payable - REMOVIDO ANALISTA da aba "Autorizar Contas"
  const accountsPayableSubmenus = [
    { 
      title: 'Incluir Nova Conta', 
      href: '/accounts-payable/new',
      roles: ['assistente', 'analista', 'gerente', 'pastor']
    },
    { 
      title: 'Pendentes de Aprovação', 
      href: '/accounts-payable/pending-approval',
      roles: ['superadmin', 'admin', 'finance', 'assistente', 'analista', 'gerente', 'pastor', 'diretor', 'presidente']
    },
    { 
      title: 'Autorizar Contas', 
      href: '/accounts-payable/authorize',
      roles: ['gerente', 'diretor', 'presidente', 'admin', 'superadmin'] // REMOVIDO 'analista'
    },
    { 
      title: 'Contas Aprovadas', 
      href: '/accounts-payable/approved',
      roles: ['superadmin', 'admin', 'finance', 'assistente', 'analista', 'gerente', 'pastor']
    },
    { 
      title: 'Contas Pagas', 
      href: '/accounts-payable/paid',
      roles: ['superadmin', 'admin', 'finance', 'assistente', 'analista', 'gerente', 'pastor', 'diretor', 'presidente']
    }
  ];

  const visibleItems = menuItems.filter(item => {
    // Verificar se o usuário tem permissão para visualizar o módulo
    if (!canViewModule(item.module)) {
      return false;
    }

    // Para itens que requerem acesso a congregações
    if (item.requiresCongregationAccess) {
      // Finance e worker nunca veem esses itens
      if (userRole === 'finance' || userRole === 'worker') {
        return false;
      }
      
      // Admin e superadmin sempre veem
      if (userRole === 'admin' || userRole === 'superadmin') {
        return true;
      }
      
      // Para pastores, verificar se têm acesso a congregações
      if (userRole === 'pastor') {
        return congregationAccess?.hasAccess || false;
      }
    }

    return true;
  });

  // Check if user can access reports
  const canAccessReports = canViewModule('relatorios');

  // Check if user can access notifications (only admins)
  const canAccessNotifications = canViewModule('notificacoes');

  // Check if user can access financial submenus
  const canAccessFinancial = canViewModule('financeiro');
  
  // Check if user can access accounts payable
  const canAccessAccountsPayable = canViewModule('contas-pagar');
  
  // State for accounts payable submenu
  const [accountsPayableOpen, setAccountsPayableOpen] = React.useState(false);

  // Check if user can access settings (only admins)
  const canAccessSettings = canViewModule('configuracoes') || userRole === 'admin' || userRole === 'superadmin';
  
  // Check if user can access access management (only admins)
  const canAccessAccessManagement = canViewModule('gestao-acessos') || userRole === 'admin' || userRole === 'superadmin';

  if (!user || !profileData) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900 mb-3">Gestor iptm</h1>
        
        <div className="flex items-center gap-3">
          {/* Profile Picture with Upload */}
          <div className="relative group">
            <Avatar className="h-12 w-12 cursor-pointer">
              <AvatarImage 
                src={profileData.photo_url || undefined} 
                alt={profileData.name}
              />
              <AvatarFallback className="bg-red-100 text-red-600">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
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
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {profileData.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 capitalize">
                {profileData.access_profile_name || 'Membro'}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          // Special handling for Financial menu (only receitas e despesas now)
          if (item.title === 'Financeiro' && canAccessFinancial) {
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          }
          
          // Special handling for Accounts Payable menu with submenu
          if (item.title === 'Contas a Pagar' && canAccessAccountsPayable) {
            return (
              <Collapsible key={item.title} open={accountsPayableOpen} onOpenChange={setAccountsPayableOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-gray-700 hover:bg-gray-100 ${
                      location.pathname.startsWith('/accounts-payable') ? 'bg-red-50 text-red-600' : ''
                    }`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.title}
                    {accountsPayableOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-4 space-y-1">
                  {accountsPayableSubmenus
                    .filter(submenu => !userRole || submenu.roles.includes(userRole))
                    .map((submenu) => {
                      const isActive = location.pathname === submenu.href;
                      return (
                        <Link key={submenu.href} to={submenu.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full justify-start text-sm ${
                              isActive 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {submenu.title}
                          </Button>
                        </Link>
                      );
                    })}
                </CollapsibleContent>
              </Collapsible>
            );
          }
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}

        {/* Reports Collapsible Menu */}
        {canAccessReports && (
          <Collapsible open={reportsOpen} onOpenChange={setReportsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-700 hover:bg-gray-100 ${
                  location.pathname.startsWith('/relatorios') ? 'bg-red-50 text-red-600' : ''
                }`}
              >
                <BarChart3 className="mr-3 h-4 w-4" />
                Relatórios
                {reportsOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              {reportSubmenus.map((submenu) => {
                const isActive = location.pathname === submenu.href;
                return (
                  <Link key={submenu.href} to={submenu.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-sm ${
                        isActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {submenu.title}
                    </Button>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Notifications Collapsible Menu */}
        {canAccessNotifications && (
          <Collapsible open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-700 hover:bg-gray-100 ${
                  location.pathname.startsWith('/notificacoes') ? 'bg-red-50 text-red-600' : ''
                }`}
              >
                <Bell className="mr-3 h-4 w-4" />
                Notificações
                {notificationsOpen ? (
                  <ChevronDown className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              {notificationSubmenus.map((submenu) => {
                const isActive = location.pathname === submenu.href;
                const Icon = submenu.icon;
                return (
                  <Link key={submenu.href} to={submenu.href}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-sm ${
                        isActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="mr-2 h-3 w-3" />
                      {submenu.title}
                    </Button>
                  </Link>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {canAccessAccessManagement && (
          <Link to="/access-management">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                location.pathname.startsWith('/access-management') 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield className="mr-3 h-4 w-4" />
              Gestão de Acessos
            </Button>
          </Link>
        )}
        
        {canAccessSettings && (
          <Link to="/settings">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                location.pathname.startsWith('/settings') 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="mr-3 h-4 w-4" />
              Configurações
            </Button>
          </Link>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
