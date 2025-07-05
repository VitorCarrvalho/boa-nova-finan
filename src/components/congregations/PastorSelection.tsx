
import React from 'react';
import { Label } from '@/components/ui/label';
import { useSystemPastors } from '@/hooks/useSystemUsers';

interface PastorSelectionProps {
  selectedPastorIds: string[];
  onPastorToggle: (pastorId: string) => void;
}

const PastorSelection: React.FC<PastorSelectionProps> = ({
  selectedPastorIds,
  onPastorToggle,
}) => {
  const { data: systemPastors = [], isLoading } = useSystemPastors();

  const getSelectedPastorNames = () => {
    if (!selectedPastorIds || selectedPastorIds.length === 0) return [];
    return systemPastors.filter(pastor => selectedPastorIds.includes(pastor.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Label>Pastores Responsáveis</Label>
        <div className="mt-2">
          <p className="text-gray-500 text-sm">Carregando pastores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Pastores Responsáveis</Label>
        <div className="mt-2 space-y-2">
          {systemPastors.length > 0 ? (
            systemPastors.map((pastor) => (
              <div key={pastor.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`pastor-${pastor.id}`}
                  checked={selectedPastorIds?.includes(pastor.id) || false}
                  onChange={() => onPastorToggle(pastor.id)}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`pastor-${pastor.id}`} className="text-sm">
                  {pastor.name} {pastor.email && `(${pastor.email})`}
                  <span className="text-xs text-gray-500 ml-2">
                    - {pastor.role === 'pastor' ? 'Pastor' : pastor.role === 'admin' ? 'Admin' : 'Finance'}
                  </span>
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">
              Nenhum pastor com acesso ao sistema encontrado
            </p>
          )}
        </div>
        
        {/* Show selected pastors */}
        {getSelectedPastorNames().length > 0 && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700 mb-2">Pastores Selecionados:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {getSelectedPastorNames().map((pastor) => (
                <li key={pastor.id}>
                  • {pastor.name} {pastor.email && `(${pastor.email})`}
                  <span className="text-xs text-gray-500 ml-2">
                    - {pastor.role === 'pastor' ? 'Pastor' : pastor.role === 'admin' ? 'Admin' : 'Finance'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastorSelection;
