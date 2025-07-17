import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileDashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MobileDashboardCard: React.FC<MobileDashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  onClick,
  className = '',
  size = 'md'
}) => {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const valueSizes = {
    sm: 'text-lg',
    md: isMobile ? 'text-2xl' : 'text-xl',
    lg: isMobile ? 'text-3xl' : 'text-2xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: isMobile ? 'h-6 w-6' : 'h-5 w-5',
    lg: isMobile ? 'h-8 w-8' : 'h-6 w-6'
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md active:scale-95',
        isMobile && 'touch-manipulation',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={sizeClasses[size]}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={cn(iconSizes[size], 'text-muted-foreground')} />
              <p className={cn(
                'font-medium truncate',
                isMobile ? 'text-sm' : 'text-xs',
                'text-muted-foreground'
              )}>
                {title}
              </p>
              {badge && (
                <Badge variant={badge.variant} className="ml-auto shrink-0">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            <div className="space-y-1">
              <p className={cn(
                'font-bold tracking-tight',
                valueSizes[size]
              )}>
                {value}
              </p>
              
              {(description || trend) && (
                <div className="flex items-center gap-2">
                  {description && (
                    <p className={cn(
                      'text-muted-foreground',
                      isMobile ? 'text-xs' : 'text-xs'
                    )}>
                      {description}
                    </p>
                  )}
                  {trend && (
                    <span className={cn(
                      'text-xs font-medium flex items-center',
                      trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MobileDashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  gap?: 'sm' | 'md' | 'lg';
}

const MobileDashboardGrid: React.FC<MobileDashboardGridProps> = ({
  children,
  columns = 2,
  gap = 'md'
}) => {
  const isMobile = useIsMobile();

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4'
  };

  const gridCols = isMobile ? 'grid-cols-1' : `grid-cols-${columns}`;

  return (
    <div className={cn(
      'grid',
      gridCols,
      'sm:grid-cols-2',
      'lg:grid-cols-4',
      gapClasses[gap]
    )}>
      {children}
    </div>
  );
};

interface MobileQuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline';
  disabled?: boolean;
}

const MobileQuickAction: React.FC<MobileQuickActionProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  variant = 'outline',
  disabled = false
}) => {
  const isMobile = useIsMobile();

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-auto p-4 justify-start text-left',
        isMobile && 'min-h-[80px] active:scale-95',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <Icon className={cn(
          isMobile ? 'h-6 w-6' : 'h-5 w-5',
          'shrink-0'
        )} />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium',
            isMobile ? 'text-base' : 'text-sm'
          )}>
            {title}
          </p>
          <p className={cn(
            'text-muted-foreground text-left',
            isMobile ? 'text-sm' : 'text-xs'
          )}>
            {description}
          </p>
        </div>
      </div>
    </Button>
  );
};

export {
  MobileDashboardCard,
  MobileDashboardGrid,
  MobileQuickAction
};