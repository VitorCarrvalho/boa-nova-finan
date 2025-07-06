
import { toast } from '@/hooks/use-toast';
import { FinancialFormData } from '../hooks/useFinancialForm';

export const validateFinancialForm = (formData: FinancialFormData): boolean => {
  if (!formData.congregation_id) {
    toast({
      title: "Erro",
      description: "Congregação é obrigatória.",
      variant: "destructive",
    });
    return false;
  }

  if (formData.type === 'expense' && formData.category === 'supplier' && !formData.supplier_id) {
    toast({
      title: "Erro",
      description: "Fornecedor é obrigatório para despesas de fornecedor.",
      variant: "destructive",
    });
    return false;
  }

  if (!formData.responsible_pastor_id) {
    toast({
      title: "Erro",
      description: "Pastor responsável é obrigatório.",
      variant: "destructive",
    });
    return false;
  }

  return true;
};
