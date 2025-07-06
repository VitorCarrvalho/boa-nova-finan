
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';

const ExportControls = () => {
  const handleExportCSV = () => {
    // TODO: Implement CSV export functionality
    console.log('Exporting to CSV...');
    
    // Mock CSV data structure
    const csvHeaders = [
      'Congregação',
      'Janeiro', 'Janeiro (%)',
      'Fevereiro', 'Fevereiro (%)',
      'Março', 'Março (%)',
      'Abril', 'Abril (%)',
      'Maio', 'Maio (%)',
      'Junho', 'Junho (%)'
    ];
    
    const csvData = [
      ['Sede', '15000', '0%', '18000', '20%', '16000', '-11%', '20000', '25%', '17500', '-12.5%', '19000', '8.6%'],
      ['Congregação 1', '8000', '0%', '9500', '18.8%', '7800', '-17.9%', '10200', '30.8%', '8900', '-12.7%', '9800', '10.1%'],
      ['Congregação 2', '12000', '0%', '11000', '-8.3%', '13500', '22.7%', '12800', '-5.2%', '14200', '10.9%', '13000', '-8.5%']
    ];
    
    // Create CSV content
    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_conciliacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportação de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button 
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Formato do CSV:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Linhas: Congregações</li>
            <li>• Colunas: Meses com valores e % de crescimento</li>
            <li>• Dados agrupados (não registros individuais)</li>
            <li>• Histórico dos últimos 6 meses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportControls;
