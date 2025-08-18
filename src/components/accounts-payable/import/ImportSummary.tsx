import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface ImportResults {
  total: number;
  successful: number;
  failed: number;
  duplicatesSkipped: number;
  errors: Array<{
    row: number;
    description: string;
    error: string;
  }>;
}

interface ImportSummaryProps {
  results: ImportResults;
}

export const ImportSummary: React.FC<ImportSummaryProps> = ({ results }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-blue-700">{results.total}</span>
              </div>
              <div>
                <div className="text-sm font-medium">Total de Linhas</div>
                <div className="text-xs text-muted-foreground">Processadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-green-700">{results.successful}</div>
                <div className="text-xs text-muted-foreground">Importadas com Sucesso</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-red-700">{results.failed}</div>
                <div className="text-xs text-muted-foreground">Falharam</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-700">{results.duplicatesSkipped}</div>
                <div className="text-xs text-muted-foreground">Duplicadas Ignoradas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {results.successful > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800">Importação Concluída!</h3>
                <p className="text-green-700">
                  {results.successful} contas foram importadas com sucesso e estão aguardando aprovação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errors Section */}
      {results.failed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center space-x-2">
              <XCircle className="w-5 h-5" />
              <span>Erros Encontrados ({results.errors.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.errors.slice(0, 10).map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-sm text-red-800">
                    Linha {error.row}: {error.description}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Erro: {error.error}
                  </div>
                </div>
              ))}
              {results.errors.length > 10 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  ... e mais {results.errors.length - 10} erros
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/contas-pagar/pendente-aprovacao')}
        >
          Ver Contas Importadas
        </Button>
        <Button onClick={() => navigate('/contas-pagar')}>
          Voltar ao Menu
        </Button>
      </div>
    </div>
  );
};