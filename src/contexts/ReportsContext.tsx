
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ReportsFilters {
  period: string;
  status: string;
  paymentMethod: string;
  selectedCongregations: string[];
}

interface ReportsContextType {
  filters: ReportsFilters;
  setFilters: (filters: ReportsFilters) => void;
  applyFilters: () => void;
  isFiltersApplied: boolean;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReportsFilters = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReportsFilters must be used within a ReportsProvider');
  }
  return context;
};

interface ReportsProviderProps {
  children: ReactNode;
}

export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<ReportsFilters>({
    period: 'all',
    status: 'all',
    paymentMethod: 'all',
    selectedCongregations: []
  });
  
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    setIsFiltersApplied(true);
    // Force re-render of components that use this context
  };

  return (
    <ReportsContext.Provider value={{
      filters,
      setFilters,
      applyFilters,
      isFiltersApplied
    }}>
      {children}
    </ReportsContext.Provider>
  );
};
