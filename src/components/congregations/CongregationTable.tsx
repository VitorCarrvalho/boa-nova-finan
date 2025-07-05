
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useDeleteCongregation } from '@/hooks/useCongregationData';
import { useMembers } from '@/hooks/useMemberData';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Congregation = Database['public']['Tables']['congregations']['Row'];

interface CongregationTableProps {
  congregations: Congregation[];
  onEdit?: (congregation: Congregation) => void;
}

const CongregationTable: React.FC<CongregationTableProps> = ({ congregations, onEdit }) => {
  const deleteMutation = useDeleteCongregation();
  const { data: members = [] } = useMembers();
  const { userRole } = useAuth();

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta congregação?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const formatAddress = (congregation: Congregation) => {
    const parts = [
      congregation.street,
      congregation.number,
      congregation.city,
      congregation.state
    ].filter(Boolean);
    return parts.join(', ') || 'Endereço não informado';
  };

  const getResponsiblePastors = (pastorIds: string[] | null) => {
    if (!pastorIds || pastorIds.length === 0) return [];
    return members.filter(member => 
      pastorIds.includes(member.id) && member.role === 'pastor'
    );
  };

  // Only admins and superadmins can manage congregations
  const canManageCongregations = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pastores Responsáveis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Endereço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membros
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {canManageCongregations && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {congregations.map((congregation) => {
              const responsiblePastors = getResponsiblePastors(congregation.responsible_pastor_ids);
              
              return (
                <tr key={congregation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {congregation.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {congregation.cnpj || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {responsiblePastors.length > 0 ? (
                      <div className="space-y-1">
                        {responsiblePastors.map((pastor) => (
                          <div key={pastor.id} className="text-xs">
                            <div className="font-medium">{pastor.name}</div>
                            {pastor.email && (
                              <div className="text-gray-400">{pastor.email}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Nenhum pastor atribuído</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatAddress(congregation)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {congregation.avg_members || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={congregation.is_active ? 'default' : 'secondary'}>
                      {congregation.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </td>
                  {canManageCongregations && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(congregation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(congregation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {congregations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma congregação encontrada
        </div>
      )}
    </div>
  );
};

export default CongregationTable;
