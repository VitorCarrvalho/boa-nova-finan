import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

const WidgetContainer = ({ children, className, size = 'medium', onClick }: WidgetContainerProps) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1 min-h-[120px]',
    medium: 'col-span-2 row-span-1 min-h-[120px]',
    large: 'col-span-3 row-span-2 min-h-[250px]'
  };

  return (
    <div
      className={cn(
        'bg-background/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/20',
        'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
        'animate-in fade-in-50 duration-500',
        sizeClasses[size],
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