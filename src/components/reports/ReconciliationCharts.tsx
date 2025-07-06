
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

// Mock data - in real implementation, this would come from useQuery
const mockData = [
  { month: 'Jan', sede: 15000, congregacao1: 8000, congregacao2: 12000 },
  { month: 'Fev', sede: 18000, congregacao1: 9500, congregacao2: 11000 },
  { month: 'Mar', sede: 16000, congregacao1: 7800, congregacao2: 13500 },
  { month: 'Abr', sede: 20000, congregacao1: 10200, congregacao2: 12800 },
  { month: 'Mai', sede: 17500, congregacao1: 8900, congregacao2: 14200 },
  { month: 'Jun', sede: 19000, congregacao1: 9800, congregacao2: 13000 }
];

const ReconciliationCharts = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatCurrency(entry.value)}`}
              {/* TODO: Add percentage variation calculation */}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Gráfico de Colunas - Por Mês e Congregação</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="sede" fill="#dc2626" name="Sede" />
            <Bar dataKey="congregacao1" fill="#16a34a" name="Congregação 1" />
            <Bar dataKey="congregacao2" fill="#2563eb" name="Congregação 2" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Gráfico de Linha - Histórico por Congregação</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="sede" stroke="#dc2626" strokeWidth={2} name="Sede" />
            <Line type="monotone" dataKey="congregacao1" stroke="#16a34a" strokeWidth={2} name="Congregação 1" />
            <Line type="monotone" dataKey="congregacao2" stroke="#2563eb" strokeWidth={2} name="Congregação 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReconciliationCharts;
