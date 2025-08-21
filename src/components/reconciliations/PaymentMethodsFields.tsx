
import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';

interface PaymentMethodsFieldsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
}

const PaymentMethodsFields: React.FC<PaymentMethodsFieldsProps> = ({ register, watch, setValue }) => {
  const watchedValues = watch(['pix', 'online_pix', 'debit', 'credit', 'cash']);
  const totalIncome = watchedValues.reduce((sum, value) => sum + (Number(value) || 0), 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Formas de Arrecadação</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pix">PIX</Label>
          <CurrencyInput
            id="pix"
            value={watch('pix') || 0}
            onChange={(value) => setValue('pix', value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="online_pix">PIX Online</Label>
          <CurrencyInput
            id="online_pix"
            value={watch('online_pix') || 0}
            onChange={(value) => setValue('online_pix', value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="debit">Débito</Label>
          <CurrencyInput
            id="debit"
            value={watch('debit') || 0}
            onChange={(value) => setValue('debit', value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="credit">Crédito</Label>
          <CurrencyInput
            id="credit"
            value={watch('credit') || 0}
            onChange={(value) => setValue('credit', value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="cash">Dinheiro</Label>
          <CurrencyInput
            id="cash"
            value={watch('cash') || 0}
            onChange={(value) => setValue('cash', value)}
            placeholder="0,00"
          />
        </div>

        <div>
          <Label htmlFor="total_income">Total Arrecadado</Label>
          <CurrencyInput
            id="total_income"
            value={totalIncome}
            onChange={() => {}} // Read-only
            disabled
            className="bg-muted"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsFields;
