import { useState } from 'react';
import { ImportedAccount } from '@/components/accounts-payable/ImportAccountsContent';
import { supabase } from '@/integrations/supabase/client';
import { checkForDuplicates } from '@/utils/duplicateChecker';
import { validateAccountData } from '@/utils/importValidators';

export interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
}

export const useImportValidation = () => {
  const [validationSummary, setValidationSummary] = useState<ValidationSummary>({
    total: 0,
    valid: 0,
    invalid: 0,
    duplicates: 0
  });

  const validateImportData = async (rawData: any[]): Promise<ImportedAccount[]> => {
    const validatedAccounts: ImportedAccount[] = [];
    
    // Fetch existing categories and congregations for validation
    const [categoriesResult, congregationsResult, existingAccountsResult] = await Promise.all([
      supabase.from('expense_categories').select('id, name').eq('is_active', true),
      supabase.from('congregations').select('id, name').eq('is_active', true),
      supabase.from('accounts_payable').select('description, amount, due_date')
    ]);

    const categories = categoriesResult.data || [];
    const congregations = congregationsResult.data || [];
    const existingAccounts = existingAccountsResult.data || [];

    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const account: ImportedAccount = {
        id: `import_${i}`,
        description: String(row.description || '').trim(),
        category_id: String(row.category_name || '').trim(),
        category_name: undefined,
        amount: parseFloat(String(row.amount || '0').replace(',', '.')),
        due_date: formatDate(row.due_date || row.vencimento),
        payment_method: normalizePaymentMethod(row.payment_method || row.pagamento),
        payee_name: String(row.payee_name || '').trim(),
        bank_name: String(row.bank_name || '').trim() || undefined,
        bank_agency: String(row.bank_agency || '').trim() || undefined,
        bank_account: String(row.bank_account || '').trim() || undefined,
        congregation_id: String(row.congregation_name || '').trim(),
        congregation_name: undefined,
        observations: String(row.observations || '').trim() || undefined,
        invoice_number: String(row.invoice_number || '').trim() || undefined,
        is_recurring: parseBooleanField(row.is_recurring),
        recurrence_frequency: String(row.recurrence_frequency || '').trim() || undefined,
        recurrence_day_of_week: parseIntField(row.recurrence_day_of_week),
        recurrence_day_of_month: parseIntField(row.recurrence_day_of_month),
        next_occurrence_date: formatDate(row.next_occurrence_date),
        is_future_scheduled: parseBooleanField(row.is_future_scheduled),
        future_scheduled_date: formatDate(row.future_scheduled_date),
        urgency_level: normalizeUrgencyLevel(row.urgency_level),
        urgency_description: String(row.urgency_description || '').trim() || undefined,
        isValid: true,
        errors: [],
        warnings: [],
        isDuplicate: false
      };

      // Validate the account
      const validation = validateAccountData(account, categories, congregations);
      account.errors = validation.errors;
      account.warnings = validation.warnings;
      account.isValid = validation.isValid;

      // Set category and congregation names if found
      const foundCategory = categories.find(c => c.name.toLowerCase() === account.category_id.toLowerCase());
      if (foundCategory) {
        account.category_id = foundCategory.id;
        account.category_name = foundCategory.name;
      }

      const foundCongregation = congregations.find(c => c.name.toLowerCase() === account.congregation_id.toLowerCase());
      if (foundCongregation) {
        account.congregation_id = foundCongregation.id;
        account.congregation_name = foundCongregation.name;
      }

      // Check for duplicates
      account.isDuplicate = checkForDuplicates(account, existingAccounts);

      validatedAccounts.push(account);
    }

    // Calculate summary
    const summary = {
      total: validatedAccounts.length,
      valid: validatedAccounts.filter(acc => acc.isValid && !acc.isDuplicate).length,
      invalid: validatedAccounts.filter(acc => !acc.isValid).length,
      duplicates: validatedAccounts.filter(acc => acc.isDuplicate).length
    };

    setValidationSummary(summary);
    return validatedAccounts;
  };

  return {
    validateImportData,
    validationSummary
  };
};

// Helper functions
const formatDate = (dateInput: any): string => {
  if (!dateInput) return '';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      // Try parsing Brazilian format dd/mm/yyyy
      const brFormat = dateInput.split('/');
      if (brFormat.length === 3) {
        const [day, month, year] = brFormat;
        const parsedDate = new Date(year, month - 1, day);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0];
        }
      }
      return '';
    }
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const parseBooleanField = (value: any): boolean => {
  const str = String(value || '').toLowerCase().trim();
  return ['sim', 'yes', 'true', '1', 'verdadeiro'].includes(str);
};

const parseIntField = (value: any): number | undefined => {
  const num = parseInt(String(value || ''));
  return isNaN(num) ? undefined : num;
};

const normalizePaymentMethod = (method: string): string => {
  const normalized = method.toLowerCase().trim();
  const methodMap: { [key: string]: string } = {
    'pix': 'pix',
    'transferencia': 'transferencia',
    'transferência': 'transferencia',
    'ted': 'transferencia',
    'doc': 'transferencia',
    'boleto': 'boleto',
    'dinheiro': 'dinheiro',
    'cartao': 'cartao',
    'cartão': 'cartao',
    'cheque': 'cheque'
  };
  return methodMap[normalized] || method;
};

const normalizeUrgencyLevel = (level: any): 'normal' | 'urgent' => {
  const str = String(level || '').toLowerCase().trim();
  return ['urgente', 'urgent', 'alta', 'high'].includes(str) ? 'urgent' : 'normal';
};