
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
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
  LogOut,
  Settings,
  Church,
  Calculator,
  Camera
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Sidebar = () => {
  const { signOut, userRole, user } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const location = useLocation();
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const [profileData, setProfileData] = React.useState<{ name: string; photo_url: string | null } | null>(null);

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
        .select('name, photo_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfileData(data);
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
      'worker': 'Obreiro'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['superadmin', 'admin', 'finance', 'pastor', 'worker']
    },
    {
      title: 'Financeiro',
      icon: DollarSign,
      href: '/financeiro',
      roles: ['superadmin', 'admin', 'finance']
    },
    {
      title: 'Membros',
      icon: Users,
      href: '/membros',
      roles: ['superadmin', 'admin', 'pastor', 'worker']
    },
    {
      title: 'Eventos',
      icon: Calendar,
      href: '/eventos',
      roles: ['superadmin', 'admin', 'pastor']
    },
    {
      title: 'Ministérios',
      icon: Heart,
      href: '/ministerios',
      roles: ['superadmin', 'admin', 'pastor']
    },
    {
      title: 'Departamentos',
      icon: Building2,
      href: '/departamentos',
      roles: ['superadmin', 'admin', 'pastor']
    },
    {
      title: 'Congregações',
      icon: Church,
      href: '/congregacoes',
      roles: ['superadmin', 'admin', 'pastor'],
      requiresCongregationAccess: true
    },
    {
      title: 'Conciliações',
      icon: Calculator,
      href: '/conciliacoes',
      roles: ['superadmin', 'admin', 'finance', 'pastor'],
      requiresCongregationAccess: true
    },
    {
      title: 'Fornecedores',
      icon: Truck,
      href: '/fornecedores',
      roles: ['superadmin', 'admin', 'finance']
    }
  ];

  const visibleItems = menuItems.filter(item => {
    // Verificar se o usuário tem o role necessário
    if (!userRole || !item.roles.includes(userRole)) {
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
        <h1 className="text-lg font-bold text-gray-900 mb-3">Sistema IPTM</h1>
        
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
                {getRoleDisplayName(userRole || '')}
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
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={() => {}}
        >
          <Settings className="mr-3 h-4 w-4" />
          Configurações
        </Button>
        
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
