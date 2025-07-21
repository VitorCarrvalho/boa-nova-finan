import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const WidgetContainer = ({ children, className, size = 'medium', onClick }: WidgetContainerProps) => {
  // Remover as classes de grid específicas para permitir layout flexível
  return (
    <div
      className={cn(
        'bg-background/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/20',
        'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
        'animate-in fade-in-50 duration-500',
        'min-h-[120px] w-full', // Usar altura mínima e largura total
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default WidgetContainer;