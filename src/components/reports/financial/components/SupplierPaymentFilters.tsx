
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuppliers } from '@/hooks/useSupplierData';
import { useCongregations } from '@/hooks/useCongregationData';
import { SupplierPaymentFilters } from '../types/SupplierPaymentTypes';

interface SupplierPaymentFiltersProps {
  filters: SupplierPaymentFilters;
  onFiltersChange: (filters: SupplierPaymentFilters) => void;
}

const SupplierPaymentFiltersComponent = ({ filters, onFiltersChange }: SupplierPaymentFiltersProps) => {
  const { data: suppliers } = useSuppliers();
  const { data: congregations } = useCongregations();

  const updateFilter = (key: keyof SupplierPaymentFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <Label htmlFor="supplier">Fornecedor</Label>
        <Select value={filters.supplierId} onValueChange={(value) => updateFilter('supplierId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {suppliers?.map(supplier => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="congregation">Congregação</Label>
        <Select value={filters.congregationId} onValueChange={(value) => updateFilter('congregationId', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="00000000-0000-0000-0000-000000000100">Sede</SelectItem>
            {congregations?.map(congregation => (
              <SelectItem key={congregation.id} value={congregation.id}>
                {congregation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="startDate">Data Inicial</Label>
        <Input
          id="startDate"
          type="date"
          value={filters.startDate}
          onChange={(e) => updateFilter('startDate', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="endDate">Data Final</Label>
        <Input
          id="endDate"
          type="date"
          value={filters.endDate}
          onChange={(e) => updateFilter('endDate', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="paymentMethod">Método de Pagamento</Label>
        <Select value={filters.paymentMethod} onValueChange={(value) => updateFilter('paymentMethod', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="coin">Moedas</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="debit">Débito</SelectItem>
            <SelectItem value="credit">Crédito</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SupplierPaymentFiltersComponent;
