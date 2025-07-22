
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Video, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const VideoLibrary = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    minioVideoId: '',
    urlMinio: '',
    categoria: ''
  });

  // Fetch videos
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['video-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_library')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.minioVideoId.trim() || !formData.urlMinio.trim()) {
      toast({
        title: "Erro",
        description: "Título, ID do MinIO e URL são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('video_library')
        .insert({
          title: formData.title.trim(),
          minio_video_id: formData.minioVideoId.trim(),
          url_minio: formData.urlMinio.trim(),
          categoria: formData.categoria.trim() || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        } as any);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Vídeo adicionado à biblioteca com sucesso!"
      });

      setFormData({ title: '', minioVideoId: '', urlMinio: '', categoria: '' });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['video-library'] });
    } catch (error: any) {
      console.error('Erro ao adicionar vídeo:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar o vídeo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('video_library')
        .update({ is_active: false })
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Vídeo removido da biblioteca."
      });

      queryClient.invalidateQueries({ queryKey: ['video-library'] });
    } catch (error: any) {
      console.error('Erro ao remover vídeo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover o vídeo. Tente novamente.",
        variant: "destructive"
      });
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
          <Video className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Vídeos</h1>
            <p className="text-gray-600">Gerencie os vídeos disponíveis para notificações</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Vídeo</Label>
                  <Input
                    id="title"
                    placeholder="Digite o título do vídeo"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minioVideoId">ID do Vídeo no MinIO</Label>
                  <Input
                    id="minioVideoId"
                    placeholder="Digite o ID do vídeo no MinIO"
                    value={formData.minioVideoId}
                    onChange={(e) => setFormData(prev => ({ ...prev, minioVideoId: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urlMinio">URL do Vídeo no MinIO</Label>
                  <Input
                    id="urlMinio"
                    placeholder="Digite a URL completa do vídeo"
                    value={formData.urlMinio}
                    onChange={(e) => setFormData(prev => ({ ...prev, urlMinio: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria/Tag (opcional)</Label>
                  <Input
                    id="categoria"
                    placeholder="Ex: Sermão, Testemunho, Evento"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adicionando...' : 'Adicionar Vídeo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Vídeos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando vídeos...</p>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Nenhum vídeo encontrado</p>
                <p className="text-sm text-gray-400">Adicione seu primeiro vídeo à biblioteca</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Video className="h-8 w-8 text-red-600" />
                      <div>
                        <h3 className="font-medium">{video.title}</h3>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">ID: {video.minio_video_id}</p>
                          {(video as any).url_minio && (
                            <p className="text-sm text-gray-600">URL: {(video as any).url_minio.substring(0, 50)}...</p>
                          )}
                          {(video as any).categoria && (
                            <p className="text-sm text-blue-600">📂 {(video as any).categoria}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Criado em {new Date(video.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Vídeo</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover "{video.title}" da biblioteca? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(video.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default VideoLibrary;
