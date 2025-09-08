import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ImportedAccount } from '@/components/accounts-payable/ImportAccountsContent';
import { ImportResults } from '@/components/accounts-payable/import/ImportSummary';
import { toast } from '@/hooks/use-toast';

export const useAccountsImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importAccounts = async (accounts: ImportedAccount[]): Promise<boolean> => {
    setIsImporting(true);
    setError(null);
    setProgress(0);

    const importResults: ImportResults = {
      total: accounts.length,
      successful: 0,
      failed: 0,
      duplicatesSkipped: 0,
      errors: []
    };

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Create/find categories and congregations first
      const { categoryMap, congregationMap } = await createMissingEntities(accounts);

      // Import accounts in batches
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < accounts.length; i += batchSize) {
        batches.push(accounts.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        for (const account of batch) {
          try {
            await importSingleAccount(account, categoryMap, congregationMap, user.id);
            importResults.successful++;
          } catch (error) {
            importResults.failed++;
            importResults.errors.push({
              row: batchIndex * batchSize + batch.indexOf(account) + 2, // +2 for header and 1-based indexing
              description: account.description,
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }
        }

        // Update progress
        const currentProgress = ((batchIndex + 1) / batches.length) * 100;
        setProgress(Math.round(currentProgress));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(importResults);
      
      if (importResults.successful > 0) {
        toast({
          title: 'Importação concluída',
          description: `${importResults.successful} contas foram importadas com sucesso.`,
        });
      }

      if (importResults.failed > 0) {
        toast({
          title: 'Alguns erros encontrados',
          description: `${importResults.failed} contas falharam na importação.`,
          variant: 'destructive',
        });
      }

      return true;
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Erro durante a importação');
      return false;
    } finally {
      setIsImporting(false);
      setProgress(100);
    }
  };

  const createMissingEntities = async (accounts: ImportedAccount[]) => {
    const categoryMap = new Map<string, string>();
    const congregationMap = new Map<string, string>();

    // Get unique categories and congregations needed
    const uniqueCategories = [...new Set(accounts.map(acc => acc.category_name).filter(Boolean))];
    const uniqueCongregations = [...new Set(accounts.map(acc => acc.congregation_name).filter(Boolean))];

    // Fetch existing categories
    const { data: existingCategories } = await supabase
      .from('expense_categories')
      .select('id, name')
      .in('name', uniqueCategories);

    // Map existing categories
    existingCategories?.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // Create missing categories
    const missingCategories = uniqueCategories.filter(name => !categoryMap.has(name));
    if (missingCategories.length > 0) {
      const newCategories = missingCategories.map(name => ({
        name,
        description: `Categoria criada automaticamente via importação: ${name}`,
        is_active: true
      }));

      const { data: createdCategories } = await supabase
        .from('expense_categories')
        .insert(newCategories)
        .select('id, name');

      createdCategories?.forEach(cat => {
        categoryMap.set(cat.name, cat.id);
      });
    }

    // Fetch existing congregations
    const { data: existingCongregations } = await supabase
      .from('congregations')
      .select('id, name')
      .in('name', uniqueCongregations);

    // Map existing congregations
    existingCongregations?.forEach(cong => {
      congregationMap.set(cong.name, cong.id);
    });

    // Create missing congregations
    const missingCongregations = uniqueCongregations.filter(name => !congregationMap.has(name));
    if (missingCongregations.length > 0) {
      const newCongregations = missingCongregations.map(name => ({
        name,
        is_active: true,
        country: 'Brasil'
      }));

      const { data: createdCongregations } = await supabase
        .from('congregations')
        .insert(newCongregations)
        .select('id, name');

      createdCongregations?.forEach(cong => {
        congregationMap.set(cong.name, cong.id);
      });
    }

    return { categoryMap, congregationMap };
  };

  const importSingleAccount = async (
    account: ImportedAccount, 
    categoryMap: Map<string, string>, 
    congregationMap: Map<string, string>,
    userId: string
  ) => {
    const categoryId = categoryMap.get(account.category_name!) || account.category_id;
    const congregationId = congregationMap.get(account.congregation_name!) || account.congregation_id;

    // Validate that we have valid UUIDs
    if (!categoryId || categoryId === 'TO_CREATE') {
      throw new Error(`Categoria "${account.category_name}" não foi encontrada no sistema`);
    }
    if (!congregationId || congregationId === 'TO_CREATE') {
      throw new Error(`Congregação "${account.congregation_name}" não foi encontrada no sistema`);
    }

    const accountData = {
      description: account.description,
      category_id: categoryId,
      amount: account.amount,
      due_date: account.due_date,
      payment_method: account.payment_method,
      payee_name: account.payee_name,
      bank_name: account.bank_name || null,
      bank_agency: account.bank_agency || null,
      bank_account: account.bank_account || null,
      congregation_id: congregationId,
      observations: account.observations || null,
      invoice_number: account.invoice_number || null,
      is_recurring: account.is_recurring,
      recurrence_frequency: account.recurrence_frequency || null,
      recurrence_day_of_week: account.recurrence_day_of_week || null,
      recurrence_day_of_month: account.recurrence_day_of_month || null,
      next_occurrence_date: account.next_occurrence_date || null,
      is_future_scheduled: account.is_future_scheduled,
      future_scheduled_date: account.future_scheduled_date || null,
      urgency_level: account.urgency_level,
      urgency_description: account.urgency_description || null,
      requested_by: userId,
      status: 'pending_management' as const
    };

    const { error } = await supabase
      .from('accounts_payable')
      .insert(accountData);

    if (error) {
      throw new Error(`Erro ao inserir conta: ${error.message}`);
    }
  };

  return {
    importAccounts,
    isImporting,
    progress,
    results,
    error
  };
};