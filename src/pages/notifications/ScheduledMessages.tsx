
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, ArrowLeft, X, Play, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ScheduledMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scheduled notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['scheduled-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          video_library(title)
        `)
        .eq('delivery_type', 'agendado')
        .in('status', ['scheduled', 'inactive'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleCancel = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'cancelled' })
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notificação cancelada com sucesso."
      });

      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    } catch (error: any) {
      console.error('Erro ao cancelar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar a notificação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleReactivate = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'scheduled' })
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notificação reativada com sucesso."
      });

      queryClient.invalidateQueries({ queryKey: ['scheduled-notifications'] });
    } catch (error: any) {
      console.error('Erro ao reativar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao reativar a notificação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const exportToCsv = () => {
    if (notifications.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar.",
        variant: "destructive"
      });
      return;
    }

    const headers = [
      'Data Criação',
      'Tipo Mensagem',
      'Conteúdo',
      'Destinatários',
      'Horário Agendado',
      'Status'
    ];

    const csvData = notifications.map(notification => [
      new Date(notification.created_at).toLocaleDateString('pt-BR'),
      notification.message_type,
      notification.message_content.substring(0, 100) + (notification.message_content.length > 100 ? '...' : ''),
      notification.recipient_profiles.join(', '),
      notification.scheduled_time || '',
      notification.status
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mensagens_agendadas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: "Relatório exportado com sucesso!"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'inactive':
        return 'Inativo';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/notificacoes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <Clock className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mensagens Agendadas</h1>
            <p className="text-gray-600">Gerencie notificações programadas</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {notifications.length} mensagem(ns) agendada(s)
          </p>
          <Button onClick={exportToCsv} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notificações Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando mensagens...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nenhuma mensagem agendada</p>
                <p className="text-sm text-gray-400">Crie uma nova notificação agendada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(notification.status)}>
                            {getStatusText(notification.status)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {notification.message_type.replace('_', ' + ')}
                          </span>
                          {notification.scheduled_time && (
                            <span className="text-sm text-blue-600 font-medium">
                              {notification.scheduled_time}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-800 mb-2">
                          {notification.message_content.length > 150 
                            ? `${notification.message_content.substring(0, 150)}...`
                            : notification.message_content
                          }
                        </p>
                        
                        {notification.video_library && (
                          <p className="text-sm text-purple-600 mb-2">
                            📹 {notification.video_library.title}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            📧 {notification.recipient_profiles.join(', ')}
                          </span>
                          <span>
                            📅 {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {notification.status === 'scheduled' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <X className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancelar Notificação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja cancelar esta notificação agendada?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Não</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleCancel(notification.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, cancelar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        {(notification.status === 'inactive' || notification.status === 'cancelled') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReactivate(notification.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ScheduledMessages;
