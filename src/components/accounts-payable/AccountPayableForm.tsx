import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCreateAccountPayable, CreateAccountPayableData } from '@/hooks/useAccountsPayable';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useCongregations } from '@/hooks/useCongregationData';
import { useNavigate } from 'react-router-dom';

const accountPayableSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  due_date: z.string().min(1, 'Data de vencimento é obrigatória'),
  payment_method: z.string().min(1, 'Forma de pagamento é obrigatória'),
  payee_name: z.string().min(1, 'Nome do favorecido é obrigatório'),
  bank_name: z.string().optional(),
  bank_agency: z.string().optional(),
  bank_account: z.string().optional(),
  congregation_id: z.string().min(1, 'Congregação é obrigatória'),
  observations: z.string().optional(),
  invoice_number: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_frequency: z.string().optional(),
  urgency_level: z.enum(['normal', 'urgent']).default('normal'),
  urgency_description: z.string().optional(),
});

type AccountPayableFormData = z.infer<typeof accountPayableSchema>;

const AccountPayableForm = () => {
  const navigate = useNavigate();
  const { data: categories } = useExpenseCategories();
  const { data: congregations } = useCongregations();
  const createMutation = useCreateAccountPayable();

  const form = useForm<AccountPayableFormData>({
    resolver: zodResolver(accountPayableSchema),
    defaultValues: {
      is_recurring: false,
      urgency_level: 'normal',
      recurrence_frequency: 'monthly',
    },
  });

  const onSubmit = (data: AccountPayableFormData) => {
    createMutation.mutate(data as CreateAccountPayableData, {
      onSuccess: () => {
        navigate('/accounts-payable/pending-approval');
      },
    });
  };

  const isUrgent = form.watch('urgency_level') === 'urgent';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da conta a pagar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição da Despesa *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva a despesa..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="cartao">Cartão</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="congregation_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Congregação *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a congregação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {congregations?.map((congregation) => (
                          <SelectItem key={congregation.id} value={congregation.id}>
                            {congregation.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dados do Favorecido */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Favorecido</CardTitle>
              <CardDescription>Informações sobre quem receberá o pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="payee_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome/Razão Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do favorecido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do banco" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bank_agency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agência</FormLabel>
                      <FormControl>
                        <Input placeholder="0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conta</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoice_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Nota Fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Urgência</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isUrgent && (
              <FormField
                control={form.control}
                name="urgency_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Urgência</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o motivo da urgência..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações adicionais..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        É recorrente?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {form.watch('is_recurring') && (
              <FormField
                control={form.control}
                name="recurrence_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Salvando...' : 'Salvar Conta'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountPayableForm;