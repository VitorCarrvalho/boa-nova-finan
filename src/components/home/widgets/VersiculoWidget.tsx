import React from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { useVersiculoDia } from '@/hooks/useVersiculoDia';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const VersiculoWidget = () => {
  const { data: versiculo, isLoading, refetch } = useVersiculoDia();

  if (isLoading) {
    return (
      <WidgetContainer size="large" className="flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Versículo do Dia</h3>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer size="large" className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Versículo do Dia</h3>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      {versiculo ? (
        <div className="flex-1 flex flex-col justify-center">
          <blockquote className="text-foreground leading-relaxed mb-4 italic">
            "{versiculo.text}"
          </blockquote>
          <cite className="text-sm font-medium text-primary text-right">
            {versiculo.reference}
          </cite>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">Não foi possível carregar o versículo</p>
        </div>
      )}
    </WidgetContainer>
  );
};

export default VersiculoWidget;