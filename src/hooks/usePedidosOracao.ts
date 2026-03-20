
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PedidoOracao {
  nome?: string;
  texto: string;
  tenantId?: string | null;
}

export const usePedidosOracao = () => {
  const queryClient = useQueryClient();

  const { data: pedidos, isLoading } = useQuery({
    queryKey: ['pedidos-oracao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pedidos_oracao')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPedido = useMutation({
    mutationFn: async (pedido: PedidoOracao) => {
      if (!pedido.texto || pedido.texto.trim() === '') {
        throw new Error('Texto do pedido é obrigatório');
      }
      if (pedido.texto.trim().length > 1000) {
        throw new Error('O pedido deve ter no máximo 1000 caracteres');
      }

      const dados = {
        nome: pedido.nome?.trim() || null,
        texto: pedido.texto.trim(),
        tenant_id: pedido.tenantId || null,
      };

      const { data, error } = await supabase
        .from('pedidos_oracao')
        .insert([dados])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-oracao'] });
      toast({
        title: 'Pedido enviado com sucesso! ❤️',
        description: 'Estaremos orando por você. Que Deus abençoe sua vida!',
      });
    },
    onError: (error: any) => {
      let errorMessage = 'Tente novamente em alguns momentos.';
      if (error.message?.includes('row-level security')) {
        errorMessage = 'Erro de permissão. Verificando configurações...';
      } else if (error.message?.includes('obrigatório')) {
        errorMessage = error.message;
      }
      toast({
        title: 'Erro ao enviar pedido',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { error } = await supabase
        .from('pedidos_oracao')
        .update({
          is_read: isRead,
          read_at: isRead ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-oracao'] });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
    },
  });

  const toggleFollow = useMutation({
    mutationFn: async ({ id, isFollowed }: { id: string; isFollowed: boolean }) => {
      const { error } = await supabase
        .from('pedidos_oracao')
        .update({ is_followed: isFollowed })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-oracao'] });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar acompanhamento', variant: 'destructive' });
    },
  });

  const deletePedido = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pedidos_oracao')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-oracao'] });
      toast({ title: 'Pedido removido com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro ao remover pedido', variant: 'destructive' });
    },
  });

  return {
    pedidos,
    isLoading,
    createPedido,
    markAsRead,
    toggleFollow,
    deletePedido,
  };
};
