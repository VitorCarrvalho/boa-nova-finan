
import React from 'react';
import { SupplierTotal } from '../types/SupplierPaymentTypes';

interface SupplierTotalsSummaryProps {
  supplierTotals: Record<string, SupplierTotal>;
}

const SupplierTotalsSummary = ({ supplierTotals }: SupplierTotalsSummaryProps) => {
  if (Object.keys(supplierTotals).length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-3">Totais por Fornecedor</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(supplierTotals).map(([supplierId, data]) => (
          <div key={supplierId} className="bg-white p-3 rounded border">
            <div className="font-medium">{data.name}</div>
            <div className="text-sm text-gray-600">{data.count} pagamentos</div>
            <div className="font-bold text-blue-600">
              R$ {data.total.toFixed(2).replace('.', ',')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierTotalsSummary;
