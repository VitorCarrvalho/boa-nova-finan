import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import SuperAdminSidebar from './SuperAdminSidebar';
import { Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const { user, signOut, loading } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.email?.substring(0, 2).toUpperCase() || 'SA';

  const handleLogout = async () => {
    await signOut();
  };

  const handleSwitchToTenantView = () => {
    navigate('/dashboard');
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-slate-950">
        <SuperAdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <SidebarTrigger className="text-slate-400 hover:text-white">
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">Super Admin</h1>
                    <p className="text-xs text-slate-400 hidden sm:block">Gestão da Plataforma</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSwitchToTenantView}
                  className="hidden sm:flex border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Ver como Tenant
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9 border-2 border-amber-500/50">
                        <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700" align="end">
                    <DropdownMenuLabel className="text-slate-300">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-white">Super Administrador</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem 
                      onClick={handleSwitchToTenantView}
                      className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer sm:hidden"
                    >
                      Ver como Tenant
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                    >
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 bg-slate-950 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SuperAdminLayout;
