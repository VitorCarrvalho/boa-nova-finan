
import React from 'react';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';
import ReconciliationFilters from './components/ReconciliationFilters';
import ReconciliationExportButtons from './components/ReconciliationExportButtons';
import ReconciliationChart from './components/ReconciliationChart';
import ReconciliationTable from './components/ReconciliationTable';
import { useReconciliationFilters, useFilteredReconciliations, useChartData } from './hooks/useReconciliationData';
import { useReconciliationExports } from './hooks/useReconciliationExports';

const ReconciliationSubmissions = () => {
  const { user, userRole } = useAuth();
  const { data: reconciliations, isLoading } = useReconciliations();
  const { data: congregations } = useCongregations();
  
  const { filters, setFilters } = useReconciliationFilters();
  const filteredReconciliations = useFilteredReconciliations(reconciliations, filters);
  const chartData = useChartData(reconciliations, congregations);
  const { generatePDF, exportToCSV } = useReconciliationExports(reconciliations, congregations, user);

  const canDownloadPDF = userRole === 'admin' || userRole === 'superadmin';

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ReconciliationFilters 
        filters={filters}
        onFiltersChange={setFilters}
        congregations={congregations}
      />

      {/* Export Buttons */}
      <ReconciliationExportButtons 
        canDownloadPDF={canDownloadPDF}
        onGeneratePDF={generatePDF}
        onExportCSV={() => exportToCSV(filteredReconciliations)}
      />

      {/* Comparative Chart */}
      <ReconciliationChart 
        chartData={chartData}
        congregations={congregations}
      />

      {/* Table */}
      <ReconciliationTable 
        reconciliations={filteredReconciliations}
        congregations={congregations}
      />
    </div>
  );
};

export default ReconciliationSubmissions;
