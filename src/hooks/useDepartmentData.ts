
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];
type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];
type DepartmentUpdate = Database['public']['Tables']['departments']['Update'];

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      console.log('Fetching departments...');
      
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          leader:profiles!leader_id(name)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      console.log('Departments fetched successfully:', data);
      return data as (Department & { leader?: { name: string } })[];
    },
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentData: DepartmentInsert) => {
      console.log('Creating department with data:', departmentData);
      
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select()
        .single();

      if (error) {
        console.error('Error creating department:', error);
        throw error;
      }
      
      console.log('Department created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Departamento criado',
        description: 'O departamento foi criado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error creating department:', error);
      toast({
        title: 'Erro ao criar departamento',
        description: 'Ocorreu um erro ao criar o departamento.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: DepartmentUpdate & { id: string }) => {
      console.log('Updating department:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('departments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating department:', error);
        throw error;
      }
      
      console.log('Department updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Departamento atualizado',
        description: 'O departamento foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error updating department:', error);
      toast({
        title: 'Erro ao atualizar departamento',
        description: 'Ocorreu um erro ao atualizar o departamento.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting department:', id);
      
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting department:', error);
        throw error;
      }
      
      console.log('Department deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast({
        title: 'Departamento excluído',
        description: 'O departamento foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      console.error('Error deleting department:', error);
      toast({
        title: 'Erro ao excluir departamento',
        description: 'Ocorreu um erro ao excluir o departamento.',
        variant: 'destructive',
      });
    },
  });
};
