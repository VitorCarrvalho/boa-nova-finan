import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileLoadingSkeletonProps {
  type?: 'card' | 'table' | 'form' | 'chart' | 'dashboard';
  count?: number;
  className?: string;
}

const MobileLoadingSkeleton: React.FC<MobileLoadingSkeletonProps> = ({
  type = 'card',
  count = 3,
  className = ''
}) => {
  const isMobile = useIsMobile();

  const renderCardSkeleton = () => (
    <Card className={cn('w-full', className)}>
      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
        <div className="flex items-start gap-3">
          <Skeleton className={cn('rounded-full', isMobile ? 'h-8 w-8' : 'h-6 w-6')} />
          <div className="flex-1 space-y-2">
            <Skeleton className={cn('h-4 w-3/4', isMobile && 'h-5')} />
            <Skeleton className={cn('h-6 w-1/2', isMobile && 'h-7')} />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
        {isMobile && (
          <div className="flex gap-2 mt-4 pt-3 border-t">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className={isMobile ? 'p-4' : 'p-6'}>
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <Card className={className}>
      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className={cn('h-10 w-full', isMobile && 'h-12')} />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <Skeleton className={cn('h-10 flex-1', isMobile && 'h-12')} />
            <Skeleton className={cn('h-10 flex-1', isMobile && 'h-12')} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderChartSkeleton = () => (
    <Card className={className}>
      <CardContent className={isMobile ? 'p-4' : 'p-6'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className={cn('w-full', isMobile ? 'h-48' : 'h-64')} />
          {isMobile && (
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className={cn('h-8 w-1/3', isMobile && 'h-6')} />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Quick Actions Mobile */}
      {isMobile && (
        <div className="space-y-3">
          <Skeleton className="h-5 w-1/4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className={cn(
        'grid gap-3',
        isMobile ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
      )}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className={isMobile ? 'p-4' : 'p-6'}>
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 flex-1" />
              </div>
              <Skeleton className={cn('h-6 w-2/3 mb-2', isMobile && 'h-8')} />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className={cn(
        'grid gap-6',
        isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
      )}>
        <Skeleton className={cn('w-full', isMobile ? 'h-64' : 'h-80')} />
        <Skeleton className={cn('w-full', isMobile ? 'h-64' : 'h-80')} />
      </div>
    </div>
  );

  switch (type) {
    case 'table':
      return isMobile ? renderTableSkeleton() : renderCardSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'chart':
      return renderChartSkeleton();
    case 'dashboard':
      return renderDashboardSkeleton();
    default:
      return (
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i}>
              {renderCardSkeleton()}
            </div>
          ))}
        </div>
      );
  }
};

export { MobileLoadingSkeleton };