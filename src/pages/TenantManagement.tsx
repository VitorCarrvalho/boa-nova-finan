import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Building2, ShieldAlert } from 'lucide-react';
import { useTenantAdmin } from '@/hooks/useTenantAdmin';
import TenantTable from '@/components/tenants/TenantTable';
import TenantFormDialog from '@/components/tenants/TenantFormDialog';
import TenantBrandingDialog from '@/components/tenants/TenantBrandingDialog';
import TenantHomeConfigDialog from '@/components/tenants/TenantHomeConfigDialog';
import TenantModulesDialog from '@/components/tenants/TenantModulesDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tenant, TenantBranding, TenantHomeConfig, TenantModulesConfig } from '@/contexts/TenantContext';

interface TenantWithSettings extends Tenant {
  branding?: TenantBranding;
  homeConfig?: TenantHomeConfig;
  modulesConfig?: TenantModulesConfig;
  adminsCount?: number;
  usersCount?: number;
}

const TenantManagement = () => {
  const {
    tenants,
    loading,
    isSuperAdmin,
    createTenant,
    updateTenant,
    updateTenantBranding,
    updateTenantHomeConfig,
    updateTenantModules,
    deleteTenant,
  } = useTenantAdmin();

  const [formOpen, setFormOpen] = useState(false);
  const [brandingOpen, setBrandingOpen] = useState(false);
  const [homeConfigOpen, setHomeConfigOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithSettings | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleCreate = () => {
    setSelectedTenant(null);
    setFormOpen(true);
  };

  const handleEdit = (tenant: TenantWithSettings) => {
    setSelectedTenant(tenant);
    setFormOpen(true);
  };

  const handleEditBranding = (tenant: TenantWithSettings) => {
    setSelectedTenant(tenant);
    setBrandingOpen(true);
  };

  const handleEditHome = (tenant: TenantWithSettings) => {
    setSelectedTenant(tenant);
    setHomeConfigOpen(true);
  };

  const handleEditModules = (tenant: TenantWithSettings) => {
    setSelectedTenant(tenant);
    setModulesOpen(true);
  };

  const handleManageUsers = (tenant: TenantWithSettings) => {
    // TODO: Navigate to tenant users management
    console.log('Manage users for tenant:', tenant.id);
  };

  const handleDeleteClick = (tenant: TenantWithSettings) => {
    setSelectedTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      if (selectedTenant) {
        await updateTenant(selectedTenant.id, {
          name: values.name,
          slug: values.slug,
          subdomain: values.subdomain,
          planType: values.planType,
          subscriptionStatus: values.subscriptionStatus,
          isActive: values.isActive,
        });
      } else {
        await createTenant({
          name: values.name,
          slug: values.slug,
          subdomain: values.subdomain,
          planType: values.planType,
        });
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleBrandingSubmit = async (values: any) => {
    if (!selectedTenant) return;
    setFormLoading(true);
    try {
      await updateTenantBranding(selectedTenant.id, values);
    } finally {
      setFormLoading(false);
    }
  };

  const handleHomeConfigSubmit = async (values: TenantHomeConfig) => {
    if (!selectedTenant) return;
    setFormLoading(true);
    try {
      await updateTenantHomeConfig(selectedTenant.id, values);
    } finally {
      setFormLoading(false);
    }
  };

  const handleModulesSubmit = async (values: TenantModulesConfig) => {
    if (!selectedTenant) return;
    setFormLoading(true);
    try {
      await updateTenantModules(selectedTenant.id, values);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTenant) return;
    await deleteTenant(selectedTenant.id);
    setDeleteDialogOpen(false);
    setSelectedTenant(null);
  };

  if (!isSuperAdmin && !loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground">
            Apenas super administradores podem acessar esta página.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              Gestão de Tenants
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie as organizações (igrejas) que utilizam a plataforma
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tenant
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenants Cadastrados</CardTitle>
            <CardDescription>
              {tenants.length} tenant(s) na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <TenantTable
                tenants={tenants}
                onEdit={handleEdit}
                onEditBranding={handleEditBranding}
                onEditHome={handleEditHome}
                onEditModules={handleEditModules}
                onManageUsers={handleManageUsers}
                onDelete={handleDeleteClick}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <TenantFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tenant={selectedTenant}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      />

      <TenantBrandingDialog
        open={brandingOpen}
        onOpenChange={setBrandingOpen}
        tenantId={selectedTenant?.id || ''}
        tenantName={selectedTenant?.name || ''}
        branding={selectedTenant?.branding}
        onSubmit={handleBrandingSubmit}
        loading={formLoading}
      />

      <TenantHomeConfigDialog
        open={homeConfigOpen}
        onOpenChange={setHomeConfigOpen}
        tenantName={selectedTenant?.name || ''}
        homeConfig={selectedTenant?.homeConfig}
        onSubmit={handleHomeConfigSubmit}
        loading={formLoading}
      />

      <TenantModulesDialog
        open={modulesOpen}
        onOpenChange={setModulesOpen}
        tenantName={selectedTenant?.name || ''}
        tenantPlan={selectedTenant?.planType || 'free'}
        modulesConfig={selectedTenant?.modulesConfig}
        onSubmit={handleModulesSubmit}
        loading={formLoading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{selectedTenant?.name}</strong>?
              Esta ação não pode ser desfeita e todos os dados do tenant serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TenantManagement;
