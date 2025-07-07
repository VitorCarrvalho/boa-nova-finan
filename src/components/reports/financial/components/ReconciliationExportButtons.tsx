
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface ReconciliationExportButtonsProps {
  canDownloadPDF: boolean;
  onGeneratePDF: () => void;
  onExportCSV: () => void;
}

const ReconciliationExportButtons = ({ canDownloadPDF, onGeneratePDF, onExportCSV }: ReconciliationExportButtonsProps) => {
  return (
    <div className="flex justify-end space-x-2">
      {canDownloadPDF && (
        <Button onClick={onGeneratePDF} className="bg-red-600 hover:bg-red-700">
          <FileText className="mr-2 h-4 w-4" />
          Relatório Comparativo (PDF)
        </Button>
      )}
      <Button onClick={onExportCSV} className="bg-green-600 hover:bg-green-700">
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </Button>
    </div>
  );
};

export default ReconciliationExportButtons;
