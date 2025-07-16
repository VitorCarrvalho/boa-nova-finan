
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateReconciliation, useUpdateReconciliation } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import { usePermissions } from '@/hooks/usePermissions';

type ReconciliationFormData = {
  congregation_id: string;
  month: string;
  total_income: number;
  pix: number;
  online_pix: number;
  debit: number;
  credit: number;
  cash: number;
  status: 'pending' | 'approved' | 'rejected';
};

interface UseReconciliationFormProps {
  reconciliation?: any;
  onClose: () => void;
}

export const useReconciliationForm = ({ reconciliation, onClose }: UseReconciliationFormProps) => {
  const createMutation = useCreateReconciliation();
  const updateMutation = useUpdateReconciliation();
  const { data: congregations } = useCongregations();
  const { userRole, user } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const { canInsertModule, canEditModule, canApproveModule } = usePermissions();
  const isEditing = !!reconciliation;

  // For pastors, filter to only their assigned congregations
  const availableCongregations = React.useMemo(() => {
    if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
      return congregationAccess.assignedCongregations;
    }
    return congregations || [];
  }, [userRole, congregationAccess, congregations]);

  // Auto-select first congregation for pastors with only one congregation
  const defaultCongregationId = React.useMemo(() => {
    if (reconciliation?.congregation_id) {
      return reconciliation.congregation_id;
    }
    if (userRole === 'pastor' && availableCongregations.length === 1) {
      return availableCongregations[0].id;
    }
    return '';
  }, [reconciliation, userRole, availableCongregations]);

  // Convert date from database format to month input format
  const formatMonthForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Convert month input format to first day of the month for database
  const formatMonthForDatabase = (monthString: string) => {
    if (!monthString) return '';
    return `${monthString}-01`;
  };

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReconciliationFormData>({
    defaultValues: {
      congregation_id: defaultCongregationId,
      month: reconciliation?.month ? formatMonthForInput(reconciliation.month) : '',
      total_income: reconciliation?.total_income ? Number(reconciliation.total_income) : 0,
      pix: reconciliation?.pix ? Number(reconciliation.pix) : 0,
      online_pix: reconciliation?.online_pix ? Number(reconciliation.online_pix) : 0,
      debit: reconciliation?.debit ? Number(reconciliation.debit) : 0,
      credit: reconciliation?.credit ? Number(reconciliation.credit) : 0,
      cash: reconciliation?.cash ? Number(reconciliation.cash) : 0,
      status: 'pending', // Always pending for new submissions
    },
  });

  const watchedValues = watch(['pix', 'online_pix', 'debit', 'credit', 'cash']);
  const totalIncome = watchedValues.reduce((sum, value) => sum + (Number(value) || 0), 0);

  React.useEffect(() => {
    setValue('total_income', totalIncome);
  }, [totalIncome, setValue]);

  React.useEffect(() => {
    if (defaultCongregationId) {
      setValue('congregation_id', defaultCongregationId);
    }
  }, [defaultCongregationId, setValue]);

  const onSubmit = async (data: ReconciliationFormData) => {
    try {
      console.log('Submitting reconciliation data:', data);
      
      // Verificar permissões antes de prosseguir
      if (isEditing && !canEdit) {
        throw new Error('Você não tem permissão para editar conciliações');
      }
      
      if (!isEditing && !canInsert) {
        throw new Error('Você não tem permissão para criar conciliações');
      }
      
      // Ensure required fields are present
      if (!data.congregation_id) {
        throw new Error('Congregação é obrigatória');
      }
      
      if (!data.month) {
        throw new Error('Mês é obrigatório');
      }

      // For pastors, always force status to pending and ensure congregation_id is valid
      const submissionData = {
        congregation_id: data.congregation_id,
        month: formatMonthForDatabase(data.month), // Convert to database format
        total_income: totalIncome,
        pix: Number(data.pix) || 0,
        online_pix: Number(data.online_pix) || 0,
        debit: Number(data.debit) || 0,
        credit: Number(data.credit) || 0,
        cash: Number(data.cash) || 0,
        status: userRole === 'pastor' ? 'pending' as const : (data.status || 'pending' as const)
      };

      console.log('Final submission data:', submissionData);

      if (isEditing && reconciliation) {
        await updateMutation.mutateAsync({
          id: reconciliation.id,
          ...submissionData,
        });
      } else {
        await createMutation.mutateAsync(submissionData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving reconciliation:', error);
      // The error will be handled by the mutation's onError callback
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isPastor = userRole === 'pastor';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const canInsert = canInsertModule('conciliacoes');
  const canEdit = canEditModule('conciliacoes');
  const canApprove = canApproveModule('conciliacoes');

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    onSubmit,
    totalIncome,
    availableCongregations,
    defaultCongregationId,
    isLoading,
    isPastor,
    isAdmin,
    isEditing,
    congregationAccess,
    canInsert,
    canEdit,
    canApprove
  };
};
