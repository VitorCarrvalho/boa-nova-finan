
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateEvent, useUpdateEvent } from '@/hooks/useEventData';
import { useImageUpload } from '@/hooks/useImageUpload';
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
  const { uploadEventBanner, deleteEventBanner, isUploading } = useImageUpload();

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
      banner_image: undefined,
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
      
      let bannerImageUrl = event?.banner_image_url || null;
      
      // Upload da imagem se foi selecionada
      if (data.banner_image) {
        bannerImageUrl = await uploadEventBanner(data.banner_image, event?.id);
      }
      
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
        banner_image_url: bannerImageUrl,
      };

      if (event) {
        // Se estava atualizando uma imagem existente, deletar a anterior
        if (data.banner_image && event.banner_image_url) {
          await deleteEventBanner(event.banner_image_url);
        }
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
    isSubmitting: form.formState.isSubmitting || isUploading,
  };
};
