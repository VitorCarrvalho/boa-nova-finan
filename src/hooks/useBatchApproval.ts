import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateApprovalPermission } from '@/utils/accountsPayableUtils';
import { useAuth } from '@/contexts/AuthContext';

interface BatchApprovalData {
  accountIds: string[];
  approvalLevel: 'management' | 'director' | 'president';
  notes?: string;
}

export const useBatchApproval = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getUserAccessProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ accountIds, approvalLevel, notes }: BatchApprovalData) => {
      console.log(`[useBatchApproval] Starting batch approval for ${accountIds.length} accounts`);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      // Verificar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status, access_profiles(name)')
        .eq('id', user.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Erro ao verificar perfil do usuário');
      }

      const userAccessProfile = profile?.access_profiles?.name;
      if (!userAccessProfile) {
        throw new Error('Usuário sem perfil de acesso definido');
      }

      // Buscar todas as contas para validação
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts_payable')
        .select('id, status')
        .in('id', accountIds);

      if (accountsError || !accounts) {
        throw new Error('Erro ao buscar contas para aprovação');
      }

      // Validar permissões para cada conta
      const validAccounts = accounts.filter(account => {
        const validationResult = validateApprovalPermission(
          userAccessProfile,
          account.status as any,
          true
        );
        return validationResult.canApprove;
      });

      if (validAccounts.length === 0) {
        throw new Error('Nenhuma conta pode ser aprovada com seu perfil atual');
      }

      if (validAccounts.length !== accountIds.length) {
        console.warn(`[useBatchApproval] Only ${validAccounts.length} of ${accountIds.length} accounts can be approved`);
      }

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

      const approvalPromises = validAccounts.map(async (account) => {
        // Atualizar status da conta
        const { error: updateError } = await supabase
          .from('accounts_payable')
          .update({
            status: nextStatus as any,
            approved_at: nextStatus === 'approved' ? new Date().toISOString() : null
          })
          .eq('id', account.id);

        if (updateError) throw updateError;

        // Registrar aprovação
        const { error: approvalError } = await supabase
          .from('accounts_payable_approvals')
          .insert({
            account_payable_id: account.id,
            approved_by: user.user.id,
            approval_level: approvalLevel,
            action: 'approved',
            notes,
          });

        if (approvalError) throw approvalError;
      });

      await Promise.all(approvalPromises);

      return {
        approvedCount: validAccounts.length,
        totalRequested: accountIds.length
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable-approvals'] });
      
      const nextStepMessage = result.approvedCount > 0 
        ? ' As contas foram enviadas para o próximo nível de aprovação.'
        : '';
      
      toast({
        title: 'Aprovação Realizada',
        description: `${result.approvedCount} conta(s) aprovada(s) em lote!${nextStepMessage}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro na aprovação em lote: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};

export const useBatchRejection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { getUserAccessProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      accountIds, 
      approvalLevel, 
      reason 
    }: { 
      accountIds: string[]; 
      approvalLevel: 'management' | 'director' | 'president';
      reason: string;
    }) => {
      console.log(`[useBatchRejection] Starting batch rejection for ${accountIds.length} accounts`);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, approval_status, access_profiles(name)')
        .eq('id', user.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Erro ao verificar perfil do usuário');
      }

      const userAccessProfile = profile?.access_profiles?.name;
      if (!userAccessProfile) {
        throw new Error('Usuário sem perfil de acesso definido');
      }

      const { data: accounts, error: accountsError } = await supabase
        .from('accounts_payable')
        .select('id, status')
        .in('id', accountIds);

      if (accountsError || !accounts) {
        throw new Error('Erro ao buscar contas para rejeição');
      }

      const validAccounts = accounts.filter(account => {
        const validationResult = validateApprovalPermission(
          userAccessProfile,
          account.status as any,
          true
        );
        return validationResult.canApprove;
      });

      if (validAccounts.length === 0) {
        throw new Error('Nenhuma conta pode ser rejeitada com seu perfil atual');
      }

      const rejectionPromises = validAccounts.map(async (account) => {
        // Atualizar status da conta para rejeitado
        const { error: updateError } = await supabase
          .from('accounts_payable')
          .update({
            status: 'rejected',
            rejected_at: new Date().toISOString(),
            rejection_reason: reason
          })
          .eq('id', account.id);

        if (updateError) throw updateError;

        // Registrar rejeição
        const { error: rejectionError } = await supabase
          .from('accounts_payable_approvals')
          .insert({
            account_payable_id: account.id,
            approved_by: user.user.id,
            approval_level: approvalLevel,
            action: 'rejected',
            notes: reason,
          });

        if (rejectionError) throw rejectionError;
      });

      await Promise.all(rejectionPromises);

      return {
        rejectedCount: validAccounts.length,
        totalRequested: accountIds.length
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['accounts-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable'] });
      queryClient.invalidateQueries({ queryKey: ['account-payable-approvals'] });
      
      toast({
        title: 'Sucesso',
        description: `${result.rejectedCount} conta(s) rejeitada(s) em lote!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro na rejeição em lote: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
};