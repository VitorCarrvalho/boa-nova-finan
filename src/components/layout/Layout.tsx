import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSidebar from './MobileSidebar';
import DesktopSidebar from './DesktopSidebar';
import HeaderProfile from './HeaderProfile';
import SuperAdminLayout from './SuperAdminLayout';
import logoIM from '@/assets/logoIM.png';
import useSuperAdmin from '@/hooks/useSuperAdmin';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { branding } = useTenant();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const isMobile = useIsMobile();
  const location = useLocation();

  const loading = authLoading || superAdminLoading;

  // Dynamic branding
  const displayLogo = branding.logoUrl || logoIM;
  const displayName = branding.churchName || 'Igreja Moove';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se for Super Admin e estiver nas rotas /admin/*, usar SuperAdminLayout
  // Se for Super Admin mas estiver em outra rota (ex: /dashboard via "Ver como Tenant"), usar layout normal
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isSuperAdmin && isAdminRoute) {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }

  if (isMobile) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full bg-background">
          <MobileSidebar />
          
          <div className="flex-1 flex flex-col">
            <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={displayLogo} 
                    alt={displayName} 
                    className="w-10 h-10 object-contain"
                  />
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
                </div>
                <HeaderProfile />
              </div>
            </header>
            
            <main className="flex-1 p-4 md:p-6 bg-background">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <DesktopSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={displayLogo} 
                  alt={displayName} 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
              </div>
              <HeaderProfile />
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-6 ml-0 bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
