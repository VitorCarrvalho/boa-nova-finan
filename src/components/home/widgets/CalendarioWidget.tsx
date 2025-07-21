import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
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
    <WidgetContainer size="medium" className="flex flex-col items-center justify-center text-center">
      <Calendar className="w-8 h-8 text-primary mb-2" />
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">
          {format(currentDate, 'EEEE', { locale: ptBR })}
        </h3>
        <p className="text-2xl font-bold text-primary">
          {format(currentDate, 'dd', { locale: ptBR })}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <p className="text-xs text-muted-foreground">
          {format(currentDate, 'HH:mm', { locale: ptBR })}
        </p>
      </div>
    </WidgetContainer>
  );
};

export default CalendarioWidget;