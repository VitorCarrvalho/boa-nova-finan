
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateEvent, useUpdateEvent, useProfiles } from '@/hooks/useEventData';
import type { Database } from '@/integrations/supabase/types';

type ChurchEvent = Database['public']['Tables']['church_events']['Row'];

const eventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().optional(),
  type: z.enum(['culto', 'conferencia', 'reuniao', 'evento_especial']),
  location: z.string().optional(),
  organizer_id: z.string().optional(),
  max_attendees: z.number().optional(),
  notes: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: ChurchEvent | null;
}

const EventForm = ({ isOpen, onClose, event }: EventFormProps) => {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { data: profiles } = useProfiles();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      date: event?.date || '',
      time: event?.time || '',
      type: event?.type || 'culto',
      location: event?.location || '',
      organizer_id: event?.organizer_id || '',
      max_attendees: event?.max_attendees || undefined,
      notes: event?.notes || '',
    }
  });

  React.useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time || '',
        type: event.type,
        location: event.location || '',
        organizer_id: event.organizer_id || '',
        max_attendees: event.max_attendees || undefined,
        notes: event.notes || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'culto',
        location: '',
        organizer_id: '',
        max_attendees: undefined,
        notes: '',
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      const eventData = {
        ...data,
        max_attendees: data.max_attendees || null,
        organizer_id: data.organizer_id || null,
      };

      if (event) {
        await updateEvent.mutateAsync({ id: event.id, ...eventData });
      } else {
        await createEvent.mutateAsync(eventData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const eventTypes = [
    { value: 'culto', label: 'Culto' },
    { value: 'conferencia', label: 'Conferência' },
    { value: 'reuniao', label: 'Reunião' },
    { value: 'evento_especial', label: 'Evento Especial' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Digite o título do evento"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={watch('type')} onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                {...register('time')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Local do evento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizer_id">Organizador</Label>
              <Select value={watch('organizer_id')} onValueChange={(value) => setValue('organizer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o organizador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_attendees">Máximo de Participantes</Label>
              <Input
                id="max_attendees"
                type="number"
                {...register('max_attendees', { valueAsNumber: true })}
                placeholder="Sem limite"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição do evento"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Observações adicionais"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : event ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
