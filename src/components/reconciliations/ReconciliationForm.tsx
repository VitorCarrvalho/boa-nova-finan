
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateReconciliation, useUpdateReconciliation } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCongregationAccess } from '@/hooks/useUserCongregationAccess';
import CongregationField from './CongregationField';
import PaymentMethodsFields from './PaymentMethodsFields';
import ReconciliationSummary from './ReconciliationSummary';
import type { Database } from '@/integrations/supabase/types';

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

interface ReconciliationFormProps {
  reconciliation?: any;
  onClose: () => void;
}

const ReconciliationForm: React.FC<ReconciliationFormProps> = ({ reconciliation, onClose }) => {
  const createMutation = useCreateReconciliation();
  const updateMutation = useUpdateReconciliation();
  const { data: congregations } = useCongregations();
  const { userRole } = useAuth();
  const { data: congregationAccess } = useUserCongregationAccess();
  const isEditing = !!reconciliation;

  // For pastors, filter to only their assigned congregations
  const availableCongregations = React.useMemo(() => {
    if (userRole === 'pastor' && congregationAccess?.assignedCongregations) {
      return congregationAccess.assignedCongregations;
    }
    return congregations || [];
  }, [userRole, congregationAccess, congregations]);

  // Auto-select first congregation for pastors
  const defaultCongregationId = React.useMemo(() => {
    if (reconciliation?.congregation_id) {
      return reconciliation.congregation_id;
    }
    if (userRole === 'pastor' && availableCongregations.length > 0) {
      return availableCongregations[0].id;
    }
    return '';
  }, [reconciliation, userRole, availableCongregations]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReconciliationFormData>({
    defaultValues: {
      congregation_id: defaultCongregationId,
      month: reconciliation?.month || '',
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
      // Force status to pending for pastors
      const submissionData = {
        ...data,
        status: 'pending' as const
      };

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
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isPastor = userRole === 'pastor';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CongregationField
          isPastor={isPastor}
          availableCongregations={availableCongregations}
          defaultCongregationId={defaultCongregationId}
          setValue={setValue}
          errors={errors}
        />

        <div>
          <Label htmlFor="month">Mês/Ano *</Label>
          <Input
            id="month"
            type="month"
            {...register('month', { required: 'Mês é obrigatório' })}
          />
          {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>}
        </div>
      </div>

      <PaymentMethodsFields register={register} watch={watch} />

      <ReconciliationSummary totalIncome={totalIncome} />

      {isAdmin && (
        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={(value: any) => setValue('status', value)} defaultValue="pending">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Enviar Conciliação')}
        </Button>
      </div>
    </form>
  );
};

export default ReconciliationForm;
