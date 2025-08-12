
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialForm } from './hooks/useFinancialForm';
import { BasicFinancialFields } from './components/BasicFinancialFields';
import { SupplierPastorFields } from './components/SupplierPastorFields';
import { EventFields } from './components/EventFields';
import { validateFinancialForm } from './utils/formValidation';

interface FinancialFormProps {
  onSuccess: () => void;
}

const FinancialForm: React.FC<FinancialFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const {
    formData,
    setFormData,
    loading,
    setLoading,
    suppliers,
    congregations,
    pastors,
    currentUserPastor,
    userAccessProfile,
    user,
    resetForm
  } = useFinancialForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateFinancialForm(formData)) {
      return;
    }

    setLoading(true);

    try {
      const insertData: any = {
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        method: formData.method,
        event_type: formData.event_type || null,
        event_date: formData.event_date || null,
        attendees: formData.attendees ? parseInt(formData.attendees) : null,
        description: formData.description || null,
        created_by: user.id,
        responsible_pastor_id: formData.responsible_pastor_id,
        congregation_id: formData.congregation_id
      };

      // Add supplier_id only for supplier category expenses
      if (formData.type === 'expense' && formData.category === 'supplier' && formData.supplier_id) {
        insertData.supplier_id = formData.supplier_id;
      }

      console.log('Inserting financial record:', insertData);

      const { error } = await supabase
        .from('financial_records')
        .insert([insertData]);

      if (error) {
        console.error('Error inserting financial record:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Registro financeiro criado com sucesso!",
      });

      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Full error details:', error);
      toast({
        title: "Erro ao criar registro",
        description: error.message || "Erro desconhecido ao salvar o registro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUserPastor = userAccessProfile === 'Pastor';
  const availablePastors = isCurrentUserPastor && currentUserPastor ? [currentUserPastor] : pastors || [];

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
          <BasicFinancialFields
            formData={formData}
            setFormData={setFormData}
            congregations={congregations}
          />

          <SupplierPastorFields
            formData={formData}
            setFormData={setFormData}
            suppliers={suppliers}
            availablePastors={availablePastors}
            isCurrentUserPastor={isCurrentUserPastor}
          />

          <EventFields
            formData={formData}
            setFormData={setFormData}
          />

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
