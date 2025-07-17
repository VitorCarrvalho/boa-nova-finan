import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileAccessTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

const MobileAccessTabs: React.FC<MobileAccessTabsProps> = ({ value, onValueChange }) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pending">Contas a Aprovar</TabsTrigger>
        <TabsTrigger value="profiles">Configuração de Perfis</TabsTrigger>
        <TabsTrigger value="users">Usuários</TabsTrigger>
      </TabsList>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <TabsList className="inline-flex h-12 min-w-max space-x-1 p-1">
        <TabsTrigger value="pending" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
          <Users className="h-4 w-4" />
          <span className="text-xs">Aprovar</span>
        </TabsTrigger>
        <TabsTrigger value="profiles" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
          <Shield className="h-4 w-4" />
          <span className="text-xs">Perfis</span>
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
          <Settings className="h-4 w-4" />
          <span className="text-xs">Usuários</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default MobileAccessTabs;