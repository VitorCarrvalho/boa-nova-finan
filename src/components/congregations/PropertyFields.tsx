
import React from 'react';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CurrencyInput } from '@/components/ui/currency-input';

interface PropertyFieldsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  hasOwnProperty: boolean;
}

const PropertyFields: React.FC<PropertyFieldsProps> = ({ register, watch, setValue, hasOwnProperty }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="has_own_property"
          {...register('has_own_property')}
        />
        <Label htmlFor="has_own_property">Possui imóvel próprio</Label>
      </div>

      {!hasOwnProperty && (
        <div>
          <Label htmlFor="rent_value">Valor do Aluguel</Label>
          <CurrencyInput
            id="rent_value"
            value={watch('rent_value') || 0}
            onChange={(value) => setValue('rent_value', value)}
            placeholder="0,00"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          {...register('is_active')}
        />
        <Label htmlFor="is_active">Congregação ativa</Label>
      </div>
    </div>
  );
};

export default PropertyFields;
