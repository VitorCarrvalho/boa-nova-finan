
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateReconciliation, useUpdateReconciliation } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
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
  const isEditing = !!reconciliation;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReconciliationFormData>({
    defaultValues: {
      congregation_id: reconciliation?.congregation_id || '',
      month: reconciliation?.month || '',
      total_income: reconciliation?.total_income ? Number(reconciliation.total_income) : 0,
      pix: reconciliation?.pix ? Number(reconciliation.pix) : 0,
      online_pix: reconciliation?.online_pix ? Number(reconciliation.online_pix) : 0,
      debit: reconciliation?.debit ? Number(reconciliation.debit) : 0,
      credit: reconciliation?.credit ? Number(reconciliation.credit) : 0,
      cash: reconciliation?.cash ? Number(reconciliation.cash) : 0,
      status: reconciliation?.status || 'pending',
    },
  });

  const watchedValues = watch(['pix', 'online_pix', 'debit', 'credit', 'cash']);
  const totalIncome = watchedValues.reduce((sum, value) => sum + (Number(value) || 0), 0);

  React.useEffect(() => {
    setValue('total_income', totalIncome);
  }, [totalIncome, setValue]);

  const onSubmit = async (data: ReconciliationFormData) => {
    try {
      if (isEditing && reconciliation) {
        await updateMutation.mutateAsync({
          id: reconciliation.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving reconciliation:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="congregation_id">Congregação *</Label>
          <Select onValueChange={(value) => setValue('congregation_id', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma congregação" />
            </SelectTrigger>
            <SelectContent>
              {congregations?.map((congregation) => (
                <SelectItem key={congregation.id} value={congregation.id}>
                  {congregation.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.congregation_id && <p className="text-red-500 text-sm mt-1">Congregação é obrigatória</p>}
        </div>

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

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Formas de Arrecadação</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pix">PIX (R$)</Label>
            <Input
              id="pix"
              type="number"
              step="0.01"
              {...register('pix', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="online_pix">PIX Online (R$)</Label>
            <Input
              id="online_pix"
              type="number"
              step="0.01"
              {...register('online_pix', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="debit">Débito (R$)</Label>
            <Input
              id="debit"
              type="number"
              step="0.01"
              {...register('debit', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="credit">Crédito (R$)</Label>
            <Input
              id="credit"
              type="number"
              step="0.01"
              {...register('credit', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="cash">Dinheiro (R$)</Label>
            <Input
              id="cash"
              type="number"
              step="0.01"
              {...register('cash', { valueAsNumber: true })}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="total_income">Total Arrecadado (R$)</Label>
            <Input
              id="total_income"
              type="number"
              step="0.01"
              {...register('total_income', { valueAsNumber: true })}
              value={totalIncome}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Valor a Enviar (15%):</strong> R$ {(totalIncome * 0.15).toFixed(2)}
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select onValueChange={(value: any) => setValue('status', value)}>
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

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  );
};

export default ReconciliationForm;
