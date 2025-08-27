import React from 'react';
import { Control, UseFormWatch } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Repeat } from 'lucide-react';

interface RecurrenceFieldsProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
}

const RecurrenceFields: React.FC<RecurrenceFieldsProps> = ({ control, watch }) => {
  const isRecurring = watch('is_recurring');
  const isFutureScheduled = watch('is_future_scheduled');
  const recurrenceFrequency = watch('recurrence_frequency');

  const weekDays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  return (
    <div className="space-y-6">
      {/* Seção de Agendamento e Recorrência */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Agendamento e Recorrência
          </CardTitle>
          <CardDescription>
            Configure se esta conta deve ser agendada para o futuro ou se repete periodicamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opção de Agendamento Futuro */}
          <FormField
            control={control}
            name="is_future_scheduled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isRecurring}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Agendar para o futuro
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Esta conta será processada em uma data específica no futuro
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Data de Agendamento Futuro */}
          {isFutureScheduled && (
            <FormField
              control={control}
              name="future_scheduled_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Agendamento *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Opção de Recorrência */}
          <FormField
            control={control}
            name="is_recurring"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isFutureScheduled}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Conta recorrente
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Esta conta se repete periodicamente (mensal, semanal, etc.)
                  </p>
                </div>
              </FormItem>
            )}
          />

          {/* Configurações de Recorrência */}
          {isRecurring && (
            <div className="space-y-4 ml-6 border-l-2 border-primary/20 pl-4">
              {/* Frequência de Recorrência */}
              <FormField
                control={control}
                name="recurrence_frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a frequência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="biweekly">Quinzenal (dia 15 e 30)</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Configurações específicas por frequência */}
              {recurrenceFrequency === 'weekly' ? (
                <FormField
                  control={control}
                  name="recurrence_day_of_week"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Semana *</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia da semana" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {weekDays.map(day => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : recurrenceFrequency === 'biweekly' ? (
                <FormField
                  control={control}
                  name="recurrence_day_of_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia do Mês (Quinzenal) *</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">Dia 15 (primeira quinzena)</SelectItem>
                          <SelectItem value="30">Dia 30 (segunda quinzena)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Para recorrência quinzenal, escolha entre dia 15 ou 30
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : recurrenceFrequency === 'monthly' || recurrenceFrequency === 'quarterly' || recurrenceFrequency === 'yearly' ? (
                <FormField
                  control={control}
                  name="recurrence_day_of_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia do Mês *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="31"
                          placeholder="Ex: 15 (dia 15 de cada mês)"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Para meses com menos dias, será usado o último dia disponível
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}

              {/* Data da Primeira Ocorrência */}
              <FormField
                control={control}
                name="next_occurrence_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Primeira Ocorrência *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {recurrenceFrequency === 'weekly' && 'A partir desta data, a conta se repetirá toda semana'}
                      {recurrenceFrequency === 'biweekly' && 'A partir desta data, a conta se repetirá quinzenalmente (dia 15 e 30)'}
                      {recurrenceFrequency === 'monthly' && 'A partir desta data, a conta se repetirá todo mês'}
                      {recurrenceFrequency === 'quarterly' && 'A partir desta data, a conta se repetirá a cada 3 meses'}
                      {recurrenceFrequency === 'yearly' && 'A partir desta data, a conta se repetirá todo ano'}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Explicação das diferenças */}
          {!isRecurring && !isFutureScheduled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">💡 Entenda as opções:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li><strong>Conta Normal:</strong> Vence na data especificada e precisa ser aprovada normalmente</li>
                <li><strong>Agendamento Futuro:</strong> Uma conta única que será processada em data específica</li>
                <li><strong>Conta Recorrente:</strong> Gera automaticamente novas contas baseada na frequência escolhida</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecurrenceFields;