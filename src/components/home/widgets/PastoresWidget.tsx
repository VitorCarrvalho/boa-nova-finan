
import React from 'react';
import WidgetContainer from './WidgetContainer';

const PastoresWidget = () => {
  const pastoresImageUrl = 'https://jryifbcsifodvocshvuo.supabase.co/storage/v1/object/sign/pictures-default/pastores.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NmEyNTZjNy01ZjYzLTQ4Y2QtYjEzMS1jY2RkNzQ2Y2ZmY2QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwaWN0dXJlcy1kZWZhdWx0L3Bhc3RvcmVzLmpwZWciLCJpYXQiOjE3NTMxMzc3OTAsImV4cCI6MjA2ODQ5Nzc5MH0.l8sCUSEqGQReWF88xoBKi3ug3ypxb9khKpn2QWvH8f0';

  return (
    <WidgetContainer className="p-1 min-h-[280px] overflow-hidden">
      <img 
        src={pastoresImageUrl} 
        alt="Pastores IPTM Global" 
        className="w-full h-full rounded-xl object-cover min-h-[260px]"
      />
    </WidgetContainer>
  );
};

export default PastoresWidget;
