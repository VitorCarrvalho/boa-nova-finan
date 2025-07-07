
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReconciliationFiltersProps {
  filters: {
    congregationId: string;
    status: string;
    period: string;
  };
  onFiltersChange: (filters: any) => void;
  congregations?: Array<{ id: string; name: string }>;
}

const ReconciliationFilters = ({ filters, onFiltersChange, congregations }: ReconciliationFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <Label htmlFor="congregation">Congregação</Label>
        <Select value={filters.congregationId} onValueChange={(value) => 
          onFiltersChange(prev => ({ ...prev, congregationId: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {congregations?.map(congregation => (
              <SelectItem key={congregation.id} value={congregation.id}>
                {congregation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={filters.status} onValueChange={(value) => 
          onFiltersChange(prev => ({ ...prev, status: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="period">Período</Label>
        <Select value={filters.period} onValueChange={(value) => 
          onFiltersChange(prev => ({ ...prev, period: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-3-months">Últimos 3 meses</SelectItem>
            <SelectItem value="last-6-months">Últimos 6 meses</SelectItem>
            <SelectItem value="last-12-months">Últimos 12 meses</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReconciliationFilters;
