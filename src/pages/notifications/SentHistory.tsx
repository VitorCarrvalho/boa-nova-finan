
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, ArrowLeft, RefreshCw, Download, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SentHistory = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Fetch sent notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['sent-notifications', statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from('notifications')
        .select(`
          *,
          video_library(title),
          profiles!notifications_created_by_fkey(name)
        `)
        .neq('status', 'scheduled')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('delivery_type', typeFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const handleResend = async (notificationId: string) => {
    try {
      // Get the original notification
      const { data: originalNotification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (fetchError) throw fetchError;

      // Create a new notification with the same data
      const { error: insertError } = await supabase
        .from('notifications')
        .insert({
          message_type: originalNotification.message_type,
          message_content: originalNotification.message_content,
          video_id: originalNotification.video_id,
          delivery_type: 'unico',
          recipient_profiles: originalNotification.recipient_profiles,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          n8n_payload: {
            ...originalNotification.n8n_payload,
            tipo_disparo: 'unico',
            criado_em: new Date().toISOString()
          },
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso",
        description: "Notificação reenviada com sucesso!"
      });

      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
    } catch (error: any) {
      console.error('Erro ao reenviar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar a notificação. Tente novamente.",
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
      'Data Envio',
      'Tipo Mensagem',
      'Conteúdo',
      'Destinatários',
      'Tipo Entrega',
      'Status',
      'Criado Por'
    ];

    const csvData = notifications.map(notification => [
      notification.sent_at ? new Date(notification.sent_at).toLocaleDateString('pt-BR') : '',
      notification.message_type,
      notification.message_content.substring(0, 100) + (notification.message_content.length > 100 ? '...' : ''),
      notification.recipient_profiles.join(', '),
      notification.delivery_type === 'unico' ? 'Único' : 'Agendado',
      notification.status,
      notification.profiles?.name || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_enviado_${new Date().toISOString().split('T')[0]}.csv`);
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
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'error':
        return 'Erro';
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
          <Send className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico Enviado</h1>
            <p className="text-gray-600">Visualize mensagens já enviadas</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Filtros</span>
              <Button onClick={exportToCsv} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="sent">Enviado</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Entrega</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="unico">Único</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensagens Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando histórico...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Send className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nenhuma mensagem encontrada</p>
                <p className="text-sm text-gray-400">As mensagens enviadas aparecerão aqui</p>
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
                          <span className="text-sm text-blue-600">
                            {notification.delivery_type === 'unico' ? 'Único' : 'Agendado'}
                          </span>
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
                            📅 {notification.sent_at 
                              ? new Date(notification.sent_at).toLocaleDateString('pt-BR')
                              : new Date(notification.created_at).toLocaleDateString('pt-BR')
                            }
                          </span>
                          <span>
                            👤 {notification.profiles?.name || 'N/A'}
                          </span>
                        </div>

                        {notification.error_message && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            Erro: {notification.error_message}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {notification.status === 'sent' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reenviar Notificação</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja reenviar esta notificação? 
                                  Uma nova mensagem será enviada imediatamente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleResend(notification.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Reenviar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

export default SentHistory;
