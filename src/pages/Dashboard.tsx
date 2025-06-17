
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { useFinancialStats } from '@/hooks/useFinancialData';
import FinancialChart from '@/components/dashboard/FinancialChart';

const Dashboard = () => {
  const { userRole } = useAuth();
  const { data: stats, isLoading } = useFinancialStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Receita do Mês',
      value: stats ? formatCurrency(stats.totalIncome) : 'R$ 0,00',
      icon: DollarSign,
      color: 'text-green-600',
      description: `${stats?.thisMonthRecords || 0} registros este mês`
    },
    {
      title: 'Saldo Disponível',
      value: stats ? formatCurrency(stats.balance) : 'R$ 0,00',
      icon: TrendingUp,
      color: stats && stats.balance >= 0 ? 'text-green-600' : 'text-red-600',
      description: 'Receitas - Despesas'
    },
    {
      title: 'Total de Registros',
      value: stats?.totalRecords || '0',
      icon: Calendar,
      color: 'text-blue-600',
      description: 'Registros financeiros'
    },
    {
      title: 'Gastos do Mês',
      value: stats ? formatCurrency(stats.totalExpense) : 'R$ 0,00',
      icon: Users,
      color: 'text-red-600',
      description: 'Despesas registradas'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao sistema de gestão da igreja
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {(userRole === 'superadmin' || userRole === 'admin' || userRole === 'finance') && (
              <FinancialChart />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>
                    Últimas ações realizadas no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Funcionalidade em desenvolvimento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>
                    Eventos programados para os próximos dias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Funcionalidade em desenvolvimento
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
