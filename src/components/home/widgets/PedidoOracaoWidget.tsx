import React from 'react';
import { Heart, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePedidosOracao } from '@/hooks/usePedidosOracao';

const pedidoSchema = z.object({
  nome: z.string().optional(),
  texto: z.string()
    .min(1, 'Por favor, digite seu pedido de oração')
    .max(1000, 'O pedido deve ter no máximo 1000 caracteres')
});

type PedidoForm = z.infer<typeof pedidoSchema>;

const PedidoOracaoWidget = () => {
  const { createPedido } = usePedidosOracao();
  
  const form = useForm<PedidoForm>({
    resolver: zodResolver(pedidoSchema),
    defaultValues: {
      nome: '',
      texto: ''
    }
  });

  const onSubmit = async (data: PedidoForm) => {
    try {
      // Garantir que texto está presente
      if (!data.texto || data.texto.trim() === '') {
        return;
      }
      
      await createPedido.mutateAsync({
        nome: data.nome,
        texto: data.texto
      });
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar pedido:', error);
    }
  };

  return (
    <WidgetContainer className="flex flex-col min-h-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Pedido de Oração</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-3">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-muted-foreground">Nome (opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Seu nome" 
                    {...field} 
                    className="h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="texto"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col">
                <FormLabel className="text-sm text-muted-foreground">Pedido de Oração</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Compartilhe seu pedido de oração. Estaremos orando por você!"
                    className="flex-1 resize-none min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground text-right">
                  {field.value?.length || 0}/1000
                </div>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={createPedido.isPending}
            className="w-full"
          >
            {createPedido.isPending ? (
              'Enviando...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Pedido
              </>
            )}
          </Button>
        </form>
      </Form>
    </WidgetContainer>
  );
};

export default PedidoOracaoWidget;