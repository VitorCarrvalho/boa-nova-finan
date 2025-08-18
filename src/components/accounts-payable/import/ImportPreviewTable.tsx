import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { ImportedAccount } from '../ImportAccountsContent';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportPreviewTableProps {
  data: ImportedAccount[];
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ data }) => {
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
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
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
                    <div className="font-medium text-sm">{account.description}</div>
                    {getStatusBadge(account)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {account.category_name || account.category_id}
                    {!account.category_name && account.category_id && (
                      <div className="text-xs text-muted-foreground">(Nova categoria)</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(account.amount)}
                </TableCell>
                <TableCell>{formatDate(account.due_date)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{account.payee_name}</div>
                    {account.bank_name && (
                      <div className="text-xs text-muted-foreground">
                        {account.bank_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {account.congregation_name || account.congregation_id}
                    {!account.congregation_name && account.congregation_id && (
                      <div className="text-xs text-muted-foreground">(Nova congregação)</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {account.payment_method}
                  </Badge>
                </TableCell>
                <TableCell>
                  {account.is_recurring ? (
                    <Badge variant="secondary" className="text-xs">
                      {account.recurrence_frequency}
                    </Badge>
                  ) : account.is_future_scheduled ? (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Agendada
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};