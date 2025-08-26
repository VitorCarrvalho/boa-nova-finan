import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  type?: 'cards' | 'filters' | 'featured';
  count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'cards', 
  count = 8 
}) => {
  if (type === 'filters') {
    return (
      <div className="bg-slate-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'featured') {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-5" />
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-8 text-center border border-yellow-200">
          <Skeleton className="h-12 w-12 mx-auto mb-4" />
          <Skeleton className="h-6 w-40 mx-auto mb-2" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;