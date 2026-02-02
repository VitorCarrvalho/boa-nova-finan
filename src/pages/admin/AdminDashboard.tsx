import React from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, CreditCard, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const PLAN_COLORS = {
  free: '#64748b',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
};

const AdminDashboard = () => {
  const { stats, loading, tenantsByPlan, recentActivity, mrrHistory } = useSuperAdminDashboard();

  const statCards = [
    {
      title: 'Total de Tenants',
      value: stats?.totalTenants ?? 0,
      description: `${stats?.activeTenants ?? 0} ativos`,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Usuários na Plataforma',
      value: stats?.totalUsers ?? 0,
      description: `${stats?.activeUsers ?? 0} ativos (30 dias)`,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Receita Mensal (MRR)',
      value: `R$ ${(stats?.mrr ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: `${stats?.paidSubscriptions ?? 0} assinaturas pagas`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Conciliações do Mês',
      value: stats?.reconciliationsThisMonth ?? 0,
      description: 'Processadas este mês',
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Visão geral da plataforma</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24 bg-slate-800" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tenants by Plan */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Tenants por Plano</CardTitle>
              <CardDescription className="text-slate-400">Distribuição dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full bg-slate-800" />
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tenantsByPlan}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {tenantsByPlan.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={PLAN_COLORS[entry.name.toLowerCase() as keyof typeof PLAN_COLORS] || '#64748b'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex justify-center gap-4 mt-4">
                {Object.entries(PLAN_COLORS).map(([plan, color]) => (
                  <div key={plan} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-400 capitalize">{plan}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* MRR Evolution */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Evolução do MRR</CardTitle>
              <CardDescription className="text-slate-400">Receita mensal recorrente</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[250px] w-full bg-slate-800" />
              ) : (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mrrHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748b" 
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tickFormatter={(value) => `R$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'MRR']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Atividade Recente</CardTitle>
            <CardDescription className="text-slate-400">Últimas ações na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-800" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-slate-500 text-center py-8">Nenhuma atividade recente</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'new_tenant' ? 'bg-green-500' :
                        activity.type === 'subscription' ? 'bg-amber-500' :
                        activity.type === 'user' ? 'bg-blue-500' : 'bg-slate-500'
                      }`} />
                      <div>
                        <p className="text-sm text-white">{activity.description}</p>
                        <p className="text-xs text-slate-500">{activity.tenantName}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AdminDashboard;
