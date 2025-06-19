
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateMinistry, useUpdateMinistry } from '@/hooks/useMinistryData';
import { useProfiles } from '@/hooks/useEventData';
import { useEffect } from 'react';

const ministrySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  leader_id: z.string().optional(),
});

type MinistryFormData = z.infer<typeof ministrySchema>;

interface MinistryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministry?: any;
}

const MinistryForm = ({ open, onOpenChange, ministry }: MinistryFormProps) => {
  const { data: profiles } = useProfiles();
  const createMinistry = useCreateMinistry();
  const updateMinistry = useUpdateMinistry();

  const form = useForm<MinistryFormData>({
    resolver: zodResolver(ministrySchema),
    defaultValues: {
      name: '',
      description: '',
      leader_id: '',
    },
  });

  useEffect(() => {
    if (ministry) {
      form.reset({
        name: ministry.name || '',
        description: ministry.description || '',
        leader_id: ministry.leader_id || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        leader_id: '',
      });
    }
  }, [ministry, form]);

  const onSubmit = (data: MinistryFormData) => {
    // Ensure name is always present
    const submitData = {
      name: data.name,
      description: data.description || null,
      leader_id: data.leader_id === '' ? null : data.leader_id,
    };

    if (ministry) {
      updateMinistry.mutate({ id: ministry.id, ...submitData }, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else {
      createMinistry.mutate(submitData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {ministry ? 'Editar Ministério' : 'Novo Ministério'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do ministério" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do ministério" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leader_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Líder</FormLabel>
                  <Select 
                    value={field.value || "none"} 
                    onValueChange={(value) => field.onChange(value === "none" ? "" : value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o líder" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
                disabled={createMinistry.isPending || updateMinistry.isPending}
              >
                {ministry ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MinistryForm;
