import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PerformanceMetrics {
  isSlowDevice: boolean;
  connectionType: string;
  deviceMemory: number;
  reducedMotion: boolean;
  batteryLevel?: number;
  isCharging?: boolean;
}

export const usePerformanceOptimization = () => {
  const isMobile = useIsMobile();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isSlowDevice: false,
    connectionType: 'unknown',
    deviceMemory: 4,
    reducedMotion: false,
  });

  useEffect(() => {
    const updateMetrics = () => {
      // Check device memory
      const deviceMemory = (navigator as any).deviceMemory || 4;
      
      // Check connection
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const connectionType = connection?.effectiveType || 'unknown';
      
      // Check for reduced motion preference
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Determine if device is slow based on memory and connection
      const isSlowDevice = deviceMemory < 2 || ['slow-2g', '2g'].includes(connectionType);

      setMetrics({
        isSlowDevice,
        connectionType,
        deviceMemory,
        reducedMotion,
      });
    };

    updateMetrics();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateMetrics);
      return () => connection.removeEventListener('change', updateMetrics);
    }
  }, []);

  useEffect(() => {
    // Get battery info if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          setMetrics(prev => ({
            ...prev,
            batteryLevel: battery.level,
            isCharging: battery.charging,
          }));
        };

        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      });
    }
  }, []);

  const shouldUseOptimizations = () => {
    return metrics.isSlowDevice || 
           metrics.batteryLevel && metrics.batteryLevel < 0.2 || 
           ['slow-2g', '2g'].includes(metrics.connectionType);
  };

  const getOptimizedSettings = () => {
    const baseSettings = {
      enableAnimations: !metrics.reducedMotion,
      enableTransitions: !metrics.reducedMotion,
      lazyLoadImages: true,
      virtualScrolling: isMobile,
    };

    if (shouldUseOptimizations()) {
      return {
        ...baseSettings,
        enableAnimations: false,
        enableTransitions: false,
        lazyLoadImages: true,
        virtualScrolling: true,
        reducedImageQuality: true,
        limitChartsData: true,
        enableDebouncing: true,
      };
    }

    return baseSettings;
  };

  return {
    metrics,
    isMobile,
    shouldUseOptimizations: shouldUseOptimizations(),
    settings: getOptimizedSettings(),
  };
};