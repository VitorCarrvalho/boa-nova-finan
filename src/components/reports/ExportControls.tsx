
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet } from 'lucide-react';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { toast } from '@/hooks/use-toast';

const ExportControls = () => {
  const { data: reconciliations } = useReconciliations();
  const { data: congregations } = useCongregations();

  const handleExportCSV = () => {
    if (!reconciliations || !congregations) {
      toast({
        title: 'Erro',
        description: 'Dados não disponíveis para exportação.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Exporting real data to CSV...');
    
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ key: monthKey, label: monthLabel });
    }

    // Process data by congregation and month
    const csvData: string[][] = [];
    const csvHeaders = ['Congregação', ...months.flatMap(m => [m.label, `${m.label} (%)`])];
    csvData.push(csvHeaders);

    congregations.forEach(congregation => {
      const row = [congregation.name];
      let previousValue = 0;

      months.forEach((month, monthIndex) => {
        const monthlyTotal = reconciliations
          .filter(rec => 
            rec.status === 'approved' && 
            rec.congregation_id === congregation.id &&
            rec.month.startsWith(month.key)
          )
          .reduce((sum, rec) => sum + Number(rec.total_income || 0), 0);

        row.push(monthlyTotal.toString());

        // Calculate percentage change
        let percentageChange = '0%';
        if (monthIndex > 0 && previousValue > 0) {
          const change = ((monthlyTotal - previousValue) / previousValue) * 100;
          percentageChange = `${change.toFixed(1)}%`;
        } else if (monthIndex === 0) {
          percentageChange = '0%';
        }
        
        row.push(percentageChange);
        previousValue = monthlyTotal;
      });

      csvData.push(row);
    });
    
    // Create CSV content
    const csvContent = csvData
      .map(row => row.map(cell => `"${cell}"`).join(','))
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

    toast({
      title: 'Exportação concluída',
      description: 'O arquivo CSV foi baixado com sucesso.',
    });
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
          
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Formato do CSV:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Linhas: Congregações registradas no sistema</li>
            <li>• Colunas: Últimos 6 meses com valores e % de crescimento</li>
            <li>• Dados das conciliações aprovadas</li>
            <li>• Valores reais do banco de dados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportControls;
