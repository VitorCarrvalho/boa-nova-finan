
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useReconciliationExports = (
  reconciliations: any[], 
  congregations: any[], 
  user: any
) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date();
    
    // Header
    doc.setFontSize(16);
    doc.text('Relatório Comparativo de Conciliações por Congregação', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Usuário: ${user?.name || user?.email || 'N/A'}`, 20, 35);
    doc.text(`Data/Hora: ${format(currentDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 42);
    doc.text('Período: Últimos 6 meses', 20, 49);

    // Generate table data for last 6 months
    if (!reconciliations || !congregations || congregations.length === 0) {
      doc.setFontSize(12);
      doc.text('Nenhum dado disponível para gerar o relatório.', 20, 70);
      doc.save('relatorio-comparativo-conciliacoes.pdf');
      return;
    }

    // Generate months array (last 6 months)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: format(date, 'yyyy-MM'),
        label: format(date, 'MMM yyyy', { locale: ptBR })
      });
    }

    // Generate table data
    const tableData = congregations.map(congregation => {
      const row = [congregation.name];
      let previousValue = null;

      months.forEach((month, index) => {
        const reconciliation = reconciliations.find(rec => 
          rec.congregation_id === congregation.id &&
          format(new Date(rec.month), 'yyyy-MM') === month.key &&
          rec.status === 'approved'
        );

        const currentValue = reconciliation ? Number(reconciliation.total_income) || 0 : null;
        
        if (currentValue !== null) {
          const valueStr = `R$ ${currentValue.toFixed(2).replace('.', ',')}`;
          
          // Calculate growth percentage if we have both current and previous values
          if (index > 0 && previousValue !== null && previousValue > 0) {
            const growth = ((currentValue - previousValue) / previousValue) * 100;
            const growthStr = growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
            row.push(`${valueStr} (${growthStr})`);
          } else {
            row.push(valueStr);
          }
          
          previousValue = currentValue;
        } else {
          // No data for this month
          row.push('');
          // Don't update previousValue if current month has no data
        }
      });

      return row;
    });

    const headers = ['Congregação', ...months.map(m => m.label)];
    
    // Use autoTable to create the table - correct usage
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 60,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [220, 53, 69],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Congregation name column
      },
      margin: { top: 60, left: 20, right: 20 },
      tableWidth: 'auto',
      theme: 'striped'
    });

    // Save the PDF
    doc.save('relatorio-comparativo-conciliacoes.pdf');
  };

  const exportToCSV = (filteredReconciliations: any[]) => {
    const headers = [
      'Mês',
      'Congregação',
      'Status',
      'Receita Total',
      'Valor a Enviar',
      'Data de Envio'
    ];

    const csvData = filteredReconciliations.map(rec => [
      format(new Date(rec.month), 'MM/yyyy', { locale: ptBR }),
      congregations?.find(c => c.id === rec.congregation_id)?.name || 'N/A',
      rec.status === 'approved' ? 'Aprovado' : rec.status === 'pending' ? 'Pendente' : rec.status,
      `R$ ${rec.total_income.toFixed(2).replace('.', ',')}`,
      `R$ ${rec.amount_to_send.toFixed(2).replace('.', ',')}`,
      rec.sent_date ? format(new Date(rec.sent_date), 'dd/MM/yyyy', { locale: ptBR }) : '-'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'conciliacoes-submissoes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { generatePDF, exportToCSV };
};
