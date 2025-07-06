
import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { EventFormData } from '../schemas/eventSchema';
import EventTypeField from './EventTypeField';
import OrganizerField from './OrganizerField';

interface BasicEventFieldsProps {
  control: Control<EventFormData>;
}

const BasicEventFields = ({ control }: BasicEventFieldsProps) => {
  const supportTeamOptions = [
    'Som e Áudio',
    'Louvor e Adoração',
    'Obreiros',
    'Recepção',
    'Limpeza',
    'Segurança',
    'Ministério Infantil',
    'Mídia e Transmissão',
    'Decoração',
    'Cozinha'
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Evento *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Evento *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local</FormLabel>
              <FormControl>
                <Input placeholder="Local do evento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <EventTypeField control={control} />
      
      <OrganizerField control={control} />

      <FormField
        control={control}
        name="max_attendees"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número Máximo de Participantes</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Deixe em branco se não houver limite"
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição/Detalhes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva os detalhes do evento"
                rows={3}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="support_teams"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Equipes de Apoio Necessárias</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {supportTeamOptions.map((team) => (
                <div key={team} className="flex items-center space-x-2">
                  <Checkbox
                    id={team}
                    checked={field.value?.includes(team) || false}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...(field.value || []), team]);
                      } else {
                        field.onChange((field.value || []).filter(t => t !== team));
                      }
                    }}
                  />
                  <Label htmlFor={team} className="text-sm">
                    {team}
                  </Label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações Adicionais</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Observações internas sobre o evento"
                rows={2}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicEventFields;
