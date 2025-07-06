
import React, { useState } from 'react';
import { useCongregations } from '@/hooks/useCongregationData';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSupplierPayments } from './hooks/useSupplierPayments';
import { SupplierPaymentFilters } from './types/SupplierPaymentTypes';
import SupplierPaymentFiltersComponent from './components/SupplierPaymentFilters';
import SupplierTotalsSummary from './components/SupplierTotalsSummary';
import SupplierPaymentsTable from './components/SupplierPaymentsTable';
import { filterPayments, calculateSupplierTotals, exportToCSV } from './utils/supplierPaymentUtils';

const PaymentsToSuppliers = () => {
  const { data: congregations } = useCongregations();
  const { data: supplierPayments, isLoading } = useSupplierPayments();
  
  const [filters, setFilters] = useState<SupplierPaymentFilters>({
    congregationId: 'all',
    startDate: '',
    endDate: '',
    paymentMethod: 'all'
  });

  const filteredPayments = supplierPayments ? filterPayments(supplierPayments, filters) : [];
  const supplierTotals = calculateSupplierTotals(filteredPayments);

  const handleExportCSV = () => {
    exportToCSV(filteredPayments, congregations || []);
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <SupplierTotalsSummary supplierTotals={supplierTotals} />
      
      <SupplierPaymentFiltersComponent 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      <div className="flex justify-end">
        <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <SupplierPaymentsTable payments={filteredPayments} />
    </div>
  );
};

export default PaymentsToSuppliers;
