import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Copy, Edit } from 'lucide-react';
import { ImportedAccount } from '../ImportAccountsContent';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EditableCell } from './EditableCell';
import { formatBrazilianCurrency } from '@/utils/currencyUtils';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useCongregations } from '@/hooks/useCongregationData';
import { validateAccountData } from '@/utils/importValidators';

interface ImportPreviewTableProps {
  data: ImportedAccount[];
  onDataChange?: (updatedData: ImportedAccount[]) => void;
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ data, onDataChange }) => {
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);
  
  const { data: categories = [] } = useExpenseCategories();
  const { data: congregations = [] } = useCongregations();

  const updateAccount = (rowIndex: number, field: string, value: any) => {
    if (!onDataChange) return;
    
    const updatedData = [...data];
    (updatedData[rowIndex] as any)[field] = value;
    
    // Re-validate the account after update
    const validation = validateAccountData(updatedData[rowIndex], categories, congregations);
    updatedData[rowIndex].errors = validation.errors;
    updatedData[rowIndex].warnings = validation.warnings;
    updatedData[rowIndex].isValid = validation.isValid;
    
    onDataChange(updatedData);
  };
  const getStatusIcon = (account: ImportedAccount) => {
    if (account.isDuplicate) {
      return <Copy className="w-4 h-4 text-yellow-500" />;
    }
    if (!account.isValid) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (account.warnings.length > 0) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (account: ImportedAccount) => {
    if (account.isDuplicate) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Duplicada</Badge>;
    }
    if (!account.isValid) {
      return <Badge variant="destructive">Inválida</Badge>;
    }
    if (account.warnings.length > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">Válida</Badge>;
  };

  const formatCurrency = (value: number) => {
    return formatBrazilianCurrency(value);
  };

  const paymentMethodOptions = [
    { value: 'pix', label: 'PIX' },
    { value: 'transferencia', label: 'Transferência Bancária' },
    { value: 'boleto', label: 'Boleto' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'cartao', label: 'Cartão' },
    { value: 'cheque', label: 'Cheque' }
  ];

  const recurrenceFrequencyOptions = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'biweekly', label: 'Quinzenal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' }
  ];

  const urgencyLevelOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgente' }
  ];

  const categoryOptions = categories.map(cat => ({ value: cat.name, label: cat.name }));
  const congregationOptions = congregations.map(cong => ({ value: cong.name, label: cong.name }));

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const renderEditableCell = (account: ImportedAccount, rowIndex: number, field: string, type: 'text' | 'currency' | 'date' | 'select' | 'number', options?: Array<{ value: string; label: string }>) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;
    const value = (account as any)[field];
    const hasError = account.errors.some(error => error.toLowerCase().includes(field.toLowerCase()));
    
    return (
      <EditableCell
        value={value}
        onChange={(newValue) => updateAccount(rowIndex, field, newValue)}
        type={type}
        options={options}
        isEditing={isEditing}
        onStartEdit={() => setEditingCell({ rowIndex, field })}
        onStopEdit={() => setEditingCell(null)}
        hasError={hasError}
      />
    );
  };

  return (
    <div className="border rounded-lg">
      <ScrollArea className="h-96 w-full">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Favorecido</TableHead>
              <TableHead>Congregação</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Recorrência</TableHead>
              <TableHead>Detalhes Recorrência</TableHead>
              <TableHead>Outros</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((account, index) => (
              <TableRow key={account.id || index} className={
                account.isDuplicate ? 'bg-yellow-50' :
                !account.isValid ? 'bg-red-50' :
                account.warnings.length > 0 ? 'bg-yellow-50' : ''
              }>
                <TableCell>
                  <div className="flex items-center justify-center">
                    {getStatusIcon(account)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">
                      {renderEditableCell(account, index, 'description', 'text')}
                    </div>
                    {getStatusBadge(account)}
                  </div>
                </TableCell>
                <TableCell>
                  {renderEditableCell(account, index, 'category_id', 'select', categoryOptions)}
                  {!account.category_name && account.category_id && (
                    <div className="text-xs text-muted-foreground">(Nova categoria)</div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {renderEditableCell(account, index, 'amount', 'currency')}
                </TableCell>
                <TableCell>
                  {renderEditableCell(account, index, 'due_date', 'date')}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">
                      {renderEditableCell(account, index, 'payee_name', 'text')}
                    </div>
                    {account.payment_method === 'pix' ? (
                      <div className="text-xs">
                        <strong>PIX:</strong> {renderEditableCell(account, index, 'pix_key', 'text')}
                      </div>
                    ) : account.bank_name && (
                      <div className="text-xs">
                        <strong>Banco:</strong> {renderEditableCell(account, index, 'bank_name', 'text')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {renderEditableCell(account, index, 'congregation_id', 'select', congregationOptions)}
                  {!account.congregation_name && account.congregation_id && (
                    <div className="text-xs text-muted-foreground">(Nova congregação)</div>
                  )}
                </TableCell>
                <TableCell>
                  {renderEditableCell(account, index, 'payment_method', 'select', paymentMethodOptions)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>
                      {account.is_recurring ? (
                        <Badge variant="secondary" className="text-xs">
                          {renderEditableCell(account, index, 'recurrence_frequency', 'select', recurrenceFrequencyOptions)}
                        </Badge>
                      ) : account.is_future_scheduled ? (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Agendada
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {account.is_recurring && (
                    <div className="space-y-1 text-xs">
                      {(account.recurrence_frequency === 'weekly' || account.recurrence_frequency === 'biweekly') && (
                        <div>
                          <strong>Dia semana:</strong> {renderEditableCell(account, index, 'recurrence_day_of_week', 'number')}
                          <div className="text-muted-foreground">(0=Dom, 6=Sab)</div>
                        </div>
                      )}
                      {account.recurrence_frequency === 'monthly' && (
                        <div>
                          <strong>Dia mês:</strong> {renderEditableCell(account, index, 'recurrence_day_of_month', 'number')}
                        </div>
                      )}
                      {account.next_occurrence_date && (
                        <div>
                          <strong>Próxima:</strong> {renderEditableCell(account, index, 'next_occurrence_date', 'date')}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    {account.urgency_level && (
                      <div>
                        <strong>Urgência:</strong> {renderEditableCell(account, index, 'urgency_level', 'select', urgencyLevelOptions)}
                      </div>
                    )}
                    {account.urgency_level === 'urgent' && (
                      <div>
                        <strong>Desc. Urgência:</strong> {renderEditableCell(account, index, 'urgency_description', 'text')}
                      </div>
                    )}
                    {account.invoice_number && (
                      <div>
                        <strong>NF:</strong> {renderEditableCell(account, index, 'invoice_number', 'text')}
                      </div>
                    )}
                    {account.observations && (
                      <div>
                        <strong>Obs:</strong> {renderEditableCell(account, index, 'observations', 'text')}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};