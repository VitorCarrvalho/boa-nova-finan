import React from 'react';
import { Calendar, Clock, MapPin, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { useHomeEvents } from '@/hooks/useHomeEvents';
import { Skeleton } from '@/components/ui/skeleton';

const ProximosEventosWidget = () => {
  const { data: events, isLoading } = useHomeEvents();

  const shareEvent = (event: any) => {
    const message = `🎉 *${event.title}*\n\n📅 ${format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })}\n⏰ ${event.time || 'Horário a definir'}\n📍 ${event.location || 'Local a definir'}\n\n${event.description || ''}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <WidgetContainer size="large" className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Próximos Eventos</h3>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer size="large" className="flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Próximos Eventos</h3>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto">
        {events && events.length > 0 ? (
          events.slice(0, 5).map((event) => (
            <div key={event.id} className="p-3 bg-muted/50 rounded-lg border border-border/10">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(event.date), 'dd/MM', { locale: ptBR })}</span>
                    {event.time && <span>• {event.time}</span>}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => shareEvent(event)}
                  className="shrink-0"
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento programado</p>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};

export default ProximosEventosWidget;