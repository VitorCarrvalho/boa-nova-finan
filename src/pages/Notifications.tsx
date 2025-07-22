
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Send, Video, Bell, Repeat } from 'lucide-react';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const menuItems = [
    {
      title: 'Nova Notificação',
      description: 'Criar uma nova mensagem ou agendamento',
      icon: MessageSquare,
      href: '/notificacoes/nova',
      color: 'bg-blue-500'
    },
    {
      title: 'Mensagens Agendadas',
      description: 'Gerenciar notificações programadas',
      icon: Clock,
      href: '/notificacoes/agendadas',
      color: 'bg-orange-500'
    },
    {
      title: 'Mensagens Recorrentes',
      description: 'Gerenciar envios automáticos',
      icon: Repeat,
      href: '/notificacoes/recorrentes',
      color: 'bg-indigo-500'
    },
    {
      title: 'Histórico Enviado',
      description: 'Visualizar mensagens já enviadas',
      icon: Send,
      href: '/notificacoes/historico',
      color: 'bg-green-500'
    },
    {
      title: 'Biblioteca de Vídeos',
      description: 'Gerenciar vídeos disponíveis',
      icon: Video,
      href: '/notificacoes/videos',
      color: 'bg-purple-500'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificações</h1>
            <p className="text-gray-600">Sistema de notificações via WhatsApp</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                      Acessar →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema de Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Recursos Disponíveis</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Envio de mensagens de texto</li>
                  <li>• Envio de vídeos pelo WhatsApp</li>
                  <li>• Agendamento de mensagens</li>
                  <li>• Diferentes perfis de destinatários</li>
                  <li>• Histórico completo de envios</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Perfis de Destinatários</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Pastores:</strong> Comunicação pastoral</li>
                  <li>• <strong>Financeiro:</strong> Equipe financeira</li>
                  <li>• <strong>Membros:</strong> Toda a congregação</li>
                  <li>• <strong>Todos:</strong> Envio geral</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
