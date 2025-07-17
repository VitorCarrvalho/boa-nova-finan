import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHomeEvents = () => {
  return useQuery({
    queryKey: ['home-events'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('church_events')
        .select(`
          *,
          profiles!church_events_organizer_id_fkey(name)
        `)
        .eq('is_active', true)
        .gte('date', today)
        .order('date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar eventos:', error);
        throw error;
      }

      // Mapear eventos com nome do organizador e embaralhar a ordem
      const eventsWithOrganizer = (data || []).map(event => ({
        ...event,
        organizer_name: event.profiles?.name || null
      }));

      // Embaralhar os eventos aleatoriamente
      const shuffledEvents = eventsWithOrganizer.sort(() => Math.random() - 0.5);

      return shuffledEvents;
    },
  });
};