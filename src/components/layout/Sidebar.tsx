
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { Button } from '@/components/ui/button';
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
  Calculator
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { signOut, userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const location = useLocation();

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

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
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
