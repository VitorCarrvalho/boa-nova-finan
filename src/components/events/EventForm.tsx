
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useEventForm } from './hooks/useEventForm';
import BasicEventFields from './components/BasicEventFields';
import type { Database } from '@/integrations/supabase/types';

type ChurchEvent = Database['public']['Tables']['church_events']['Row'];

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  event?: ChurchEvent | null;
}

const EventForm = ({ isOpen, onClose, event }: EventFormProps) => {
  const { form, onSubmit, isSubmitting } = useEventForm({ event, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicEventFields control={form.control} />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : event ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
