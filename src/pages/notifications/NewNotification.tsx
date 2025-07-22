
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';
import { useN8nIntegration } from '@/hooks/useN8nIntegration';

type NotificationType = Database['public']['Enums']['notification_type'];
type DeliveryType = Database['public']['Enums']['delivery_type'];
type RecipientProfile = Database['public']['Enums']['recipient_profile'];

const NewNotification = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { sendToN8n } = useN8nIntegration();
  const [formData, setFormData] = useState({
    messageType: 'texto' as NotificationType,
    messageContent: '',
    videoId: '',
    deliveryType: 'unico' as DeliveryType,
    recipientProfiles: [] as RecipientProfile[],
    scheduledTime: '',
    recurrenceFrequency: ''
  });

  // Fetch video library
  const { data: videos = [] } = useQuery({
    queryKey: ['video-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_library')
        .select('*')
        .eq('is_active', true)
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  const timeOptions = ['08:00', '12:00', '17:00', '20:00', '22:00'];
  const recipientOptions = [
    { value: 'pastores' as RecipientProfile, label: 'Pastores' },
    { value: 'financeiro' as RecipientProfile, label: 'Financeiro' },
    { value: 'membros' as RecipientProfile, label: 'Membros' },
    { value: 'todos' as RecipientProfile, label: 'Todos' }
  ];

  const recurrenceOptions = [
    { value: 'diaria', label: 'Todo dia' },
    { value: 'semanal', label: 'Toda semana' },
    { value: 'mensal', label: 'Uma vez por mês' }
  ];

  const handleRecipientChange = (value: RecipientProfile, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        recipientProfiles: [...prev.recipientProfiles, value]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recipientProfiles: prev.recipientProfiles.filter(p => p !== value)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.messageContent.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo da mensagem é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    if (formData.recipientProfiles.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um perfil de destinatário.",
        variant: "destructive"
      });
      return;
    }

    if (formData.deliveryType === 'agendado' && !formData.scheduledTime) {
      toast({
        title: "Erro",
        description: "Selecione um horário para mensagens agendadas.",
        variant: "destructive"
      });
      return;
    }

    if (formData.deliveryType === 'recorrente' && !formData.recurrenceFrequency) {
      toast({
        title: "Erro",
        description: "Selecione a frequência para mensagens recorrentes.",
        variant: "destructive"
      });
      return;
    }

    if ((formData.messageType === 'texto_com_video' || formData.messageType === 'video') && !formData.videoId) {
      toast({
        title: "Erro",
        description: "Selecione um vídeo para este tipo de mensagem.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get video info if needed
      let videoInfo = null;
      if (formData.videoId) {
        const { data: video } = await supabase
          .from('video_library')
          .select('title, minio_video_id, url_minio')
          .eq('id', formData.videoId)
          .single();
        videoInfo = video;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Prepare n8n payload
      const n8nPayload = {
        tipo_disparo: formData.deliveryType,
        tipo_mensagem: formData.messageType,
        mensagem: formData.messageContent,
        id_video: videoInfo?.url_minio || null,
        destinatarios: formData.recipientProfiles,
        recorrencia: formData.deliveryType === 'recorrente' ? formData.recurrenceFrequency : null,
        horario_agendado: formData.deliveryType === 'agendado' ? formData.scheduledTime : null,
        criado_por: user.id,
        criado_em: new Date().toISOString()
      };

      // Prepare notification data - ensuring compatibility with current schema
      const notificationData: any = {
        message_type: formData.messageType,
        message_content: formData.messageContent,
        video_id: formData.videoId || null,
        delivery_type: formData.deliveryType,
        recipient_profiles: formData.recipientProfiles,
        scheduled_time: formData.deliveryType === 'agendado' ? formData.scheduledTime : null,
        created_by: user.id,
        n8n_payload: n8nPayload,
        status: formData.deliveryType === 'agendado' ? 'scheduled' : 'sent',
        sent_at: formData.deliveryType === 'unico' ? new Date().toISOString() : null
      };

      // Add new columns only if they exist in the schema
      if (formData.deliveryType === 'recorrente') {
        notificationData.recurrence_frequency = formData.recurrenceFrequency;
      }

      console.log('Inserting notification with data:', notificationData);

      // Insert notification record
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Notification created successfully:', notification);

      // Send to n8n if it's an immediate send (único)
      if (formData.deliveryType === 'unico') {
        console.log('Sending to n8n:', n8nPayload);
        const success = await sendToN8n(n8nPayload);
        if (!success) {
          // Update notification status to error if n8n fails
          await supabase
            .from('notifications')
            .update({ 
              status: 'error', 
              error_message: 'Falha ao enviar para n8n' 
            })
            .eq('id', notification.id);
        }
      }

      toast({
        title: "Sucesso",
        description: formData.deliveryType === 'agendado' 
          ? "Notificação agendada com sucesso!"
          : formData.deliveryType === 'recorrente'
          ? "Notificação recorrente criada com sucesso!"
          : "Notificação enviada com sucesso!"
      });

      navigate('/notificacoes');
    } catch (error: any) {
      console.error('Erro ao processar notificação:', error);
      toast({
        title: "Erro",
        description: `Erro ao processar a notificação: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          <MessageSquare className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Notificação</h1>
            <p className="text-gray-600">Criar e enviar uma nova mensagem</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Notificação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message Type */}
              <div className="space-y-2">
                <Label htmlFor="messageType">Tipo de Mensagem</Label>
                <Select 
                  value={formData.messageType} 
                  onValueChange={(value: NotificationType) => 
                    setFormData(prev => ({ ...prev, messageType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="texto">Texto apenas</SelectItem>
                    <SelectItem value="texto_com_video">Texto + Vídeo</SelectItem>
                    <SelectItem value="video">Vídeo apenas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Content */}
              {(formData.messageType === 'texto' || formData.messageType === 'texto_com_video') && (
                <div className="space-y-2">
                  <Label htmlFor="messageContent">Conteúdo da Mensagem</Label>
                  <Textarea
                    id="messageContent"
                    placeholder="Digite sua mensagem aqui..."
                    value={formData.messageContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, messageContent: e.target.value }))}
                    rows={4}
                  />
                </div>
              )}

              {/* Video Selection */}
              {(formData.messageType === 'texto_com_video' || formData.messageType === 'video') && (
                <div className="space-y-2">
                  <Label htmlFor="videoId">Selecionar Vídeo</Label>
                  <Select 
                    value={formData.videoId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, videoId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um vídeo" />
                    </SelectTrigger>
                    <SelectContent>
                      {videos.map((video) => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Recipient Profiles */}
              <div className="space-y-3">
                <Label>Perfis de Destinatários</Label>
                <div className="grid grid-cols-2 gap-3">
                  {recipientOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.recipientProfiles.includes(option.value)}
                        onCheckedChange={(checked) => handleRecipientChange(option.value, !!checked)}
                      />
                      <Label htmlFor={option.value}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Type */}
              <div className="space-y-2">
                <Label htmlFor="deliveryType">Tipo de Entrega</Label>
                <Select 
                  value={formData.deliveryType} 
                  onValueChange={(value: DeliveryType) => 
                    setFormData(prev => ({ ...prev, deliveryType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unico">Envio Único</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="recorrente">Recorrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduled Time */}
              {formData.deliveryType === 'agendado' && (
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Horário de Envio</Label>
                  <Select 
                    value={formData.scheduledTime} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, scheduledTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Recurrence Frequency */}
              {formData.deliveryType === 'recorrente' && (
                <div className="space-y-2">
                  <Label htmlFor="recurrenceFrequency">Frequência de Envio</Label>
                  <Select 
                    value={formData.recurrenceFrequency} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {recurrenceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processando...' : 
                    formData.deliveryType === 'agendado' ? 'Agendar Notificação' : 
                    formData.deliveryType === 'recorrente' ? 'Criar Recorrente' : 'Enviar Notificação'
                  }
                </Button>
                <Link to="/notificacoes">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewNotification;
