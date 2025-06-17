
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { userRole } = useAuth();

  const stats = [
    {
      title: 'Receita do Mês',
      value: 'R$ 0,00',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Membros Ativos',
      value: '0',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Eventos do Mês',
      value: '0',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Crescimento',
      value: '0%',
      icon: TrendingUp,
      color: 'text-orange-600'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
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
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
                Nenhuma atividade recente
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
                Nenhum evento programado
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
