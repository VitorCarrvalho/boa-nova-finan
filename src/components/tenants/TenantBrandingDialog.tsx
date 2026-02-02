import React from 'react';
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TenantBranding } from '@/contexts/TenantContext';

const brandingSchema = z.object({
  churchName: z.string().min(1, 'Nome é obrigatório'),
  tagline: z.string().optional(),
  primaryColor: z.string().min(1, 'Cor primária é obrigatória'),
  secondaryColor: z.string().min(1, 'Cor secundária é obrigatória'),
  accentColor: z.string().min(1, 'Cor de destaque é obrigatória'),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  faviconUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  fontFamily: z.string().min(1, 'Fonte é obrigatória'),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

interface TenantBrandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  branding?: TenantBranding;
  onSubmit: (values: BrandingFormValues) => Promise<void>;
  loading?: boolean;
}

const defaultBranding: BrandingFormValues = {
  churchName: '',
  tagline: '',
  primaryColor: '222.2 47.4% 11.2%',
  secondaryColor: '210 40% 96.1%',
  accentColor: '210 40% 96.1%',
  logoUrl: '',
  faviconUrl: '',
  fontFamily: 'Inter, sans-serif',
};

export function TenantBrandingDialog({
  open,
  onOpenChange,
  tenantName,
  branding,
  onSubmit,
  loading,
}: TenantBrandingDialogProps) {
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: branding ? {
      churchName: branding.churchName || tenantName,
      tagline: branding.tagline || '',
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      logoUrl: branding.logoUrl || '',
      faviconUrl: branding.faviconUrl || '',
      fontFamily: branding.fontFamily,
    } : { ...defaultBranding, churchName: tenantName },
  });

  React.useEffect(() => {
    if (branding) {
      form.reset({
        churchName: branding.churchName || tenantName,
        tagline: branding.tagline || '',
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: branding.accentColor,
        logoUrl: branding.logoUrl || '',
        faviconUrl: branding.faviconUrl || '',
        fontFamily: branding.fontFamily,
      });
    } else {
      form.reset({ ...defaultBranding, churchName: tenantName });
    }
  }, [branding, tenantName, form]);

  const handleSubmit = async (values: BrandingFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  const primaryColor = form.watch('primaryColor');
  const secondaryColor = form.watch('secondaryColor');
  const accentColor = form.watch('accentColor');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Branding - {tenantName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="churchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Igreja</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome exibido no site" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tagline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan/Tagline</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Frase que aparece abaixo do nome" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium">Cores (HSL)</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primária</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input {...field} placeholder="222.2 47.4% 11.2%" />
                          <div 
                            className="h-8 rounded border"
                            style={{ backgroundColor: `hsl(${primaryColor})` }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secundária</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input {...field} placeholder="210 40% 96.1%" />
                          <div 
                            className="h-8 rounded border"
                            style={{ backgroundColor: `hsl(${secondaryColor})` }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destaque</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input {...field} placeholder="210 40% 96.1%" />
                          <div 
                            className="h-8 rounded border"
                            style={{ backgroundColor: `hsl(${accentColor})` }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>
                Use valores HSL sem "hsl()". Ex: "222.2 47.4% 11.2%"
              </FormDescription>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="faviconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Favicon</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fonte</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Inter, sans-serif" />
                  </FormControl>
                  <FormDescription>
                    Use nomes de fontes do Google Fonts ou fontes do sistema
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default TenantBrandingDialog;
