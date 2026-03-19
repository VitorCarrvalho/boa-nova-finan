import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Building2, UserPlus, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Tenant } from '@/contexts/TenantContext';

const tenantSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  subdomain: z.string().min(3, 'Subdomínio deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  planType: z.enum(['free', 'basic', 'pro', 'enterprise']),
  subscriptionStatus: z.enum(['trial', 'active', 'pending', 'suspended', 'cancelled']),
  isActive: z.boolean(),
  // Admin fields (only for creation)
  adminName: z.string().optional(),
  adminEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  adminPassword: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

export interface TenantFormSubmitValues extends TenantFormValues {
  admin?: {
    name: string;
    email: string;
    password: string;
  };
}

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  onSubmit: (values: TenantFormSubmitValues) => Promise<void>;
  loading?: boolean;
}

export function TenantFormDialog({
  open,
  onOpenChange,
  tenant,
  onSubmit,
  loading,
}: TenantFormDialogProps) {
  const isEditing = !!tenant;
  const [step, setStep] = useState(1);
  const totalSteps = isEditing ? 1 : 2;

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant?.name || '',
      slug: tenant?.slug || '',
      subdomain: tenant?.subdomain || '',
      planType: tenant?.planType || 'free',
      subscriptionStatus: tenant?.subscriptionStatus || 'trial',
      isActive: tenant?.isActive ?? true,
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    },
  });

  React.useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        planType: tenant.planType,
        subscriptionStatus: tenant.subscriptionStatus,
        isActive: tenant.isActive,
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        subdomain: '',
        planType: 'free',
        subscriptionStatus: 'trial',
        isActive: true,
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
    }
    setStep(1);
  }, [tenant, form, open]);

  const handleNameChange = (value: string) => {
    form.setValue('name', value);
    if (!isEditing) {
      const slug = value.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setValue('slug', slug);
      form.setValue('subdomain', slug);
    }
  };

  const handleNext = async () => {
    // Validate step 1 fields
    const valid = await form.trigger(['name', 'slug', 'subdomain', 'planType', 'subscriptionStatus']);
    if (valid) {
      setStep(2);
    }
  };

  const handleSubmit = async (values: TenantFormValues) => {
    const submitValues: TenantFormSubmitValues = { ...values };
    
    if (!isEditing && values.adminName && values.adminEmail && values.adminPassword) {
      submitValues.admin = {
        name: values.adminName,
        email: values.adminEmail,
        password: values.adminPassword,
      };
    }
    
    await onSubmit(submitValues);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <Building2 className="h-5 w-5" />
                {isEditing ? 'Editar Organização' : 'Nova Organização'}
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Administrador Inicial
              </>
            )}
          </DialogTitle>
          {!isEditing && (
            <div className="flex items-center gap-2 pt-2">
              <Badge variant={step === 1 ? 'default' : 'secondary'} className="text-xs">
                1. Organização
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant={step === 2 ? 'default' : 'secondary'} className="text-xs">
                2. Administrador
              </Badge>
            </div>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Step 1: Organization details */}
            {step === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Igreja</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="Ex: Igreja Batista Central"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="igreja-batista-central" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subdomain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdomínio</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <Input {...field} placeholder="ibc" className="rounded-r-none" />
                            <span className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground whitespace-nowrap">
                              .igrejamoove
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subscriptionStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="trial">Trial</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="suspended">Suspenso</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditing && (
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                         <FormLabel className="text-base">Organização Ativa</FormLabel>
                           <p className="text-sm text-muted-foreground">
                             Desativar impede o acesso à organização
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* Step 2: Admin user */}
            {step === 2 && (
              <>
                <div className="rounded-lg border border-dashed p-4 bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">
                    Criando organização: <strong className="text-foreground">{form.getValues('name')}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Subdomínio: <code className="bg-muted px-1 rounded">{form.getValues('subdomain')}.igrejamoove.com.br</code>
                  </p>
                </div>

                <div className="rounded-lg border p-4 bg-primary/5">
                  <p className="text-sm font-medium mb-1">O que será criado automaticamente:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✓ Perfis de acesso padrão (Admin, Pastor, Gerente Financeiro, Membro)</li>
                    <li>✓ Configuração de módulos padrão</li>
                    <li>✓ Configuração de branding e home</li>
                    <li>✓ Usuário administrador abaixo</li>
                  </ul>
                </div>

                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Administrador</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: João Silva" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Administrador</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="Ex: admin@igreja.com" required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha Temporária</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Mínimo 6 caracteres" minLength={6} required />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        O administrador poderá alterar a senha após o primeiro login.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter className="gap-2">
              {step === 2 && (
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading}>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Voltar
                </Button>
              )}
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              {step === 1 && !isEditing ? (
                <Button type="button" onClick={handleNext}>
                  Próximo
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : isEditing ? 'Salvar' : (
                    <>
                      <Check className="mr-1 h-4 w-4" />
                      Criar Organização
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default TenantFormDialog;