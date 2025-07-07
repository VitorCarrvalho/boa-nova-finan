
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReconciliationChartProps {
  chartData: any[];
  congregations?: Array<{ id: string; name: string }>;
}

const ReconciliationChart = ({ chartData, congregations }: ReconciliationChartProps) => {
  const colors = ['#dc2626', '#16a34a', '#2563eb', '#ca8a04', '#9333ea', '#ec4899'];

  return (
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
  );
};

export default ReconciliationChart;
