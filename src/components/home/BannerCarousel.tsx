import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type ChurchEvent = Database['public']['Tables']['church_events']['Row'] & {
  organizer_name?: string;
};

type BannerItem = ChurchEvent | {
  id: string;
  banner_image_url?: string;
};

interface BannerCarouselProps {
  events: ChurchEvent[];
  defaultBannerUrl?: string;
}

const BannerCarousel = ({ events, defaultBannerUrl }: BannerCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Usar banner padrão se não houver eventos
  const bannerItems: BannerItem[] = events.length > 0 ? events : [{ id: 'default', banner_image_url: defaultBannerUrl }];
  
  useEffect(() => {
    if (isPaused || bannerItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [bannerItems.length, isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerItems.length);
  };

  const handleBannerClick = (item: BannerItem) => {
    if (item.id === 'default') {
      // Mostrar detalhes da igreja no banner padrão
      setSelectedEvent({
        id: 'church-info',
        title: 'Primeira Igreja Batista',
        description: 'Bem-vindos à nossa comunidade de fé!',
        date: '',
        time: '',
        location: 'Rua da Igreja, 123 - Centro',
        notes: 'Cultos: Domingo 09:00 e 19:00\nQuarta-feira 19:30\nPastor Responsável: Pastor João Silva',
        type: 'culto' as any,
        created_at: '',
        updated_at: '',
        organizer_id: null,
        max_attendees: null,
        current_attendees: null,
        is_active: true,
        banner_image_url: null
      });
    } else {
      setSelectedEvent(item as ChurchEvent);
    }
  };

  const shareEvent = (event: ChurchEvent) => {
    const eventDate = event.date ? format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : '';
    const eventTime = event.time || '';
    
    const message = `🙏 *${event.title}* 🙏\n\n` +
                   `📅 Data: ${eventDate}\n` +
                   `⏰ Horário: ${eventTime}\n` +
                   `📍 Local: ${event.location || 'A definir'}\n\n` +
                   `${event.description || ''}\n\n` +
                   `Venha participar conosco! 🙌`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const currentItem = bannerItems[currentIndex];

  return (
    <div className="relative w-full h-96 md:h-[600px] overflow-hidden rounded-lg">
      {/* Banner Principal */}
      <div 
        className="w-full h-full bg-cover bg-center transition-all duration-500 cursor-pointer relative"
        style={{ 
          backgroundImage: `url(${currentItem.banner_image_url || defaultBannerUrl})` 
        }}
        onClick={() => handleBannerClick(currentItem)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Informações do Evento (apenas se não for o banner padrão) */}
        {currentItem.id !== 'default' && 'title' in currentItem && (
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm">
              <h2 className="text-2xl md:text-4xl font-bold mb-2">{currentItem.title}</h2>
              <div className="flex flex-col md:flex-row gap-2 text-sm md:text-base">
                {currentItem.date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(currentItem.date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
                {currentItem.time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentItem.time}
                  </div>
                )}
                {currentItem.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {currentItem.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de Navegação */}
      {bannerItems.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={handlePrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 text-white hover:bg-white/30"
            onClick={handleNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Indicadores */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerItems.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEvent?.description && (
              <p className="text-muted-foreground">{selectedEvent.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedEvent?.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>{format(new Date(selectedEvent.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
              )}
              
              {selectedEvent?.time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>{selectedEvent.time}</span>
                </div>
              )}
              
              {selectedEvent?.location && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            {selectedEvent?.notes && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Informações Adicionais:</h4>
                  <div className="whitespace-pre-line text-sm">{selectedEvent.notes}</div>
                </CardContent>
              </Card>
            )}

            {selectedEvent?.id !== 'church-info' && (
              <div className="flex justify-end">
                <Button
                  onClick={() => shareEvent(selectedEvent!)}
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar no WhatsApp
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerCarousel;