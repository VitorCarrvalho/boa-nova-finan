
import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  variant?: 'pastores' | 'eventos' | 'calendario' | 'versiculo' | 'mapa' | 'instagram' | 'oracao' | 'glass' | 'default';
}

const WidgetContainer = ({ 
  children, 
  className, 
  size = 'medium', 
  onClick, 
  variant = 'glass' 
}: WidgetContainerProps) => {
  
  const variantClasses = {
    pastores: 'widget-pastores text-white',
    eventos: 'widget-eventos text-white',
    calendario: 'widget-calendario text-white',
    versiculo: 'widget-versiculo text-white',
    mapa: 'widget-mapa text-white',
    instagram: 'widget-instagram text-white',
    oracao: 'widget-oracao text-white',
    glass: 'widget-glass text-slate-700',
    default: 'bg-background/80 backdrop-blur-sm'
  };

  return (
    <div
      className={cn(
        'widget-container rounded-2xl p-4 shadow-lg border border-border/20',
        'transition-all duration-300 hover:shadow-xl',
        'min-h-[120px] w-full',
        'relative overflow-hidden',
        variantClasses[variant],
        onClick && 'cursor-pointer mobile-tap',
        className
      )}
      onClick={onClick}
      style={{
        animationFillMode: 'both'
      }}
    >
      {/* Overlay para melhor contraste de texto quando necessário */}
      {variant !== 'default' && variant !== 'glass' && (
        <div className="absolute inset-0 bg-black/10 rounded-2xl pointer-events-none" />
      )}
      
      {/* Conteúdo */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default WidgetContainer;
