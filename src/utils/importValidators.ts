import { ImportedAccount } from '@/components/accounts-payable/ImportAccountsContent';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface Category {
  id: string;
  name: string;
}

interface Congregation {
  id: string;
  name: string;
}

export const validateAccountData = (
  account: ImportedAccount,
  categories: Category[],
  congregations: Congregation[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!account.description) {
    errors.push('Descrição é obrigatória');
  }

  if (!account.category_id) {
    errors.push('Categoria é obrigatória');
  } else {
    const categoryExists = categories.some(c => 
      c.name.toLowerCase() === account.category_id.toLowerCase() ||
      c.id === account.category_id
    );
    if (!categoryExists) {
      warnings.push(`Categoria "${account.category_id}" será criada automaticamente`);
    }
  }

  if (!account.amount || account.amount <= 0) {
    errors.push('Valor deve ser maior que zero');
  }

  if (!account.due_date) {
    errors.push('Data de vencimento é obrigatória');
  } else {
    const dueDate = new Date(account.due_date);
    if (isNaN(dueDate.getTime())) {
      errors.push('Data de vencimento inválida');
    }
  }

  if (!account.payment_method) {
    errors.push('Forma de pagamento é obrigatória');
  } else {
    const validMethods = ['pix', 'transferencia', 'boleto', 'dinheiro', 'cartao', 'cheque'];
    if (!validMethods.includes(account.payment_method)) {
      errors.push('Forma de pagamento inválida. Use: pix, transferencia, boleto, dinheiro, cartao, cheque');
    }
  }

  if (!account.payee_name) {
    errors.push('Nome do favorecido é obrigatório');
  }

  if (!account.congregation_id) {
    errors.push('Congregação é obrigatória');
  } else {
    const congregationExists = congregations.some(c => 
      c.name.toLowerCase() === account.congregation_id.toLowerCase() ||
      c.id === account.congregation_id
    );
    if (!congregationExists) {
      warnings.push(`Congregação "${account.congregation_id}" será criada automaticamente`);
    }
  }

  // Recurrence validation
  if (account.is_recurring && account.is_future_scheduled) {
    errors.push('Uma conta não pode ser recorrente e agendada ao mesmo tempo');
  }

  if (account.is_recurring) {
    if (!account.recurrence_frequency) {
      errors.push('Frequência de recorrência é obrigatória para contas recorrentes');
    } else {
      const validFrequencies = ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'];
      if (!validFrequencies.includes(account.recurrence_frequency)) {
        errors.push('Frequência inválida. Use: weekly, biweekly, monthly, quarterly, yearly');
      }

      // Validate day requirements based on frequency
      if (account.recurrence_frequency === 'weekly') {
        if (account.recurrence_day_of_week === undefined || account.recurrence_day_of_week < 0 || account.recurrence_day_of_week > 6) {
          errors.push('Dia da semana (0-6) é obrigatório para recorrência semanal');
        }
      }

      if (account.recurrence_frequency === 'biweekly') {
        if (!account.recurrence_day_of_month || ![15, 30].includes(account.recurrence_day_of_month)) {
          errors.push('Para recorrência quinzenal, o dia do mês deve ser 15 ou 30');
        }
      }

      if (['monthly', 'quarterly', 'yearly'].includes(account.recurrence_frequency)) {
        if (!account.recurrence_day_of_month || account.recurrence_day_of_month < 1 || account.recurrence_day_of_month > 31) {
          errors.push('Dia do mês (1-31) é obrigatório para recorrência mensal/trimestral/anual');
        }
      }
    }

    if (!account.next_occurrence_date) {
      errors.push('Data da primeira ocorrência é obrigatória para contas recorrentes');
    }
  }

  if (account.is_future_scheduled && !account.future_scheduled_date) {
    errors.push('Data de agendamento é obrigatória para contas agendadas');
  }

  // Urgency validation
  if (account.urgency_level === 'urgent' && !account.urgency_description) {
    warnings.push('Descrição do motivo da urgência é recomendada');
  }

  // Date validations
  if (account.due_date) {
    const dueDate = new Date(account.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      warnings.push('Data de vencimento está no passado');
    }
  }

  if (account.future_scheduled_date) {
    const scheduledDate = new Date(account.future_scheduled_date);
    const today = new Date();
    
    if (scheduledDate <= today) {
      warnings.push('Data de agendamento deve ser no futuro');
    }
  }

  if (account.next_occurrence_date) {
    const nextDate = new Date(account.next_occurrence_date);
    const today = new Date();
    
    if (nextDate <= today) {
      warnings.push('Data da próxima ocorrência deve ser no futuro');
    }
  }

  // Bank details validation
  if (account.payment_method === 'transferencia' && !account.bank_name) {
    warnings.push('Nome do banco é recomendado para transferências');
  }

  // PIX validation
  if (account.payment_method === 'pix' && !account.pix_key?.trim()) {
    errors.push('Chave PIX é obrigatória para pagamentos via PIX');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};