
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Calendar, 
  Building2, 
  Truck, 
  LogOut,
  FileText
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      roles: ['superadmin', 'admin', 'finance', 'pastor', 'worker']
    },
    {
      icon: DollarSign,
      label: 'Financeiro',
      path: '/financeiro',
      roles: ['superadmin', 'admin', 'finance']
    },
    {
      icon: Users,
      label: 'Membros',
      path: '/membros',
      roles: ['superadmin', 'admin', 'pastor', 'worker']
    },
    {
      icon: Building2,
      label: 'Ministérios',
      path: '/ministerios',
      roles: ['superadmin', 'admin', 'pastor']
    },
    {
      icon: Building2,
      label: 'Departamentos',
      path: '/departamentos',
      roles: ['superadmin', 'admin', 'pastor']
    },
    {
      icon: Calendar,
      label: 'Eventos',
      path: '/eventos',
      roles: ['superadmin', 'admin', 'pastor']
    },
    {
      icon: Truck,
      label: 'Fornecedores',
      path: '/fornecedores',
      roles: ['superadmin', 'admin', 'finance']
    },
    {
      icon: FileText,
      label: 'Auditoria',
      path: '/auditoria',
      roles: ['superadmin', 'admin']
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredMenuItems = menuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Sistema IPTM</h1>
        <p className="text-sm text-gray-500 mt-1">
          {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:bg-gray-100"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
