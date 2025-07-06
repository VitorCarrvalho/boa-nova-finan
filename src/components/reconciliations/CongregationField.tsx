
import React from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CongregationFieldProps {
  isPastor: boolean;
  availableCongregations: Array<{ id: string; name: string }>;
  defaultCongregationId: string;
  setValue: UseFormSetValue<any>;
  errors: any;
}

const CongregationField: React.FC<CongregationFieldProps> = ({
  isPastor,
  availableCongregations,
  defaultCongregationId,
  setValue,
  errors
}) => {
  const [selectedCongregation, setSelectedCongregation] = React.useState(defaultCongregationId);

  React.useEffect(() => {
    if (defaultCongregationId) {
      setSelectedCongregation(defaultCongregationId);
      setValue('congregation_id', defaultCongregationId);
    }
  }, [defaultCongregationId, setValue]);

  // For pastors with multiple congregations, show dropdown
  // For pastors with only one congregation, show read-only field
  const showDropdown = isPastor && availableCongregations.length > 1;
  const showReadOnly = isPastor && availableCongregations.length === 1;

  const handleCongregationChange = (value: string) => {
    setSelectedCongregation(value);
    setValue('congregation_id', value);
  };

  return (
    <div>
      <Label htmlFor="congregation_id">Congregação *</Label>
      {showDropdown ? (
        <Select 
          onValueChange={handleCongregationChange} 
          value={selectedCongregation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a congregação" />
          </SelectTrigger>
          <SelectContent>
            {availableCongregations.map((congregation) => (
              <SelectItem key={congregation.id} value={congregation.id}>
                {congregation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : showReadOnly ? (
        <Input
          value={availableCongregations.find(c => c.id === selectedCongregation)?.name || 'Nenhuma congregação atribuída'}
          readOnly
          className="bg-gray-100"
        />
      ) : (
        <Select 
          onValueChange={handleCongregationChange} 
          value={selectedCongregation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma congregação" />
          </SelectTrigger>
          <SelectContent>
            {availableCongregations.map((congregation) => (
              <SelectItem key={congregation.id} value={congregation.id}>
                {congregation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {errors.congregation_id && <p className="text-red-500 text-sm mt-1">Congregação é obrigatória</p>}
    </div>
  );
};

export default CongregationField;
