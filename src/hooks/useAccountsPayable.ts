import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AccountPayable {
  id: string;
  description: string;
  category_id: string;
  amount: number;
  due_date: string;
  payment_method: string;
  payee_name: string;
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  congregation_id: string;
  attachment_url?: string;
  attachment_filename?: string;
  observations?: string;
  invoice_number?: string;
  is_recurring: boolean;
  recurrence_frequency?: string;
  requested_by: string;
  requested_at: string;
  status: 'pending_management' | 'pending_director' | 'pending_president' | 'approved' | 'paid' | 'rejected';
  urgency_level: 'normal' | 'urgent';
  urgency_description?: string;
  approved_at?: string;
  paid_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  category?: { name: string; description?: string };
  congregation?: { name: string };
  requester?: { name: string };
}

export interface AccountPayableApproval {
  id: string;
  account_payable_id: string;
  approved_by: string;
  approval_level: 'management' | 'director' | 'president';
  action: 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  approver?: { name: string };
}

export interface CreateAccountPayableData {
  description: string;
  category_id: string;
  amount: number;
  due_date: string;
  payment_method: string;
  payee_name: string;
  bank_name?: string;
  bank_agency?: string;
  bank_account?: string;
  congregation_id: string;
  observations?: string;
  invoice_number?: string;
  is_recurring?: boolean;
  recurrence_frequency?: string;
  urgency_level?: 'normal' | 'urgent';
  urgency_description?: string;
}

export const useAccountsPayable = (filters?: {
  status?: string;
  congregation_id?: string;
  date_from?: string;
  date_to?: string;
}) => {
  return useQuery({
    queryKey: ['accounts-payable', filters],
    queryFn: async () => {
      console.log('useAccountsPayable - Starting query with filters:', filters);
      
      // Verificar usuário autenticado
      const { data: user } = await supabase.auth.getUser();
      console.log('useAccountsPayable - Current user:', user?.user?.id);
      
      // Verificar role do usuário
      const { data: userRole } = await supabase.rpc('get_current_user_role');
      console.log('useAccountsPayable - Current user role:', userRole);
      
      let query = supabase
        .from('accounts_payable')
        .select(`
          *,
          category:expense_categories(name, description),
          congregation:congregations(name),
          requester:profiles!accounts_payable_requested_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        console.log('useAccountsPayable - Applying status filter:', filters.status);
        query = query.eq('status', filters.status as any);
      }
      if (filters?.congregation_id) {
        console.log('useAccountsPayable - Applying congregation filter:', filters.congregation_id);
        query = query.eq('congregation_id', filters.congregation_id);
      }
      if (filters?.date_from) {
        console.log('useAccountsPayable - Applying date_from filter:', filters.date_from);
        query = query.gte('due_date', filters.date_from);
      }
      if (filters?.date_to) {
        console.log('useAccountsPayable - Applying date_to filter:', filters.date_to);
        query = query.lte('due_date', filters.date_to);
      }

      const { data, error } = await query;
      
      console.log('useAccountsPayable - Query result:', { data, error });
      console.log('useAccountsPayable - Number of accounts returned:', data?.length);
      
      if (error) {
        console.error('useAccountsPayable - Query error:', error);
        throw error;
      }
      
      return data as any[];
    },
  });
};

export const useAccountPayable = (id: string) => {
  return useQuery({
    queryKey: ['account-payable', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select(`
          *,
          category:expense_categories(name, description),
          congregation:congregations(name),
          requester:profiles!accounts_payable_requested_by_fkey(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });
};

export const useAccountPayableApprovals = (accountId: string) => {
  return useQuery({
    queryKey: ['account-payable-approvals', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('accounts_payable_approvals')
        .select(`
          *,
          approver:profiles!accounts_payable_approvals_approved_by_fkey(name)
        `)
        .eq('account_payable_id', accountId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!accountId,
  });
};

export const useCreateAccountPayable = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAccountPayableData) => {
      console.log('Tentando criar conta a pagar...');
      
      // Verificar autenticação
      const { data: user, error: authError } = await supabase.auth.getUser();
      if (authError || !user.user) {
        console.error('Erro de autenticação:', authError);
        throw new Error('Usuário não autenticado');
      }

      console.log('Usuário autenticado:', user.user.id);

      // Verificar papel do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approval_status, name')
        .eq('id', user.user.id)
        .single();

      console.log('Perfil do usuário:', profile);

      if (!profile || profile.approval_status !== 'ativo') {
        throw new Error('Usuário não aprovado no sistema');
      }

      // Verificar se o usuário tem permissão para criar contas a pagar
      const allowedRoles = ['assistente', 'analista', 'gerente', 'pastor'];
      if (!allowedRoles.includes(profile.role)) {
        throw new Error(`Sem permissão. Papel atual: ${profile.role}. Papéis permitidos: ${allowedRoles.join(', ')}`);
      }

      console.log('Inserindo dados:', { ...data, requested_by: user.user.id });

      const { data: result, error } = await supabase
        .from('accounts_payable')
        .insert({
          ...data,
          requested_by: user.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro na inserção:', error);
        throw error;
      }
      
      console.log('Conta criada com sucesso:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      toast({
        title: 'Sucesso',
        description: 'Conta a pagar criada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao criar conta a pagar: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAccountPayable = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AccountPayable> }) => {
      const { data: result, error } = await supabase
        .from('accounts_payable')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable'] });
      toast({
        title: 'Sucesso',
        description: 'Conta a pagar atualizada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao atualizar conta a pagar: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useApproveAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      approvalLevel,
      notes 
    }: { 
      accountId: string; 
      approvalLevel: 'management' | 'director' | 'president';
      notes?: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Determinar próximo status
      let nextStatus: string;
      switch (approvalLevel) {
        case 'management':
          nextStatus = 'pending_director';
          break;
        case 'director':
          nextStatus = 'pending_president';
          break;
        case 'president':
          nextStatus = 'approved';
          break;
        default:
          throw new Error('Nível de aprovação inválido');
      }

      // Atualizar status da conta
      const { error: updateError } = await supabase
        .from('accounts_payable')
        .update({ 
          status: nextStatus as any,
          approved_at: nextStatus === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Registrar aprovação
      const { error: approvalError } = await supabase
        .from('accounts_payable_approvals')
        .insert({
          account_payable_id: accountId,
          approved_by: user.user.id,
          approval_level: approvalLevel,
          action: 'approved',
          notes,
        });

      if (approvalError) throw approvalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable-approvals'] });
      toast({
        title: 'Sucesso',
        description: 'Conta aprovada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao aprovar conta: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useRejectAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      approvalLevel,
      reason 
    }: { 
      accountId: string; 
      approvalLevel: 'management' | 'director' | 'president';
      reason: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Atualizar status da conta para rejeitado
      const { error: updateError } = await supabase
        .from('accounts_payable')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', accountId);

      if (updateError) throw updateError;

      // Registrar rejeição
      const { error: approvalError } = await supabase
        .from('accounts_payable_approvals')
        .insert({
          account_payable_id: accountId,
          approved_by: user.user.id,
          approval_level: approvalLevel,
          action: 'rejected',
          notes: reason,
        });

      if (approvalError) throw approvalError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable-approvals'] });
      toast({
        title: 'Sucesso',
        description: 'Conta rejeitada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao rejeitar conta: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      accountId, 
      attachmentUrl,
      attachmentFilename
    }: { 
      accountId: string; 
      attachmentUrl?: string;
      attachmentFilename?: string;
    }) => {
      const { error } = await supabase
        .from('accounts_payable')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString(),
          attachment_url: attachmentUrl,
          attachment_filename: attachmentFilename
        })
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable'] });
      toast({
        title: 'Sucesso',
        description: 'Conta marcada como paga com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao marcar conta como paga: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};
