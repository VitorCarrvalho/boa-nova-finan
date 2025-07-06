
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useFinancialStats } from '@/hooks/useFinancialData';
import { useMemberStats } from '@/hooks/useMemberData';
import { useReconciliationStats } from '@/hooks/useReconciliationStats';
import FinancialChart from '@/components/dashboard/FinancialChart';
import MemberChart from '@/components/dashboard/MemberChart';

const Dashboard = () => {
  const { userRole } = useAuth();
  const { data: financialStats, isLoading: financialLoading } = useFinancialStats();
  const { data: memberStats, isLoading: memberLoading } = useMemberStats();
  const { data: reconciliationStats, isLoading: reconciliationLoading } = useReconciliationStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Calculate general monthly revenue (sede + approved reconciliations)
  const generalMonthlyRevenue = (financialStats?.totalIncome || 0) + (reconciliationStats?.totalApprovedAmount || 0);

  const statsCards = [
    {
      title: 'Receita do Mês',
      value: financialStats ? formatCurrency(financialStats.totalIncome) : 'R$ 0,00',
      icon: DollarSign,
      color: 'text-green-600',
      description: `${financialStats?.thisMonthRecords || 0} registros este mês`,
      show: ['superadmin', 'admin', 'finance'].includes(userRole || '')
    },
    {
      title: 'Saldo Disponível',
      value: financialStats ? formatCurrency(financialStats.balance) : 'R$ 0,00',
      icon: TrendingUp,
      color: financialStats && financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600',
      description: 'Receitas - Despesas',
      show: ['superadmin', 'admin', 'finance'].includes(userRole || '')
    },
    {
      title: 'Conciliações Aprovadas',
      value: reconciliationStats?.approvedThisMonth || '0',
      icon: CheckCircle,
      color: 'text-green-600',
      description: `${formatCurrency(reconciliationStats?.totalApprovedAmount || 0)} em valores`,
      show: ['superadmin', 'admin', 'finance', 'pastor'].includes(userRole || '')
    },
    {
      title: 'Conciliações Pendentes',
      value: reconciliationStats?.pendingThisMonth || '0',
      icon: Clock,
      color: 'text-yellow-600',
      description: `${formatCurrency(reconciliationStats?.totalPendingAmount || 0)} aguardando`,
      show: ['superadmin', 'admin', 'finance', 'pastor'].includes(userRole || '')
    },
    {
      title: 'Receita Geral do Mês',
      value: formatCurrency(generalMonthlyRevenue),
      icon: TrendingUp,
      color: 'text-blue-600',
      description: 'Sede + Conciliações Aprovadas',
      show: ['superadmin', 'admin', 'finance'].includes(userRole || '')
    },
    {
      title: 'Total de Membros',
      value: memberStats?.totalMembers || '0',
      icon: Users,
      color: 'text-blue-600',
      description: 'Membros cadastrados',
      show: true
    },
    {
      title: 'Membros Ativos',
      value: memberStats?.activeMembers || '0',
      icon: Calendar,
      color: 'text-green-600',
      description: 'Membros ativos',
      show: true
    }
  ];

  const visibleStats = statsCards.filter(stat => stat.show);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao sistema de gestão da igreja
          </p>
        </div>

        {(financialLoading || memberLoading || reconciliationLoading) ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando dados...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleStats.map((stat, index) => {
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

            <MemberChart />

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
