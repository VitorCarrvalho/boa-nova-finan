import React from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';

const InstagramWidget = () => {
  const instagramHandle = '@categraliptmoficial';
  const instagramUrl = 'https://www.instagram.com/categraliptmoficial/';

  const abrirInstagram = () => {
    window.open(instagramUrl, '_blank');
  };

  return (
    <WidgetContainer className="flex flex-col min-h-[140px]" onClick={abrirInstagram}>
      <div className="flex items-center gap-2 mb-3">
        <Instagram className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Instagram</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">{instagramHandle}</p>
          <p className="text-xs text-muted-foreground">Acompanhe nossas atividades e momentos especiais</p>
        </div>
        
        <Button variant="outline" size="sm" className="mt-3 w-fit">
          <ExternalLink className="w-3 h-3 mr-1" />
          Ver perfil
        </Button>
      </div>
    </WidgetContainer>
  );
};

export default InstagramWidget;