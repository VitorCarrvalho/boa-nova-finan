
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
      // Log inicial com informações detalhadas
      console.log('📝 Iniciando envio de pedido de oração:', { 
        nome: pedido.nome || 'Anônimo', 
        textoLength: pedido.texto?.length,
        supabaseUrl: 'https://jryifbcsifodvocshvuo.supabase.co',
        timestamp: new Date().toISOString()
      });

      // Verificar status de autenticação
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log('🔐 Status de autenticação:', {
        hasSession: !!session,
        userId: session?.user?.id || 'anônimo',
        role: session?.user?.role || 'anon',
        authError: authError?.message
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

      console.log('📤 Enviando dados para Supabase:', dados);

      // Implementar retry logic
      let ultimoErro;
      for (let tentativa = 1; tentativa <= 3; tentativa++) {
        try {
          console.log(`🔄 Tentativa ${tentativa}/3 de envio`);
          
          const { data, error } = await supabase
            .from('pedidos_oracao')
            .insert([dados])
            .select()
            .single();

          if (error) {
            console.error(`❌ Erro na tentativa ${tentativa}:`, {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            });
            ultimoErro = error;
            
            // Se for erro de RLS, não tentar novamente
            if (error.message.includes('row-level security') || error.message.includes('permission')) {
              console.error('🔒 Erro de permissão detectado - não tentando novamente');
              break;
            }
            
            // Aguardar antes da próxima tentativa
            if (tentativa < 3) {
              console.log(`⏳ Aguardando ${tentativa}s antes da próxima tentativa...`);
              await new Promise(resolve => setTimeout(resolve, tentativa * 1000));
            }
            continue;
          }

          console.log('✅ Pedido enviado com sucesso na tentativa', tentativa, ':', data);
          return data;
          
        } catch (error: any) {
          console.error(`💥 Erro inesperado na tentativa ${tentativa}:`, error);
          ultimoErro = error;
          
          if (tentativa < 3) {
            await new Promise(resolve => setTimeout(resolve, tentativa * 1000));
          }
        }
      }

      // Se chegou aqui, todas as tentativas falharam
      console.error('🚫 Todas as tentativas de envio falharam');
      throw ultimoErro;
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
