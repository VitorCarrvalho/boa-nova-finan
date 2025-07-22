
import React from 'react';
import { BookOpen, RefreshCw, Heart } from 'lucide-react';
import WidgetContainer from './WidgetContainer';
import { useVersiculoDia, useRefreshVerse } from '@/hooks/useVersiculoDia';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';

const VersiculoWidget = () => {
  const { data: versiculo, isLoading, refetch } = useVersiculoDia();
  const { forceRefresh } = useRefreshVerse();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    try {
      console.log('🔄 Botão de refresh clicado');
      
      // Buscar novo versículo forçadamente
      const newVerse = await forceRefresh();
      
      // Atualizar o cache do react-query
      queryClient.setQueryData(['versiculo-dia'], newVerse);
      
      console.log('✅ Versículo atualizado:', newVerse.reference);
    } catch (error) {
      console.error('❌ Erro ao atualizar versículo:', error);
      // Fallback para refetch normal
      refetch();
    }
  };

  if (isLoading) {
    return (
      <WidgetContainer variant="versiculo" className="flex flex-col min-h-[140px]">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-white widget-icon" />
          <h3 className="widget-title text-white text-lg">📖 Versículo do Dia</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-white/20 rounded p-3 h-20" />
          <div className="bg-white/10 rounded h-4 w-32" />
        </div>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer variant="versiculo" className="flex flex-col min-h-[140px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-white widget-icon" />
          <h3 className="widget-title text-white text-lg">📖 Versículo</h3>
        </div>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleRefresh}
          className="text-purple-200 hover:text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      {versiculo ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-3">
            <blockquote className="text-white leading-relaxed italic text-sm">
              "✨ {versiculo.text}"
            </blockquote>
          </div>
          <cite className="text-sm font-medium text-purple-200 text-right flex items-center justify-end gap-1">
            <Heart className="w-3 h-3" />
            {versiculo.reference}
          </cite>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-purple-200">
          <p className="text-sm">Não foi possível carregar o versículo</p>
        </div>
      )}
    </WidgetContainer>
  );
};

export default VersiculoWidget;
