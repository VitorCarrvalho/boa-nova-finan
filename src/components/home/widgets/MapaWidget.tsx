import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';

const MapaWidget = () => {
  const endereco = 'Rua João Vicente, 741 - Osvaldo Cruz - RJ';
  const cep = '21340-020';

  const abrirMapa = () => {
    const query = encodeURIComponent(`${endereco}, ${cep}`);
    
    // Detectar se é dispositivo móvel para escolher o app
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Tentar abrir o app de GPS padrão
      window.open(`geo:0,0?q=${query}`, '_blank');
    } else {
      // No desktop, abrir Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <WidgetContainer className="flex flex-col min-h-[160px]" onClick={abrirMapa}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Nossa Igreja</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Rua João Vicente, 741</p>
          <p className="text-xs text-muted-foreground">Osvaldo Cruz - RJ</p>
          <p className="text-xs text-muted-foreground">CEP: {cep}</p>
        </div>
        
        <Button variant="outline" size="sm" className="mt-3 w-fit">
          <Navigation className="w-3 h-3 mr-1" />
          Como chegar
        </Button>
      </div>
    </WidgetContainer>
  );
};

export default MapaWidget;