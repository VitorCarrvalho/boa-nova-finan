
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, TrendingUp, CheckCircle, Clock, Send, Bell, ArrowUpRight, Activity } from 'lucide-react';
import { useFinancialStats } from '@/hooks/useFinancialData';
import { useMemberStats } from '@/hooks/useMemberData';
import { useReconciliationStats } from '@/hooks/useReconciliationStats';
import { useEvents } from '@/hooks/useEventData';
import FinancialChart from '@/components/dashboard/FinancialChart';
import MemberChart from '@/components/dashboard/MemberChart';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

const Dashboard = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const { canViewModule } = usePermissions();
  const { data: financialStats, isLoading: financialLoading } = useFinancialStats();
  const { data: memberStats, isLoading: memberLoading } = useMemberStats();
  const { data: reconciliationStats, isLoading: reconciliationLoading } = useReconciliationStats();
  const { data: events, isLoading: eventsLoading } = useEvents();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleCardClick = (route: string) => {
    window.open(route, '_blank');
  };

  // Calculate stats
  const generalMonthlyRevenue = (financialStats?.totalIncome || 0) + (reconciliationStats?.totalApprovedAmount || 0);
  const upcomingEvent = events?.find(event => new Date(event.date) > new Date());
  const thisMonthEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length || 0;

  // Mock data for notifications and recent activities
  const notificationStats = {
    sentThisMonth: 24,
    scheduled: 3
  };

  const recentActivities = [
    "Vitor Carvalho cadastrou novo membro",
    "Conciliação da Congregação Mesquita aprovada",
    "Evento de Conferência criado",
    "Pagamento a fornecedor registrado",
    "Novo usuário admin adicionado"
  ];

  if (financialLoading || memberLoading || reconciliationLoading || eventsLoading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </Layout>
    );
  }

  const DashboardCard = ({ title, value, icon: Icon, color, description, route, trend }: {
    title: string;
    value: string;
    icon: any;
    color: string;
    description: string;
    route: string;
    trend?: string;
  }) => (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group"
      onClick={() => handleCardClick(route)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <div className="h-2 w-8 bg-gray-200 rounded overflow-hidden">
              <div className={`h-full ${color.includes('red') ? 'bg-red-500' : 'bg-green-500'} rounded`} style={{width: '60%'}}></div>
            </div>
          )}
          <Icon className={`h-4 w-4 ${color} group-hover:scale-110 transition-transform`} />
          <ArrowUpRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-500">
            {description}
          </p>
          {trend && (
            <span className={`text-xs font-medium ${color}`}>
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">{icon}</span>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo ao sistema de gestão da igreja
          </p>
        </div>

        {/* Financial Section */}
        {canViewModule('financeiro') && (
          <section className="bg-white rounded-lg p-6 shadow-sm border">
            <SectionTitle icon="📊" title="Financeiro" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard
                title="Receita do Mês (Sede)"
                value={formatCurrency(financialStats?.totalIncome || 0)}
                icon={DollarSign}
                color="text-green-600"
                description={`${financialStats?.thisMonthRecords || 0} registros`}
                route="/financeiro"
                trend="+12%"
              />
              <DashboardCard
                title="Saldo Atual (Sede)"
                value={formatCurrency(financialStats?.balance || 0)}
                icon={TrendingUp}
                color={financialStats && financialStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}
                description="Receitas - Despesas"
                route="/financeiro"
                trend={financialStats && financialStats.balance >= 0 ? '+5%' : '-3%'}
              />
              <DashboardCard
                title="Conciliações Aprovadas"
                value={reconciliationStats?.approvedThisMonth?.toString() || '0'}
                icon={CheckCircle}
                color="text-green-600"
                description={formatCurrency(reconciliationStats?.totalApprovedAmount || 0)}
                route="/conciliacoes"
                trend="+8%"
              />
              <DashboardCard
                title="Conciliações Pendentes"
                value={reconciliationStats?.pendingThisMonth?.toString() || '0'}
                icon={Clock}
                color="text-yellow-600"
                description={formatCurrency(reconciliationStats?.totalPendingAmount || 0)}
                route="/conciliacoes"
              />
            </div>
          </section>
        )}

        {/* Members Section */}
        {canViewModule('membros') && (
          <section className="bg-white rounded-lg p-6 shadow-sm border">
            <SectionTitle icon="👥" title="Membros" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="Membros Ativos"
                value={memberStats?.activeMembers?.toString() || '0'}
                icon={Users}
                color="text-blue-600"
                description="Total ativo"
                route="/membros"
                trend="+4%"
              />
              <DashboardCard
                title="Total de Membros"
                value={memberStats?.totalMembers?.toString() || '0'}
                icon={Users}
                color="text-gray-600"
                description="Cadastrados no sistema"
                route="/membros"
                trend="+2%"
              />
              <DashboardCard
                title="Novos Membros (30 dias)"
                value="8"
                icon={Users}
                color="text-green-600"
                description="Últimos 30 dias"
                route="/membros"
                trend="+15%"
              />
            </div>
          </section>
        )}

        {/* Notifications Section */}
        {canViewModule('notificacoes') && (
          <section className="bg-white rounded-lg p-6 shadow-sm border">
            <SectionTitle icon="🔔" title="Notificações" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardCard
                title="Mensagens Enviadas"
                value={notificationStats.sentThisMonth.toString()}
                icon={Send}
                color="text-blue-600"
                description="Este mês"
                route="/notificacoes"
                trend="+20%"
              />
              <DashboardCard
                title="Mensagens Agendadas"
                value={notificationStats.scheduled.toString()}
                icon={Bell}
                color="text-purple-600"
                description="Aguardando envio"
                route="/notificacoes/agendadas"
              />
            </div>
          </section>
        )}

        {/* Events Section */}
        {canViewModule('eventos') && (
          <section className="bg-white rounded-lg p-6 shadow-sm border">
            <SectionTitle icon="📅" title="Eventos" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard
                title="Próximo Evento"
                value={upcomingEvent?.title || 'Nenhum'}
                icon={Calendar}
                color="text-indigo-600"
                description={upcomingEvent ? new Date(upcomingEvent.date).toLocaleDateString('pt-BR') : 'Nenhum evento agendado'}
                route="/eventos"
              />
              <DashboardCard
                title="Eventos do Mês"
                value={thisMonthEvents.toString()}
                icon={Calendar}
                color="text-blue-600"
                description="Eventos programados"
                route="/eventos"
                trend="+3%"
              />
              <DashboardCard
                title="Eventos Pendentes"
                value="2"
                icon={Clock}
                color="text-orange-600"
                description="Aguardando aprovação"
                route="/eventos"
              />
            </div>
          </section>
        )}

        {/* Recent Activities Section */}
        <section className="bg-white rounded-lg p-6 shadow-sm border">
          <SectionTitle icon="🕓" title="Atividades Recentes" />
          <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Activity className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{activity}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  há {Math.floor(Math.random() * 24) + 1} horas
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {canViewModule('financeiro') && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Gráfico Financeiro</h3>
              <FinancialChart />
            </div>
          )}
          
          {canViewModule('membros') && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍👩‍👧‍👦 Gráfico de Membros</h3>
              <MemberChart />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
