
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TransactionType = Database['public']['Enums']['transaction_type'];
type FinancialCategory = Database['public']['Enums']['financial_category'];
type PaymentMethod = Database['public']['Enums']['payment_method'];

interface FinancialFormProps {
  onSuccess: () => void;
}

const FinancialForm: React.FC<FinancialFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '' as TransactionType,
    category: '' as FinancialCategory,
    amount: '',
    method: '' as PaymentMethod,
    event_type: '',
    event_date: '',
    attendees: '',
    description: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('financial_records')
        .insert([{
          type: formData.type,
          category: formData.category,
          amount: parseFloat(formData.amount),
          method: formData.method,
          event_type: formData.event_type || null,
          event_date: formData.event_date || null,
          attendees: formData.attendees ? parseInt(formData.attendees) : null,
          description: formData.description || null,
          created_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Registro financeiro criado",
        description: "O registro foi adicionado com sucesso!",
      });

      // Reset form
      setFormData({
        type: '' as TransactionType,
        category: '' as FinancialCategory,
        amount: '',
        method: '' as PaymentMethod,
        event_type: '',
        event_date: '',
        attendees: '',
        description: ''
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao criar registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = formData.type ? categoryOptions[formData.type] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Registro Financeiro</CardTitle>
        <CardDescription>
          Adicione uma nova entrada ou saída financeira
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type} onValueChange={(value) => 
                setFormData({ ...formData, type: value as TransactionType, category: '' as FinancialCategory })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as FinancialCategory })}
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
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
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

            <div className="space-y-2">
              <Label htmlFor="event_type">Tipo de Evento</Label>
              <Input
                id="event_type"
                placeholder="Culto, Conferência, etc."
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Data do Evento</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Participantes</Label>
              <Input
                id="attendees"
                type="number"
                placeholder="Número de participantes"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Detalhes adicionais sobre o registro"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancialForm;
