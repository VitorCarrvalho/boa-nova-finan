import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useConectaCategories, useConectaCongregations } from '@/hooks/useConectaProviders';
import { Upload, Check } from 'lucide-react';

const submitFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  experienceYears: z.number().min(0, 'Experiência não pode ser negativa').max(50, 'Experiência máxima de 50 anos'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp: z.string().min(10, 'WhatsApp deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email inválido'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  congregationId: z.string().min(1, 'Selecione uma congregação'),
  photoFile: z.any().refine((file) => file?.length > 0, 'Foto é obrigatória'),
  termsAccepted: z.boolean().refine((val) => val === true, 'Você deve aceitar os termos de uso')
});

type SubmitFormData = z.infer<typeof submitFormSchema>;

interface ConectaSubmitFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConectaSubmitForm: React.FC<ConectaSubmitFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: categories } = useConectaCategories();
  const { data: congregations } = useConectaCongregations();

  const form = useForm<SubmitFormData>({
    resolver: zodResolver(submitFormSchema),
    defaultValues: {
      name: '',
      description: '',
      experienceYears: 0,
      categoryId: '',
      instagram: '',
      linkedin: '',
      website: '',
      whatsapp: '',
      email: '',
      city: '',
      state: '',
      congregationId: '',
      termsAccepted: false
    }
  });

  const onSubmit = async (data: SubmitFormData) => {
    try {
      setIsSubmitting(true);

      // Upload photo first
      const photoFile = data.photoFile[0];
      const photoExtension = photoFile.name.split('.').pop();
      const photoPath = `pending/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${photoExtension}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(photoPath, photoFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erro ao fazer upload da foto. Verifique o formato e tamanho do arquivo.');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(photoPath);

      // Find congregation name
      const congregation = congregations?.find(c => c.id === data.congregationId);

      // Submit provider data
      const { error: insertError } = await supabase
        .from('service_providers')
        .insert({
          name: data.name,
          description: data.description,
          experience_years: data.experienceYears,
          category_id: data.categoryId,
          instagram: data.instagram || null,
          linkedin: data.linkedin || null,
          website: data.website || null,
          whatsapp: data.whatsapp,
          email: data.email,
          city: data.city,
          state: data.state,
          congregation_id: data.congregationId,
          congregation_name: congregation?.name,
          photo_url: publicUrl,
          status: 'pending' as any,
          terms_accepted: true
        } as any);

      if (insertError) {
        throw insertError;
      }

      setIsSuccess(true);
      toast({
        title: "Cadastro Enviado!",
        description: "Recebemos seu cadastro. Ele passará por análise e, se aprovado, ficará visível em breve.",
      });

    } catch (error: any) {
      console.error('Error submitting provider:', error);
      
      let errorMessage = "Ocorreu um erro ao enviar seu cadastro. Tente novamente.";
      
      if (error.message.includes('upload')) {
        errorMessage = "Erro no upload da foto. Verifique o formato e tamanho do arquivo.";
      }
      
      toast({
        title: "Erro no Cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      form.reset();
      onClose();
    }
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Cadastro Enviado com Sucesso!
            </h3>
            <p className="text-slate-600 mb-6">
              Recebemos seu cadastro. Ele passará por análise e, se aprovado, ficará visível em breve.
            </p>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Prestador de Serviço</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <FormField
              control={form.control}
              name="photoFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto/Logo *</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => field.onChange(e.target.files)}
                        className="max-w-xs mx-auto"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        Formatos aceitos: JPG, PNG, WebP
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Prestador/Empresa *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Seu nome ou nome da empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Experiência (anos) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        max="50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição dos Serviços *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva seus serviços, especialidades e diferenciais..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@seuusuario" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://linkedin.com/in/..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://seusite.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(11) 99999-9999" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="seuemail@exemplo.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="São Paulo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="SP" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Congregation */}
            <FormField
              control={form.control}
              name="congregationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Igreja/Congregação *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua congregação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {congregations?.map((congregation) => (
                        <SelectItem key={congregation.id} value={congregation.id}>
                          {congregation.name} - {congregation.city}/{congregation.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      Aceito os termos de uso *
                    </FormLabel>
                    <p className="text-xs text-slate-500">
                      Concordo em fornecer informações verídicas e em manter meus dados atualizados.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConectaSubmitForm;