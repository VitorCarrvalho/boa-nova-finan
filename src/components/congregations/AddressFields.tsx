
import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressFieldsProps {
  register: UseFormRegister<any>;
}

const AddressFields: React.FC<AddressFieldsProps> = ({ register }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Endereço</h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            {...register('cep')}
            placeholder="00000-000"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="street">Rua</Label>
          <Input
            id="street"
            {...register('street')}
            placeholder="Nome da rua"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <Label htmlFor="number">Número</Label>
          <Input
            id="number"
            {...register('number')}
            placeholder="123"
          />
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Cidade"
          />
        </div>

        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="SP"
          />
        </div>

        <div>
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            {...register('complement')}
            placeholder="Apto, casa, etc"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;
