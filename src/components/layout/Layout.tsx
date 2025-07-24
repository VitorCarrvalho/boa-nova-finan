
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileSidebar from './MobileSidebar';
import DesktopSidebar from './DesktopSidebar';
import fiveIcon from '@/assets/fiveicon.svg';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Será redirecionado para auth
  }

  if (isMobile) {
    return (
      <SidebarProvider defaultOpen={false}>
        <div className="flex min-h-screen w-full bg-gray-50">
          <MobileSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Header with mobile menu trigger and logo */}
            <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
              <div className="flex items-center gap-3">
                <img 
                  src={fiveIcon} 
                  alt="IPTM Logo" 
                  className="w-10 h-10"
                />
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
              </div>
            </header>
            
            {/* Main content */}
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <DesktopSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header with logo */}
          <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <img 
                src={fiveIcon} 
                alt="IPTM Logo" 
                className="w-10 h-10"
              />
              <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
            </div>
          </header>
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-6 ml-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
