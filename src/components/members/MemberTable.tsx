
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Edit, Search, Filter } from 'lucide-react';
import { useMembers } from '@/hooks/useMemberData';
import { usePermissions } from '@/hooks/usePermissions';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTableCard } from '@/components/ui/mobile-table-card';
import { Database } from '@/integrations/supabase/types';

type Member = Database['public']['Tables']['members']['Row'];

interface MemberTableProps {
  onEditMember: (member: Member) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({ onEditMember }) => {
  const { data: members, isLoading } = useMembers();
  const { canEditModule, canExportModule } = usePermissions();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const canEdit = canEditModule('membros');
  const canExport = canExportModule('membros');

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      member: 'Membro',
      worker: 'Obreiro',
      pastor: 'Pastor'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const filteredMembers = members?.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && member.is_active) ||
                         (statusFilter === 'inactive' && !member.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const exportToCSV = () => {
    if (!filteredMembers) return;

    const headers = [
      'Nome',
      'Email',
      'Telefone',
      'Função',
      'Data Batismo',
      'Data Ingresso',
      'Ministérios',
      'Status',
      'Endereço',
      'Escolaridade'
    ];

    const csvData = filteredMembers.map(member => [
      member.name,
      member.email || '',
      member.phone || '',
      getRoleLabel(member.role),
      formatDate(member.date_of_baptism),
      formatDate(member.date_of_joining),
      member.ministries?.join(', ') || '',
      member.is_active ? 'Ativo' : 'Inativo',
      member.address || '',
      member.education || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `membros_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando membros...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle>Membros da Igreja</CardTitle>
          {canExport && (
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="member">Membro</SelectItem>
              <SelectItem value="worker">Obreiro</SelectItem>
              <SelectItem value="pastor">Pastor</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {isMobile ? (
          // Mobile Cards Layout
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <MobileTableCard
                key={member.id}
                title={member.name}
                subtitle={member.email || member.phone || 'Sem contato'}
                status={{
                  label: member.is_active ? 'Ativo' : 'Inativo',
                  variant: member.is_active ? 'default' : 'destructive'
                }}
                fields={[
                  {
                    label: 'Função',
                    value: (
                      <Badge variant={member.role === 'pastor' ? 'default' : 'secondary'}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    )
                  },
                  {
                    label: 'Ministérios',
                    value: member.ministries?.length ? (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {member.ministries.slice(0, 2).map((ministry) => (
                          <Badge key={ministry} variant="outline" className="text-xs">
                            {ministry}
                          </Badge>
                        ))}
                        {member.ministries.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.ministries.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : 'Nenhum'
                  },
                  {
                    label: 'Data Ingresso',
                    value: formatDate(member.date_of_joining)
                  }
                ]}
                actions={canEdit ? [
                  {
                    label: 'Editar',
                    icon: <Edit className="h-3 w-3" />,
                    onClick: () => onEditMember(member),
                    variant: 'outline'
                  }
                ] : []}
              />
            ))}
            {filteredMembers.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum membro encontrado
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Desktop Table Layout
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Ministérios</TableHead>
                  <TableHead>Data Ingresso</TableHead>
                  <TableHead>Status</TableHead>
                  {canEdit && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {member.email && (
                          <div className="text-sm text-gray-600">{member.email}</div>
                        )}
                        {member.phone && (
                          <div className="text-sm text-gray-600">{member.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'pastor' ? 'default' : 'secondary'}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.ministries?.slice(0, 2).map((ministry) => (
                          <Badge key={ministry} variant="outline" className="text-xs">
                            {ministry}
                          </Badge>
                        ))}
                        {member.ministries && member.ministries.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.ministries.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(member.date_of_joining)}</TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? 'default' : 'destructive'}>
                        {member.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditMember(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-8 text-gray-500">
                      Nenhum membro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemberTable;
