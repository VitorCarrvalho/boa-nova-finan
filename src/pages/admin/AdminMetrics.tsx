import React, { useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      color: 'from-primary to-primary/80',
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
      color: 'from-secondary to-secondary/80',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Métricas de Uso
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe o uso da plataforma por tenant</p>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedTenant || 'all'} onValueChange={(v) => setSelectedTenant(v === 'all' ? null : v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tenants</SelectItem>
                {tenantsList.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="12m">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Usuários por Tenant</CardTitle>
              <CardDescription>Top 10 tenants por número de usuários</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userMetrics.usersByTenant} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-muted-foreground" fontSize={12} />
                      <YAxis 
                        dataKey="name" type="category" className="text-muted-foreground" fontSize={11} width={100}
                        tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                      />
                      <Tooltip />
                      <Bar dataKey="users" fill="hsl(217, 91%, 45%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Atividade ao Longo do Tempo</CardTitle>
              <CardDescription>Logins e ações na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityMetrics.activityOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                      <YAxis className="text-muted-foreground" fontSize={12} />
                      <Tooltip />
                      <Area type="monotone" dataKey="logins" stackId="1" stroke="hsl(217, 91%, 45%)" fill="hsl(217, 91%, 45%)" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="actions" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Dados Armazenados por Tenant</CardTitle>
            <CardDescription>Quantidade de registros em cada módulo</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataMetrics.dataByTenant}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-muted-foreground" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis className="text-muted-foreground" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="members" name="Membros" fill="hsl(217, 91%, 45%)" />
                    <Bar dataKey="events" name="Eventos" fill="#8b5cf6" />
                    <Bar dataKey="financial" name="Financeiro" fill="hsl(35, 92%, 50%)" />
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
