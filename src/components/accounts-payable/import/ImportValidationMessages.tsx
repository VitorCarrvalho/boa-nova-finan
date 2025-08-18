import React from 'react';
import { AlertTriangle, XCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImportedAccount } from '../ImportAccountsContent';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportValidationMessagesProps {
  data: ImportedAccount[];
}

export const ImportValidationMessages: React.FC<ImportValidationMessagesProps> = ({ data }) => {
  const invalidAccounts = data.filter(account => !account.isValid);
  const duplicateAccounts = data.filter(account => account.isDuplicate);
  const warningAccounts = data.filter(account => account.isValid && !account.isDuplicate && account.warnings.length > 0);

  return (
    <div className="space-y-4">
      {/* Errors */}
      {invalidAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <XCircle className="w-5 h-5" />
              <span>Contas com Erro ({invalidAccounts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {invalidAccounts.map((account, index) => (
                  <div key={account.id || index} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="font-medium text-sm text-red-800 mb-2">
                      {account.description} - {account.payee_name}
                    </div>
                    <div className="space-y-1">
                      {account.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="text-xs text-red-600 flex items-center space-x-1">
                          <span>•</span>
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Duplicates */}
      {duplicateAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center space-x-2">
              <Copy className="w-5 h-5" />
              <span>Contas Duplicadas ({duplicateAccounts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {duplicateAccounts.map((account, index) => (
                  <div key={account.id || index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="font-medium text-sm text-yellow-800">
                      {account.description} - {account.payee_name}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1 flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        R$ {account.amount.toFixed(2)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {new Date(account.due_date).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Esta conta já existe no sistema e será ignorada na importação.
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warningAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Avisos ({warningAccounts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {warningAccounts.map((account, index) => (
                  <div key={account.id || index} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="font-medium text-sm text-yellow-800 mb-2">
                      {account.description} - {account.payee_name}
                    </div>
                    <div className="space-y-1">
                      {account.warnings.map((warning, warningIndex) => (
                        <div key={warningIndex} className="text-xs text-yellow-600 flex items-center space-x-1">
                          <span>•</span>
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};