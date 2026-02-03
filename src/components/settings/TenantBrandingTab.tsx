import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Loader2 } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantBranding } from '@/contexts/TenantContext';
import { hexToHsl, hslToHex, isValidHex } from '@/utils/colorUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCurrentTenantSettings } from '@/hooks/useCurrentTenantSettings';

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

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (hslValue: string) => void;
}

function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  const hexValue = hslToHex(value);
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    if (isValidHex(hex)) {
      onChange(hexToHsl(hex));
    }
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hexValue}
            onChange={handleColorChange}
            className="w-12 h-10 rounded border cursor-pointer"
          />
          <Input 
            value={hexValue} 
            onChange={(e) => {
              if (isValidHex(e.target.value)) {
                onChange(hexToHsl(e.target.value));
              }
            }}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function TenantBrandingTab() {
  const { branding, saveBranding, loading, getTenantIdFromProfile, tenant } = useCurrentTenantSettings();
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      churchName: branding.churchName || '',
      tagline: branding.tagline || '',
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      logoUrl: branding.logoUrl || '',
      faviconUrl: branding.faviconUrl || '',
      fontFamily: branding.fontFamily,
    },
  });

  React.useEffect(() => {
    form.reset({
      churchName: branding.churchName || '',
      tagline: branding.tagline || '',
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      logoUrl: branding.logoUrl || '',
      faviconUrl: branding.faviconUrl || '',
      fontFamily: branding.fontFamily,
    });
  }, [branding, form]);

  const handleSubmit = async (values: BrandingFormValues) => {
    await saveBranding(values as Partial<TenantBranding>);
  };

  const handleFileUpload = async (
    file: File, 
    type: 'logo' | 'favicon',
    setLoading: (loading: boolean) => void
  ) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 2MB');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use PNG, JPG, SVG ou WebP');
      return;
    }

    setLoading(true);
    
    try {
      const tenantId = await getTenantIdFromProfile();
      if (!tenantId) {
        toast.error('Não foi possível identificar a organização');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/${type}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('tenant-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-logos')
        .getPublicUrl(fileName);

      if (type === 'logo') {
        form.setValue('logoUrl', publicUrl);
      } else {
        form.setValue('faviconUrl', publicUrl);
      }

      toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} enviado com sucesso!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = form.watch('logoUrl');
  const faviconUrl = form.watch('faviconUrl');
  const primaryColor = form.watch('primaryColor');
  const secondaryColor = form.watch('secondaryColor');
  const accentColor = form.watch('accentColor');

  if (!tenant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Configurações de branding estão disponíveis apenas para organizações específicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Identity Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identidade</CardTitle>
            <CardDescription>Nome e slogan da sua igreja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Logo Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logo e Favicon</CardTitle>
            <CardDescription>Imagens da sua marca</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <FormLabel>Logo</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {logoUrl ? (
                    <div className="relative inline-block">
                      <img 
                        src={logoUrl} 
                        alt="Logo preview" 
                        className="max-h-24 max-w-full mx-auto rounded"
                      />
                      <button
                        type="button"
                        onClick={() => form.setValue('logoUrl', '')}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'logo', setUploading);
                        }}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">Clique para enviar</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, SVG (max 2MB)</p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Favicon Upload */}
              <div className="space-y-2">
                <FormLabel>Favicon</FormLabel>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {faviconUrl ? (
                    <div className="relative inline-block">
                      <img 
                        src={faviconUrl} 
                        alt="Favicon preview" 
                        className="max-h-24 max-w-full mx-auto rounded"
                      />
                      <button
                        type="button"
                        onClick={() => form.setValue('faviconUrl', '')}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'favicon', setUploadingFavicon);
                        }}
                        disabled={uploadingFavicon}
                      />
                      {uploadingFavicon ? (
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mt-2">Clique para enviar</p>
                          <p className="text-xs text-muted-foreground">PNG, ICO (max 2MB)</p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cores</CardTitle>
            <CardDescription>Personalize as cores da sua interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <ColorPickerField
                    label="Primária"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <ColorPickerField
                    label="Secundária"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <ColorPickerField
                    label="Destaque"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Color Preview */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Preview das Cores</p>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-10 rounded border"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                  title="Primária"
                />
                <div 
                  className="w-16 h-10 rounded border"
                  style={{ backgroundColor: `hsl(${secondaryColor})` }}
                  title="Secundária"
                />
                <div 
                  className="w-16 h-10 rounded border"
                  style={{ backgroundColor: `hsl(${accentColor})` }}
                  title="Destaque"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipografia</CardTitle>
            <CardDescription>Fonte utilizada na interface</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || uploading || uploadingFavicon}>
            {loading ? 'Salvando...' : 'Salvar Branding'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TenantBrandingTab;
