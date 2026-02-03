import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Database, Palette, Home, LayoutGrid } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import TenantBrandingTab from '@/components/settings/TenantBrandingTab';
import TenantHomeTab from '@/components/settings/TenantHomeTab';
import TenantModulesTab from '@/components/settings/TenantModulesTab';

const Settings = () => {
  const { tenant, isMultiTenant, loading: tenantLoading } = useTenant();
  
  // Show loading while tenant data is being resolved
  if (tenantLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Determine if tenant tabs should be shown
  const showTenantTabs = isMultiTenant || tenant !== null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as configurações do sistema
          </p>
        </div>

        <Tabs defaultValue={showTenantTabs ? "branding" : "geral"} className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-2">
            {showTenantTabs && (
              <>
                <TabsTrigger value="branding" className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Branding
                </TabsTrigger>
                <TabsTrigger value="home" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </TabsTrigger>
                <TabsTrigger value="modules" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Módulos
                </TabsTrigger>
              </>
            )}
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          {showTenantTabs && (
            <TabsContent value="branding">
              <TenantBrandingTab />
            </TabsContent>
          )}

          {/* Home Tab */}
          {showTenantTabs && (
            <TabsContent value="home">
              <TenantHomeTab />
            </TabsContent>
          )}

          {/* Modules Tab */}
          {showTenantTabs && (
            <TabsContent value="modules">
              <TenantModulesTab />
            </TabsContent>
          )}

          {/* Geral Tab */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Sistema
                </CardTitle>
                <CardDescription>
                  Configurações gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configurações do sistema serão implementadas em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segurança Tab */}
          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Configurações de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configurações de segurança serão implementadas em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
