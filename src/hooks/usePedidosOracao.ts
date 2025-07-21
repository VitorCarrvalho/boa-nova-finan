import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PedidoOracao {
  nome?: string;
  texto: string;
}

export const usePedidosOracao = () => {
  const createPedido = useMutation({
    mutationFn: async (pedido: PedidoOracao) => {
      // Garantir que o texto não está vazio
      if (!pedido.texto || pedido.texto.trim() === '') {
        throw new Error('Texto do pedido é obrigatório');
      }
      
      const { data, error } = await supabase
        .from('pedidos_oracao')
        .insert([{
          nome: pedido.nome || null,
          texto: pedido.texto.trim()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Pedido enviado com sucesso! ❤️',
        description: 'Estaremos orando por você. Que Deus abençoe sua vida!',
      });
    },
    onError: (error) => {
      console.error('Erro ao enviar pedido de oração:', error);
      toast({
        title: 'Erro ao enviar pedido',
        description: 'Tente novamente em alguns momentos.',
        variant: 'destructive',
      });
    },
  });

  return {
    createPedido,
  };
};