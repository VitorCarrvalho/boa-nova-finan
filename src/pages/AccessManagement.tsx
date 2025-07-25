import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PendingApprovals from '@/components/access-management/PendingApprovals';
import ProfileConfiguration from '@/components/access-management/ProfileConfiguration';
import UserManagement from '@/components/settings/UserManagement';
import MobileAccessTabs from '@/components/access-management/MobileAccessTabs';
import MobilePendingApprovals from '@/components/access-management/MobilePendingApprovals';
import MobileProfileConfiguration from '@/components/access-management/MobileProfileConfiguration';
import MobileUserManagement from '@/components/access-management/MobileUserManagement';
import PermissionsDiagnostic from '@/components/access-management/PermissionsDiagnostic';
import { useIsMobile } from '@/hooks/use-mobile';

const AccessManagement = () => {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Acessos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie usuários, perfis e permissões do sistema
          </p>
        </div>

        <PermissionsDiagnostic />

        <Tabs defaultValue="pending" className="w-full">
          {isMobile ? (
            <MobileAccessTabs value="pending" onValueChange={() => {}} />
          ) : (
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Contas a Aprovar</TabsTrigger>
              <TabsTrigger value="profiles">Configuração de Perfis</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
            </TabsList>
          )}
          
          <TabsContent value="pending">
            {isMobile ? <MobilePendingApprovals /> : <PendingApprovals />}
          </TabsContent>
          
          <TabsContent value="profiles">
            {isMobile ? <MobileProfileConfiguration /> : <ProfileConfiguration />}
          </TabsContent>
          
          <TabsContent value="users">
            {isMobile ? <MobileUserManagement /> : <UserManagement />}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AccessManagement;