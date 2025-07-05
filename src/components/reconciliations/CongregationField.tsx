
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
  React.useEffect(() => {
    if (defaultCongregationId) {
      setValue('congregation_id', defaultCongregationId);
    }
  }, [defaultCongregationId, setValue]);

  return (
    <div>
      <Label htmlFor="congregation_id">Congregação *</Label>
      {isPastor ? (
        <Input
          value={availableCongregations.find(c => c.id === defaultCongregationId)?.name || 'Nenhuma congregação atribuída'}
          readOnly
          className="bg-gray-100"
        />
      ) : (
        <Select 
          onValueChange={(value) => setValue('congregation_id', value)} 
          defaultValue={defaultCongregationId}
          value={defaultCongregationId}
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
