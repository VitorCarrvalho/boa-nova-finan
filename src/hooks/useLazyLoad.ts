import React, { useEffect, useRef, useState } from 'react';

interface IntersectionOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options: IntersectionOptions = {}
) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, threshold, rootMargin, enabled]);

  return elementRef;
};

export const useLazyLoad = (enabled: boolean = true) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useIntersectionObserver(
    (isIntersecting) => {
      if (isIntersecting) {
        setIsVisible(true);
      }
    },
    { enabled }
  );

  return { ref, isVisible };
};