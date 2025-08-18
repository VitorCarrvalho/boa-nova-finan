import { ImportedAccount } from '@/components/accounts-payable/ImportAccountsContent';

interface ExistingAccount {
  description: string;
  amount: number;
  due_date: string;
}

export const checkForDuplicates = (
  account: ImportedAccount,
  existingAccounts: ExistingAccount[]
): boolean => {
  return existingAccounts.some(existing => 
    existing.description.toLowerCase().trim() === account.description.toLowerCase().trim() &&
    Math.abs(existing.amount - account.amount) < 0.01 && // Handle floating point precision
    existing.due_date === account.due_date
  );
};