import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Repeat, ArrowLeft, Pause, Play, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const RecurringMessages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  // Fetch recurring notifications
  const { data: recurringMessages = [], isLoading } = useQuery({
    queryKey: ['recurring-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          video_library(title)
        `)
        .eq('delivery_type', 'recorrente' as any)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleToggleStatus = async (messageId: string, currentStatus: boolean) => {
    setUpdatingIds(prev => [...prev, messageId]);
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !currentStatus } as any)
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Mensagem ${!currentStatus ? 'ativada' : 'pausada'} com sucesso!`
      });

      queryClient.invalidateQueries({ queryKey: ['recurring-messages'] });
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status da mensagem.",
        variant: "destructive"
      });
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== messageId));
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mensagem recorrente excluída com sucesso!"
      });

      queryClient.invalidateQueries({ queryKey: ['recurring-messages'] });
    } catch (error: any) {
      console.error('Erro ao excluir mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir a mensagem.",
        variant: "destructive"
      });
    }
  };

  const getRecurrenceLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'diaria': 'Todo dia',
      'semanal': 'Toda semana',
      'mensal': 'Uma vez por mês'
    };
    return labels[frequency] || frequency;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <Repeat className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mensagens Recorrentes</h1>
            <p className="text-gray-600">Gerencie notificações automáticas</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Notificações Ativas
              <Badge variant="outline">
                {recurringMessages.filter(msg => (msg as any).is_active).length} ativas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando mensagens...</p>
              </div>
            ) : recurringMessages.length === 0 ? (
              <div className="text-center py-8">
                <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nenhuma mensagem recorrente encontrada</p>
                <p className="text-sm text-gray-400 mb-4">Crie uma nova notificação com tipo "Recorrente"</p>
                <Link to="/notificacoes/nova">
                  <Button>Criar Mensagem Recorrente</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recurringMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor((message as any).is_active)}>
                            {(message as any).is_active ? 'Ativa' : 'Pausada'}
                          </Badge>
                          <Badge variant="outline">
                            {getRecurrenceLabel((message as any).recurrence_frequency || 'indefinida')}
                          </Badge>
                          <Badge variant="secondary">
                            {message.message_type === 'texto' ? 'Texto' : 
                             message.message_type === 'texto_com_video' ? 'Texto + Vídeo' : 'Vídeo'}
                          </Badge>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {message.message_content.length > 100 
                              ? `${message.message_content.substring(0, 100)}...` 
                              : message.message_content}
                          </p>
                          {message.video_library && (
                            <p className="text-sm text-gray-600">
                              📹 {message.video_library.title}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Destinatários: {message.recipient_profiles?.join(', ')}
                          </span>
                          <span>
                            Criada em: {formatDate(message.created_at)}
                          </span>
                          {message.sent_at && (
                            <span>
                              Último envio: {formatDate(message.sent_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(message.id, (message as any).is_active)}
                          disabled={updatingIds.includes(message.id)}
                        >
                          {(message as any).is_active ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pausar
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Mensagem Recorrente</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta mensagem recorrente? 
                                Esta ação não pode ser desfeita e interromperá todos os envios futuros.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(message.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default RecurringMessages;