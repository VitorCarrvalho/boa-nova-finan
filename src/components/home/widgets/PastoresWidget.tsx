
import React from 'react';
import { Crown } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

const PastoresWidget = () => {
  const pastoresImageUrl = 'https://jryifbcsifodvocshvuo.supabase.co/storage/v1/object/sign/pictures-default/pastores.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NmEyNTZjNy01ZjYzLTQ4Y2QtYjEzMS1jY2RkNzQ2Y2ZmY2QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlcy1kZWZhdWx0L3Bhc3RvcmVzLmpwZWciLCJpYXQiOjE3NTMxMzc3OTAsImV4cCI6MjA2ODQ5Nzc5MH0.l8sCUSEqGQReWF88xoBKi3ug3ypxb9khKpn2QWvH8f0';

  return (
    <WidgetContainer variant="glass" className="p-1 min-h-[280px] overflow-hidden relative">
      {/* Badge decorativo */}
      <div className="absolute top-3 right-3 z-20 bg-white/30 backdrop-blur-sm rounded-full p-2">
        <Crown className="w-5 h-5 text-amber-600 widget-icon" />
      </div>
      

      {/* Imagem com overlay */}
      <div className="relative h-full rounded-xl overflow-hidden">
        <img 
          src={pastoresImageUrl} 
          alt="Pastores IPTM Global" 
          className="w-full h-full object-cover min-h-[260px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
      </div>
    </WidgetContainer>
  );
};

export default PastoresWidget;
