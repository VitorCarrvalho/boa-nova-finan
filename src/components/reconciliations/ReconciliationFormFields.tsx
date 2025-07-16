
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CongregationField from './CongregationField';
import PaymentMethodsFields from './PaymentMethodsFields';
import ReconciliationSummary from './ReconciliationSummary';

interface ReconciliationFormFieldsProps {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: any;
  totalIncome: number;
  availableCongregations: Array<{ id: string; name: string }>;
  defaultCongregationId: string;
  isPastor: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isEditing: boolean;
  onClose: () => void;
}

const ReconciliationFormFields: React.FC<ReconciliationFormFieldsProps> = ({
  register,
  setValue,
  watch,
  errors,
  totalIncome,
  availableCongregations,
  defaultCongregationId,
  isPastor,
  isAdmin,
  isLoading,
  isEditing,
  onClose
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <CongregationField
          isPastor={isPastor}
          availableCongregations={availableCongregations}
          defaultCongregationId={defaultCongregationId}
          setValue={setValue}
          errors={errors}
        />

        <div>
          <Label htmlFor="reconciliation_date">Data da Conciliação *</Label>
          <Input
            id="reconciliation_date"
            type="date"
            {...register('reconciliation_date', { required: 'Data da conciliação é obrigatória' })}
          />
          {errors.reconciliation_date && <p className="text-red-500 text-sm mt-1">{errors.reconciliation_date.message}</p>}
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
    </>
  );
};

export default ReconciliationFormFields;
