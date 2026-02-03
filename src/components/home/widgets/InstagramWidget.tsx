import React from 'react';
import { Instagram, ExternalLink, Camera } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/contexts/TenantContext';

const InstagramWidget = () => {
  const { homeConfig } = useTenant();
  const instagramHandle = homeConfig.instagram?.handle || '@igrejamoove';
  const instagramUrl = homeConfig.instagram?.url || 'https://instagram.com/igrejamoove';

  const abrirInstagram = () => {
    window.open(instagramUrl, '_blank');
  };

  return (
    <WidgetContainer variant="glass" className="flex flex-col min-h-[140px]" onClick={abrirInstagram}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Instagram className="w-6 h-6 text-pink-600 widget-icon" />
          <h3 className="widget-title text-slate-700 text-lg">Instagram</h3>
        </div>
        <Camera className="w-5 h-5 text-pink-500 animate-pulse" />
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="bg-slate-100/60 backdrop-blur-sm rounded-lg p-3">
          <p className="text-slate-800 font-medium">{instagramHandle}</p>
          <p className="text-slate-600 text-xs mt-1">Acompanhe nossos momentos especiais</p>
        </div>
        
        <Button variant="ghost" size="sm" className="mt-3 w-fit text-slate-700 hover:bg-slate-200/50 border border-slate-300/50">
          <ExternalLink className="w-3 h-3 mr-2" />
          Ver perfil
        </Button>
      </div>
    </WidgetContainer>
  );
};

export default InstagramWidget;
