
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Check, X } from 'lucide-react';
import { useUpdateReconciliation } from '@/hooks/useReconciliationData';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

interface ReconciliationTableProps {
  reconciliations: any[];
  onEdit: (reconciliation: any) => void;
}

const ReconciliationTable: React.FC<ReconciliationTableProps> = ({ reconciliations, onEdit }) => {
  const updateMutation = useUpdateReconciliation();
  const { userRole } = useAuth();
  const { canEditModule, canApproveModule } = usePermissions();

  const handleApprove = async (reconciliation: any) => {
    await updateMutation.mutateAsync({
      id: reconciliation.id,
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
  };

  const handleReject = async (reconciliation: any) => {
    await updateMutation.mutateAsync({
      id: reconciliation.id,
      status: 'rejected',
    });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return 'R$ 0,00';
    return `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const formatMonth = (month: string) => {
    if (!month) return 'Data inválida';
    const date = new Date(month);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
    }
  };

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isPastor = userRole === 'pastor';
  const canEdit = canEditModule('conciliacoes');
  const canApprove = canApproveModule('conciliacoes');

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Congregação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data da Conciliação
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mês/Ano
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Arrecadado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor a Enviar (15%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reconciliations.map((reconciliation) => (
              <tr key={reconciliation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reconciliation.congregations?.name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {reconciliation.reconciliation_date ? 
                    new Date(reconciliation.reconciliation_date).toLocaleDateString('pt-BR') : 
                    '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatMonth(reconciliation.month)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(reconciliation.total_income)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(reconciliation.amount_to_send)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(reconciliation.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {/* Edit button - only if user has edit permission */}
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(reconciliation)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {/* Approval buttons - only if user has approve permission and reconciliation is pending */}
                    {canApprove && reconciliation.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(reconciliation)}
                          className="text-green-600 hover:text-green-700"
                          title="Aprovar"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(reconciliation)}
                          className="text-red-600 hover:text-red-700"
                          title="Reprovar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {reconciliations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma conciliação encontrada
        </div>
      )}
    </div>
  );
};

export default ReconciliationTable;
