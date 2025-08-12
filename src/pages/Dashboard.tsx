
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, TrendingUp, CheckCircle, Clock, Send, Bell, ArrowUpRight, Activity, Plus, FileText, BarChart3, Book } from 'lucide-react';
import { useFinancialStats } from '@/hooks/useFinancialData';
import { useMemberStats } from '@/hooks/useMemberData';
import { useReconciliationStats } from '@/hooks/useReconciliationStats';
import { useEvents } from '@/hooks/useEventData';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDashboardCard, MobileDashboardGrid, MobileQuickAction } from '@/components/ui/mobile-dashboard';
import { MobileChartCard } from '@/components/ui/mobile-chart';
import FinancialChart from '@/components/dashboard/FinancialChart';
import MemberChart from '@/components/dashboard/MemberChart';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

const Dashboard = () => {
  const { userAccessProfile, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canViewModule } = usePermissions();
  const { data: financialStats, isLoading: financialLoading } = useFinancialStats();
  const { data: memberStats, isLoading: memberLoading } = useMemberStats();
  const { data: reconciliationStats, isLoading: reconciliationLoading } = useReconciliationStats();
  const { data: events, isLoading: eventsLoading } = useEvents();

  console.log('Dashboard - Estado de carregamento:', {
    authLoading: loading,
    userProfile: userAccessProfile,
    financialLoading,
    memberLoading,
    reconciliationLoading,
    eventsLoading
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const handleCardClick = (route: string) => {
    window.open(route, '_blank');
  };

  // Calculate stats - totalIncome now includes reconciliations
  const generalMonthlyRevenue = financialStats?.totalIncome || 0;
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

  // Loading state apenas para auth essencial
  if (loading) {
    console.log('Dashboard - Aguardando autenticação...');
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando autenticação...</p>
        </div>
      </Layout>
    );
  }

  // Para dados específicos, renderizar com loading parcial
  if (financialLoading || memberLoading || reconciliationLoading || eventsLoading) {
    console.log('Dashboard - Dados específicos carregando, renderizando parcialmente...');
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
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <div className="h-2 w-8 bg-muted rounded overflow-hidden">
              <div className={`h-full ${color.includes('red') ? 'bg-destructive' : 'bg-primary'} rounded`} style={{width: '60%'}}></div>
            </div>
          )}
          <Icon className={`h-4 w-4 ${color} group-hover:scale-110 transition-transform`} />
          <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
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
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Dashboard
          </h1>
          <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-sm' : ''}`}>
            Bem-vindo ao sistema de gestão da igreja
          </p>
        </div>

        {/* Quick Actions Mobile */}
        {isMobile && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Ações Rápidas</h2>
            <div className="space-y-2">
              {canViewModule('membros') && (
                <MobileQuickAction
                  title="Novo Membro"
                  description="Cadastrar novo membro"
                  icon={Plus}
                  onClick={() => navigate('/membros')}
                />
              )}
              {canViewModule('financeiro') && (
                <MobileQuickAction
                  title="Lançamento Financeiro"
                  description="Registrar receita ou despesa"
                  icon={DollarSign}
                  onClick={() => navigate('/financeiro')}
                />
              )}
              {canViewModule('eventos') && (
                <MobileQuickAction
                  title="Novo Evento"
                  description="Criar evento da igreja"
                  icon={Calendar}
                  onClick={() => navigate('/eventos')}
                />
              )}
              <MobileQuickAction
                title="Documentação"
                description="Acessar documentação do sistema"
                icon={Book}
                onClick={() => navigate('/documentacao')}
              />
            </div>
          </section>
        )}

        {/* Financial Section */}
        {canViewModule('financeiro') && (
          <section>
            <h2 className={`font-semibold text-foreground mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
              💰 Financeiro
            </h2>
            <MobileDashboardGrid>
              <MobileDashboardCard
                title="Receita do Mês"
                value={formatCurrency(financialStats?.totalIncome || 0)}
                description={`${financialStats?.thisMonthRecords || 0} registros`}
                icon={DollarSign}
                trend={{ value: 12, isPositive: true }}
                onClick={() => navigate('/financeiro')}
              />
              <MobileDashboardCard
                title="Saldo Atual"
                value={formatCurrency(financialStats?.balance || 0)}
                description="Receitas - Despesas"
                icon={TrendingUp}
                trend={{ 
                  value: 5, 
                  isPositive: (financialStats?.balance || 0) >= 0 
                }}
                onClick={() => navigate('/financeiro')}
              />
              <MobileDashboardCard
                title="Conciliações Aprovadas"
                value={reconciliationStats?.approvedThisMonth?.toString() || '0'}
                description={formatCurrency(reconciliationStats?.totalApprovedAmount || 0)}
                icon={CheckCircle}
                trend={{ value: 8, isPositive: true }}
                onClick={() => navigate('/conciliacoes')}
              />
              <MobileDashboardCard
                title="Pendentes"
                value={reconciliationStats?.pendingThisMonth?.toString() || '0'}
                description={formatCurrency(reconciliationStats?.totalPendingAmount || 0)}
                icon={Clock}
                badge={{ text: 'Atenção', variant: 'secondary' }}
                onClick={() => navigate('/conciliacoes')}
              />
            </MobileDashboardGrid>
          </section>
        )}

        {/* Members Section */}
        {canViewModule('membros') && (
          <section>
            <h2 className={`font-semibold text-foreground mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
              👥 Membros
            </h2>
            <MobileDashboardGrid>
              <MobileDashboardCard
                title="Membros Ativos"
                value={memberStats?.activeMembers?.toString() || '0'}
                description="Total ativo"
                icon={Users}
                trend={{ value: 4, isPositive: true }}
                onClick={() => navigate('/membros')}
              />
              <MobileDashboardCard
                title="Total de Membros"
                value={memberStats?.totalMembers?.toString() || '0'}
                description="Cadastrados no sistema"
                icon={Users}
                trend={{ value: 2, isPositive: true }}
                onClick={() => navigate('/membros')}
              />
              <MobileDashboardCard
                title="Novos Membros"
                value="8"
                description="Últimos 30 dias"
                icon={Users}
                trend={{ value: 15, isPositive: true }}
                badge={{ text: 'Novo', variant: 'default' }}
                onClick={() => navigate('/membros')}
              />
            </MobileDashboardGrid>
          </section>
        )}

        {/* Events Section */}
        {canViewModule('eventos') && (
          <section>
            <h2 className={`font-semibold text-foreground mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
              📅 Eventos
            </h2>
            <MobileDashboardGrid>
              <MobileDashboardCard
                title="Próximo Evento"
                value={upcomingEvent?.title || 'Nenhum'}
                description={upcomingEvent ? new Date(upcomingEvent.date).toLocaleDateString('pt-BR') : 'Nenhum agendado'}
                icon={Calendar}
                onClick={() => navigate('/eventos')}
                size="lg"
              />
              <MobileDashboardCard
                title="Eventos do Mês"
                value={thisMonthEvents.toString()}
                description="Programados"
                icon={Calendar}
                trend={{ value: 3, isPositive: true }}
                onClick={() => navigate('/eventos')}
              />
            </MobileDashboardGrid>
          </section>
        )}

        {/* Notifications Section */}
        {canViewModule('notificacoes') && (
          <section>
            <h2 className={`font-semibold text-foreground mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
              🔔 Notificações
            </h2>
            <MobileDashboardGrid>
              <MobileDashboardCard
                title="Mensagens Enviadas"
                value={notificationStats.sentThisMonth.toString()}
                description="Este mês"
                icon={Send}
                trend={{ value: 20, isPositive: true }}
                onClick={() => navigate('/notificacoes')}
              />
              <MobileDashboardCard
                title="Agendadas"
                value={notificationStats.scheduled.toString()}
                description="Aguardando envio"
                icon={Bell}
                badge={{ text: 'Pendente', variant: 'outline' }}
                onClick={() => navigate('/notificacoes/agendadas')}
              />
            </MobileDashboardGrid>
          </section>
        )}

        {/* System Section */}
        <section>
          <h2 className={`font-semibold text-foreground mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
            ⚙️ Sistema
          </h2>
          <MobileDashboardGrid>
            <MobileDashboardCard
              title="Documentação"
              value="Completa"
              description="Guia de uso do sistema"
              icon={Book}
              onClick={() => navigate('/documentacao')}
              size="lg"
            />
            {canViewModule('relatorios') && (
              <MobileDashboardCard
                title="Relatórios"
                value="Disponível"
                description="Relatórios do sistema"
                icon={BarChart3}
                onClick={() => navigate('/relatorios')}
              />
            )}
          </MobileDashboardGrid>
        </section>

        {/* Charts Section */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {canViewModule('financeiro') && financialStats && (
            <MobileChartCard
              title="Resumo Financeiro"
              description="Distribuição por categoria"
              data={Object.entries(financialStats.categoryData || {}).map(([category, amount]) => ({
                name: category,
                value: Number(amount)
              }))}
              type="pie"
              height={isMobile ? 180 : 250}
            />
          )}
          
          {canViewModule('membros') && memberStats && (
            <MobileChartCard
              title="Membros por Função"
              data={[
                { name: 'Membros', value: memberStats.regularMembers },
                { name: 'Obreiros', value: memberStats.workers },
                { name: 'Pastores', value: memberStats.pastors }
              ].filter(item => item.value > 0)}
              type="bar"
              height={isMobile ? 180 : 250}
            />
          )}
        </div>

        {/* Recent Activities */}
        <section>
          <h2 className={`font-semibold text-foreground mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}>
            🕓 Atividades Recentes
          </h2>
          <Card>
            <CardContent className={isMobile ? 'p-4' : 'p-6'}>
              <div className="space-y-3">
                {recentActivities.slice(0, isMobile ? 3 : 5).map((activity, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg`}>
                    <Activity className={`text-muted-foreground ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {activity}
                    </span>
                    <span className={`text-muted-foreground/70 ml-auto ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      há {Math.floor(Math.random() * 24) + 1}h
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Dashboard;
