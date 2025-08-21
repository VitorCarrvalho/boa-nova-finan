
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Database } from '@/integrations/supabase/types';
import { FinancialFormData } from '../hooks/useFinancialForm';

type TransactionType = Database['public']['Enums']['transaction_type'];
type FinancialCategory = Database['public']['Enums']['financial_category'];
type PaymentMethod = Database['public']['Enums']['payment_method'];

interface BasicFinancialFieldsProps {
  formData: FinancialFormData;
  setFormData: React.Dispatch<React.SetStateAction<FinancialFormData>>;
  congregations?: Array<{ id: string; name: string }>;
}

const categoryOptions = {
  income: [
    { value: 'tithe', label: 'Dízimo' },
    { value: 'offering', label: 'Oferta' },
    { value: 'online_offering', label: 'Oferta Online' },
    { value: 'vow_offering', label: 'Oferta de Votos' },
    { value: 'event', label: 'Evento' }
  ],
  expense: [
    { value: 'debt_paid', label: 'Dívida Paga' },
    { value: 'salary', label: 'Salário' },
    { value: 'maintenance', label: 'Manutenção' },
    { value: 'supplier', label: 'Fornecedor' },
    { value: 'project', label: 'Projeto' },
    { value: 'utility', label: 'Utilidade' }
  ]
};

const paymentMethods = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'coin', label: 'Moedas' },
  { value: 'pix', label: 'PIX' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' }
];

export const BasicFinancialFields: React.FC<BasicFinancialFieldsProps> = ({
  formData,
  setFormData,
  congregations
}) => {
  const availableCategories = formData.type ? categoryOptions[formData.type] || [] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="congregation">Congregação *</Label>
        <Select 
          value={formData.congregation_id} 
          onValueChange={(value) => setFormData({ ...formData, congregation_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a congregação" />
          </SelectTrigger>
          <SelectContent>
            {congregations?.map((congregation) => (
              <SelectItem key={congregation.id} value={congregation.id}>
                {congregation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Tipo *</Label>
        <Select value={formData.type} onValueChange={(value) => 
          setFormData({ ...formData, type: value as TransactionType, category: '' as FinancialCategory, supplier_id: '' })
        }>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria *</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value) => setFormData({ ...formData, category: value as FinancialCategory, supplier_id: '' })}
          disabled={!formData.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor *</Label>
        <CurrencyInput
          id="amount"
          value={parseFloat(formData.amount) || 0}
          onChange={(value) => setFormData({ ...formData, amount: value.toString() })}
          placeholder="0,00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Método de Pagamento *</Label>
        <Select value={formData.method} onValueChange={(value) => 
          setFormData({ ...formData, method: value as PaymentMethod })
        }>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o método" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
