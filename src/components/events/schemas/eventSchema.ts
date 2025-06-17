
import * as z from 'zod';

export const eventSchema = z.object({
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

export type EventFormData = z.infer<typeof eventSchema>;

export const eventTypes = [
  { value: 'culto', label: 'Culto' },
  { value: 'conferencia', label: 'Conferência' },
  { value: 'reuniao', label: 'Reunião' },
  { value: 'evento_especial', label: 'Evento Especial' }
];
