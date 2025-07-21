
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
      console.log('📝 Tentando enviar pedido de oração:', { 
        nome: pedido.nome || 'Anônimo', 
        textoLength: pedido.texto?.length,
        supabaseUrl: 'https://jryifbcsifodvocshvuo.supabase.co',
        timestamp: new Date().toISOString()
      });
      
      // Validação local
      if (!pedido.texto || pedido.texto.trim() === '') {
        throw new Error('Texto do pedido é obrigatório');
      }

      if (pedido.texto.trim().length > 1000) {
        throw new Error('O pedido deve ter no máximo 1000 caracteres');
      }
      
      // Preparar dados para inserção
      const dados = {
        nome: pedido.nome?.trim() || null,
        texto: pedido.texto.trim()
      };

      console.log('📤 Enviando para Supabase:', dados);
      
      const { data, error } = await supabase
        .from('pedidos_oracao')
        .insert([dados])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Pedido enviado com sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🎉 Sucesso no envio do pedido:', data);
      toast({
        title: 'Pedido enviado com sucesso! ❤️',
        description: 'Estaremos orando por você. Que Deus abençoe sua vida!',
      });
    },
    onError: (error) => {
      console.error('💥 Erro completo ao enviar pedido:', error);
      
      let errorMessage = 'Tente novamente em alguns momentos.';
      
      // Mensagens de erro mais específicas
      if (error.message.includes('row-level security')) {
        errorMessage = 'Erro de permissão. Verificando configurações...';
        console.error('🔒 Erro de RLS detectado');
      } else if (error.message.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (error.message.includes('obrigatório')) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Erro ao enviar pedido',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  return {
    createPedido,
  };
};
