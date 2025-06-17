
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFinancialStats } from '@/hooks/useFinancialData';

const chartConfig = {
  amount: {
    label: "Valor",
  },
};

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const FinancialChart = () => {
  const { data: stats } = useFinancialStats();

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Carregando gráficos...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryChartData = Object.entries(stats.categoryData).map(([category, amount]) => ({
    category,
    amount: Number(amount),
    name: getCategoryLabel(category)
  }));

  function getCategoryLabel(category: string) {
    const labels = {
      tithe: 'Dízimo',
      offering: 'Oferta',
      online_offering: 'Oferta Online',
      vow_offering: 'Oferta de Votos',
      event: 'Evento',
      debt_paid: 'Dívida Paga',
      salary: 'Salário',
      maintenance: 'Manutenção',
      supplier: 'Fornecedor',
      project: 'Projeto',
      utility: 'Utilidade'
    };
    return labels[category as keyof typeof labels] || category;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Valores por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
                  />} 
                />
                <Bar dataKey="amount" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="amount"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [formatCurrency(Number(value)), "Valor"]}
                  />} 
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialChart;
