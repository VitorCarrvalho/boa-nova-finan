import React, { useState } from 'react';
import { useReconciliations } from '@/hooks/useReconciliationData';
import { useCongregations } from '@/hooks/useCongregationData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReconciliationSubmissions = () => {
  const { user, userRole } = useAuth();
  const { data: reconciliations, isLoading } = useReconciliations();
  const { data: congregations } = useCongregations();
  
  const [filters, setFilters] = useState({
    congregationId: 'all',
    status: 'all',
    period: 'last-6-months'
  });

  // Filter reconciliations based on period and congregation
  const getFilteredReconciliations = () => {
    if (!reconciliations) return [];

    let filtered = [...reconciliations];

    // Apply congregation filter
    if (filters.congregationId !== 'all') {
      filtered = filtered.filter(rec => rec.congregation_id === filters.congregationId);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(rec => rec.status === filters.status);
    }

    // Apply period filter
    const now = new Date();
    const monthsBack = filters.period === 'last-3-months' ? 3 : 
                      filters.period === 'last-6-months' ? 6 : 
                      filters.period === 'last-12-months' ? 12 : 0;
    
    if (monthsBack > 0) {
      const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      filtered = filtered.filter(rec => new Date(rec.month) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
  };

  // Generate chart data for last 6 months
  const getChartData = () => {
    if (!reconciliations || !congregations) return [];

    const months = [];
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy', { locale: ptBR });
      months.push({ key: monthKey, label: monthLabel });
    }

    // Initialize data structure
    const chartData = months.map(month => ({
      month: month.label,
      ...congregations.reduce((acc, cong) => {
        acc[cong.name] = 0;
        return acc;
      }, {} as Record<string, number>)
    }));

    // Populate with reconciliation data
    reconciliations
      .filter(rec => rec.status === 'approved')
      .forEach(rec => {
        const monthKey = format(new Date(rec.month), 'MMM yyyy', { locale: ptBR });
        const congregation = congregations.find(c => c.id === rec.congregation_id);
        
        if (congregation) {
          const dataPoint = chartData.find(d => d.month === monthKey);
          if (dataPoint) {
            dataPoint[congregation.name] = Number(rec.total_income);
          }
        }
      });

    return chartData;
  };

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
    if (!reconciliations || !congregations) {
      console.error('No data available for PDF generation');
      return;
    }

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: format(date, 'yyyy-MM'),
        label: format(date, 'MMM yyyy', { locale: ptBR })
      });
    }

    const tableData = congregations.map(congregation => {
      const row = [congregation.name];
      let previousValue = 0;

      months.forEach((month, index) => {
        const reconciliation = reconciliations.find(rec => 
          rec.congregation_id === congregation.id &&
          format(new Date(rec.month), 'yyyy-MM') === month.key &&
          rec.status === 'approved'
        );

        const currentValue = reconciliation ? Number(reconciliation.total_income) : 0;
        const valueStr = `R$ ${currentValue.toFixed(2).replace('.', ',')}`;
        
        if (index > 0 && previousValue > 0) {
          const growth = ((currentValue - previousValue) / previousValue) * 100;
          const growthStr = growth >= 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
          row.push(`${valueStr} (${growthStr})`);
        } else {
          row.push(valueStr);
        }
        
        previousValue = currentValue;
      });

      return row;
    });

    const headers = ['Congregação', ...months.map(m => m.label)];
    
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 53, 69] },
    });

    doc.save('relatorio-comparativo-conciliacoes.pdf');
  };

  const exportToCSV = () => {
    const filteredData = getFilteredReconciliations();
    const headers = [
      'Mês',
      'Congregação',
      'Status',
      'Receita Total',
      'Valor a Enviar',
      'Data de Envio'
    ];

    const csvData = filteredData.map(rec => [
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

  const filteredReconciliations = getFilteredReconciliations();
  const chartData = getChartData();
  const colors = ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#9333ea', '#ec4899'];

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>;
  }

  const canDownloadPDF = userRole === 'admin' || userRole === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="congregation">Congregação</Label>
          <Select value={filters.congregationId} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, congregationId: value }))
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
            setFilters(prev => ({ ...prev, status: value }))
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
            setFilters(prev => ({ ...prev, period: value }))
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

      {/* Export Buttons */}
      <div className="flex justify-end space-x-2">
        {canDownloadPDF && (
          <Button onClick={generatePDF} className="bg-red-600 hover:bg-red-700">
            <FileText className="mr-2 h-4 w-4" />
            Relatório Comparativo (PDF)
          </Button>
        )}
        <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Comparative Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Gráfico Comparativo por Congregação (Últimos 6 Meses)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
            <Tooltip 
              formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, 'Receita']}
            />
            <Legend />
            {congregations?.map((congregation, index) => (
              <Bar 
                key={congregation.id} 
                dataKey={congregation.name} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead>Congregação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receita Total</TableHead>
              <TableHead>Valor a Enviar</TableHead>
              <TableHead>Data de Envio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReconciliations.map((reconciliation) => (
              <TableRow key={reconciliation.id}>
                <TableCell>
                  {format(new Date(reconciliation.month), 'MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  {congregations?.find(c => c.id === reconciliation.congregation_id)?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    reconciliation.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : reconciliation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {reconciliation.status === 'approved' ? 'Aprovado' : 
                     reconciliation.status === 'pending' ? 'Pendente' : 
                     reconciliation.status}
                  </span>
                </TableCell>
                <TableCell className="font-medium">
                  R$ {reconciliation.total_income.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell className="font-medium">
                  R$ {reconciliation.amount_to_send.toFixed(2).replace('.', ',')}
                </TableCell>
                <TableCell>
                  {reconciliation.sent_date 
                    ? format(new Date(reconciliation.sent_date), 'dd/MM/yyyy', { locale: ptBR })
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))}
            {filteredReconciliations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Nenhuma conciliação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReconciliationSubmissions;
