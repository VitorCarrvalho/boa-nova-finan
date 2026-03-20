
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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { userAccessProfile, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { canViewModule } = usePermissions();
  const { data: financialStats, isLoading: financialLoading } = useFinancialStats();
  const { data: memberStats, isLoading: memberLoading } = useMemberStats();
  const { data: reconciliationStats, isLoading: reconciliationLoading } = useReconciliationStats();
  const { data: events, isLoading: eventsLoading } = useEvents();

  // Fetch real notification stats from DB
  const { data: notificationStats } = useQuery({
    queryKey: ['dashboard-notification-stats'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: sentCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')
        .gte('created_at', startOfMonth.toISOString());

      const { count: scheduledCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      return {
        sentThisMonth: sentCount || 0,
        scheduled: scheduledCount || 0,
      };
    },
  });

  // Calculate new members in last 30 days from memberStats
  const { data: newMembersCount } = useQuery({
    queryKey: ['dashboard-new-members'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      return count || 0;
    },
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

  // Calculate stats
  const generalMonthlyRevenue = financialStats?.totalIncome || 0;
  const upcomingEvent = events?.find(event => new Date(event.date) > new Date());
  const thisMonthEvents = events?.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
  }).length || 0;

  // Loading state apenas para auth essencial
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

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
                onClick={() => navigate('/financeiro')}
              />
              <MobileDashboardCard
                title="Saldo Atual"
                value={formatCurrency(financialStats?.balance || 0)}
                description="Receitas - Despesas"
                icon={TrendingUp}
                onClick={() => navigate('/financeiro')}
              />
              <MobileDashboardCard
                title="Conciliações Aprovadas"
                value={reconciliationStats?.approvedThisMonth?.toString() || '0'}
                description={formatCurrency(reconciliationStats?.totalApprovedAmount || 0)}
                icon={CheckCircle}
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
                onClick={() => navigate('/membros')}
              />
              <MobileDashboardCard
                title="Total de Membros"
                value={memberStats?.totalMembers?.toString() || '0'}
                description="Cadastrados no sistema"
                icon={Users}
                onClick={() => navigate('/membros')}
              />
              <MobileDashboardCard
                title="Novos Membros"
                value={(newMembersCount ?? 0).toString()}
                description="Últimos 30 dias"
                icon={Users}
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
                value={(notificationStats?.sentThisMonth ?? 0).toString()}
                description="Este mês"
                icon={Send}
                onClick={() => navigate('/notificacoes')}
              />
              <MobileDashboardCard
                title="Agendadas"
                value={(notificationStats?.scheduled ?? 0).toString()}
                description="Aguardando envio"
                icon={Bell}
                badge={(notificationStats?.scheduled ?? 0) > 0 ? { text: 'Pendente', variant: 'outline' } : undefined}
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
      </div>
    </Layout>
  );
};

export default Dashboard;
