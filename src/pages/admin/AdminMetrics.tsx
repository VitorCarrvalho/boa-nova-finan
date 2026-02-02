import React, { useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Database, 
  Activity,
  Calendar
} from 'lucide-react';
import { useTenantMetrics } from '@/hooks/useTenantMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const AdminMetrics = () => {
  const [period, setPeriod] = useState('30d');
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  
  const { 
    userMetrics, 
    dataMetrics, 
    activityMetrics, 
    tenantsList,
    loading 
  } = useTenantMetrics(period, selectedTenant);

  const statCards = [
    {
      title: 'Total de Usuários',
      value: userMetrics.totalUsers,
      description: `${userMetrics.activeUsers} ativos (30 dias)`,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Membros Cadastrados',
      value: dataMetrics.totalMembers,
      description: 'Em todos os tenants',
      icon: Database,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Eventos Criados',
      value: dataMetrics.totalEvents,
      description: 'Ativos na plataforma',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Conciliações',
      value: activityMetrics.reconciliationsThisMonth,
      description: 'Este mês',
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Métricas de Uso
            </h1>
            <p className="text-slate-400 mt-1">Acompanhe o uso da plataforma por tenant</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedTenant || 'all'} onValueChange={(v) => setSelectedTenant(v === 'all' ? null : v)}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Todos os tenants" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-white hover:bg-slate-700">Todos os tenants</SelectItem>
                {tenantsList.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id} className="text-white hover:bg-slate-700">
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="7d" className="text-white hover:bg-slate-700">7 dias</SelectItem>
                <SelectItem value="30d" className="text-white hover:bg-slate-700">30 dias</SelectItem>
                <SelectItem value="90d" className="text-white hover:bg-slate-700">90 dias</SelectItem>
                <SelectItem value="12m" className="text-white hover:bg-slate-700">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                    <div className="text-2xl font-bold text-white">{stat.value.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Tenant */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Usuários por Tenant</CardTitle>
              <CardDescription className="text-slate-400">Top 10 tenants por número de usuários</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full bg-slate-800" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userMetrics.usersByTenant} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        stroke="#64748b" 
                        fontSize={11}
                        width={100}
                        tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Over Time */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Atividade ao Longo do Tempo</CardTitle>
              <CardDescription className="text-slate-400">Logins e ações na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full bg-slate-800" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityMetrics.activityOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="logins" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="actions" 
                        stackId="2"
                        stroke="#8b5cf6" 
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Metrics */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Dados Armazenados por Tenant</CardTitle>
            <CardDescription className="text-slate-400">Quantidade de registros em cada módulo</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full bg-slate-800" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataMetrics.dataByTenant}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="members" name="Membros" fill="#3b82f6" />
                    <Bar dataKey="events" name="Eventos" fill="#8b5cf6" />
                    <Bar dataKey="financial" name="Financeiro" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AdminMetrics;
