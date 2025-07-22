
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import WidgetContainer from './WidgetContainer';

const CalendarioWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, []);

  return (
    <WidgetContainer variant="calendario" className="flex flex-col items-center justify-center text-center min-h-[140px]">
      <CalendarIcon className="w-8 h-8 text-white mb-3 widget-icon" />
      <div className="space-y-1">
        <h3 className="widget-title text-white text-lg font-bold">
          {format(currentDate, 'EEEE', { locale: ptBR })}
        </h3>
        <p className="text-3xl font-bold text-white drop-shadow-lg">
          {format(currentDate, 'dd', { locale: ptBR })}
        </p>
        <p className="text-sm text-green-100">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <p className="text-xs text-green-200 font-mono bg-white/20 px-2 py-1 rounded-full">
          {format(currentDate, 'HH:mm', { locale: ptBR })}
        </p>
      </div>
    </WidgetContainer>
  );
};

export default CalendarioWidget;
