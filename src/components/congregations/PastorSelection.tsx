
import React from 'react';
import { Label } from '@/components/ui/label';
import { useMembers } from '@/hooks/useMemberData';
import type { Database } from '@/integrations/supabase/types';

type Member = Database['public']['Tables']['members']['Row'];

interface PastorSelectionProps {
  selectedPastorIds: string[];
  onPastorToggle: (pastorId: string) => void;
}

const PastorSelection: React.FC<PastorSelectionProps> = ({
  selectedPastorIds,
  onPastorToggle,
}) => {
  const { data: members = [] } = useMembers();
  const pastors = members.filter(member => member.role === 'pastor');

  const getSelectedPastorNames = () => {
    if (!selectedPastorIds || selectedPastorIds.length === 0) return [];
    return pastors.filter(pastor => selectedPastorIds.includes(pastor.id));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Pastores Responsáveis</Label>
        <div className="mt-2 space-y-2">
          {pastors.length > 0 ? (
            pastors.map((pastor) => (
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
                </label>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Nenhum pastor encontrado</p>
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
