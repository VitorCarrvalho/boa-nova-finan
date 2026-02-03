import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { useTenant } from '@/contexts/TenantContext';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      console.log('Fetching suppliers...');
      
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }

      console.log('Suppliers fetched successfully:', data);
      return data as Supplier[];
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  return useMutation({
    mutationFn: async (supplierData: SupplierInsert) => {
      console.log('Creating supplier with data:', supplierData);
      
      // Include tenant_id if available
      const dataWithTenant = tenant?.id 
        ? { ...supplierData, tenant_id: tenant.id }
        : supplierData;
      
      const { data, error } = await supabase
        .from('suppliers')
        .insert(dataWithTenant)
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }
      
      console.log('Supplier created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fornecedor criado',
        description: 'O fornecedor foi criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: 'Erro ao criar fornecedor',
        description: 'Ocorreu um erro ao criar o fornecedor.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: SupplierUpdate & { id: string }) => {
      console.log('Updating supplier:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw error;
      }
      
      console.log('Supplier updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fornecedor atualizado',
        description: 'O fornecedor foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating supplier:', error);
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: 'Ocorreu um erro ao atualizar o fornecedor.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting supplier:', id);
      
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting supplier:', error);
        throw error;
      }
      
      console.log('Supplier deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Fornecedor excluído',
        description: 'O fornecedor foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting supplier:', error);
      toast({
        title: 'Erro ao excluir fornecedor',
        description: 'Ocorreu um erro ao excluir o fornecedor.',
        variant: 'destructive',
      });
    },
  });
};
