
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users } from 'lucide-react';
import ProfileList from '@/components/settings/ProfileList';
import PermissionMatrix from '@/components/settings/PermissionMatrix';
import { AccessProfile } from '@/hooks/useAccessProfiles';

const Settings = () => {
  const [selectedProfile, setSelectedProfile] = React.useState<AccessProfile | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie as configurações do sistema
          </p>
        </div>

        <Tabs defaultValue="access-management">
          <TabsList>
            <TabsTrigger value="access-management" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Gestão de Acesso
            </TabsTrigger>
            <TabsTrigger value="profile-assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Atribuição de Perfis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access-management">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Acesso</CardTitle>
                <CardDescription>
                  Crie e gerencie perfis de acesso com permissões granulares para todos os módulos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex min-h-[600px]">
                  <ProfileList
                    selectedProfile={selectedProfile}
                    onSelectProfile={setSelectedProfile}
                  />
                  <PermissionMatrix selectedProfile={selectedProfile} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile-assignment">
            <Card>
              <CardHeader>
                <CardTitle>Atribuição de Perfis</CardTitle>
                <CardDescription>
                  Atribua perfis de acesso aos usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  <p>Funcionalidade de atribuição de perfis será implementada em breve</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
