
import React from 'react';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentMethodsFieldsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
}

const PaymentMethodsFields: React.FC<PaymentMethodsFieldsProps> = ({ register, watch }) => {
  const watchedValues = watch(['pix', 'online_pix', 'debit', 'credit', 'cash']);
  const totalIncome = watchedValues.reduce((sum, value) => sum + (Number(value) || 0), 0);

  return (
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
    </div>
  );
};

export default PaymentMethodsFields;
