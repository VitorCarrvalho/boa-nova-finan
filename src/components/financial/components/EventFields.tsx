
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FinancialFormData } from '../hooks/useFinancialForm';

interface EventFieldsProps {
  formData: FinancialFormData;
  setFormData: React.Dispatch<React.SetStateAction<FinancialFormData>>;
}

export const EventFields: React.FC<EventFieldsProps> = ({ formData, setFormData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="event_type">Tipo de Evento</Label>
        <Input
          id="event_type"
          placeholder="Culto, Conferência, etc."
          value={formData.event_type}
          onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_date">Data do Evento</Label>
        <Input
          id="event_date"
          type="date"
          value={formData.event_date}
          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendees">Participantes</Label>
        <Input
          id="attendees"
          type="number"
          placeholder="Número de participantes"
          value={formData.attendees}
          onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
        />
      </div>
    </div>
  );
};
