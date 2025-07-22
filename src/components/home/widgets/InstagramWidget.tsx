
import React from 'react';
import { Instagram, ExternalLink, Camera } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';

const InstagramWidget = () => {
  const instagramHandle = '@catedraliptmoficial';
  const instagramUrl = 'https://www.instagram.com/catedraliptmoficial/';

  const abrirInstagram = () => {
    window.open(instagramUrl, '_blank');
  };

  return (
    <WidgetContainer variant="instagram" className="flex flex-col min-h-[140px]" onClick={abrirInstagram}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Instagram className="w-6 h-6 text-white widget-icon" />
          <h3 className="widget-title text-white text-lg">Instagram</h3>
        </div>
        <Camera className="w-5 h-5 text-pink-200 animate-pulse" />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-white font-medium">{instagramHandle}</p>
          <p className="text-pink-100 text-xs mt-1">Acompanhe nossos momentos especiais</p>
        </div>
        
        <Button variant="ghost" size="sm" className="mt-3 w-fit text-white hover:bg-white/20 border border-white/30">
          <ExternalLink className="w-3 h-3 mr-2" />
          Ver perfil
        </Button>
      </div>
    </WidgetContainer>
  );
};

export default InstagramWidget;
