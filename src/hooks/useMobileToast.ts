import React from 'react';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const useMobileToast = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const showMobileToast = ({
    title,
    description,
    variant = 'default',
    duration = isMobile ? 2000 : 5000
  }: MobileToastProps) => {
    toast({
      title,
      description,
      variant,
      duration,
      className: cn(
        isMobile && [
          'bottom-20 left-4 right-4 max-w-none w-auto',
          'data-[state=open]:animate-slide-up',
          'data-[state=closed]:animate-slide-down'
        ]
      ),
    });
  };

  return { showMobileToast };
};

export { useMobileToast };