
import React from 'react';
import { MapPin, Navigation, Home } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';

const MapaWidget = () => {
  const endereco = 'Rua João Vicente, 741 - Osvaldo Cruz - RJ';
  const cep = '21340-020';

  const abrirMapa = () => {
    const query = encodeURIComponent(`${endereco}, ${cep}`);
    
    // Detectar se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // No mobile, tentar Waze primeiro, depois fallback para GPS nativo
      const wazeUrl = `https://waze.com/ul?q=${query}`;
      const geoUrl = `geo:0,0?q=${query}`;
      
      // Tentar abrir o Waze
      const wazeWindow = window.open(wazeUrl, '_blank');
      
      // Se não conseguir abrir o Waze, usar GPS nativo após um delay
      setTimeout(() => {
        if (!wazeWindow || wazeWindow.closed) {
          window.open(geoUrl, '_blank');
        }
      }, 1000);
    } else {
      // No desktop, abrir Google Maps
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <WidgetContainer variant="mapa" className="flex flex-col min-h-[160px]" onClick={abrirMapa}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-white widget-icon" />
          <h3 className="widget-title text-white text-lg">🏛️ Nossa Igreja</h3>
        </div>
        <Home className="w-5 h-5 text-red-200 animate-pulse" />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white font-medium">📍 Rua João Vicente, 741</p>
          <p className="text-red-100 text-sm">Osvaldo Cruz - Rio de Janeiro</p>
          <p className="text-red-200 text-xs font-mono bg-white/20 px-2 py-1 rounded-full w-fit">
            CEP: {cep}
          </p>
        </div>
        
        <Button variant="ghost" size="sm" className="mt-3 w-fit text-white hover:bg-white/20 border border-white/30">
          <Navigation className="w-3 h-3 mr-2" />
          🗺️ Como chegar
        </Button>
      </div>
    </WidgetContainer>
  );
};

export default MapaWidget;
