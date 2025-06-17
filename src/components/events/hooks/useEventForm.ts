
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateEvent, useUpdateEvent } from '@/hooks/useEventData';
import { eventSchema, EventFormData } from '../schemas/eventSchema';
import type { Database } from '@/integrations/supabase/types';

type ChurchEvent = Database['public']['Tables']['church_events']['Row'];

interface UseEventFormProps {
  event?: ChurchEvent | null;
  onClose: () => void;
}

export const useEventForm = ({ event, onClose }: UseEventFormProps) => {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      type: 'culto',
      location: '',
      organizer_id: '',
      max_attendees: undefined,
      notes: '',
    }
  });

  React.useEffect(() => {
    if (event) {
      console.log('Editing event:', event);
      form.reset({
        title: event.title || '',
        description: event.description || '',
        date: event.date || '',
        time: event.time || '',
        type: event.type as any,
        location: event.location || '',
        organizer_id: event.organizer_id || '',
        max_attendees: event.max_attendees || undefined,
        notes: event.notes || '',
      });
    } else {
      console.log('Creating new event');
      form.reset({
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
  }, [event, form]);

  const onSubmit = async (data: EventFormData) => {
    try {
      console.log('Submitting event data:', data);
      
      const eventData = {
        title: data.title,
        description: data.description || null,
        date: data.date,
        time: data.time || null,
        type: data.type,
        location: data.location || null,
        organizer_id: data.organizer_id || null,
        max_attendees: data.max_attendees || null,
        notes: data.notes || null,
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

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
  };
};
