
import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CongregationFormData = {
  name: string;
  cnpj?: string;
  avg_members?: number;
};

interface BasicInfoFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ register, errors }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label htmlFor="name">Nome da Congregação *</Label>
        <Input
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          placeholder="Nome da congregação"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{String(errors.name.message)}</p>}
      </div>

      <div>
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          {...register('cnpj')}
          placeholder="00.000.000/0000-00"
        />
      </div>

      <div>
        <Label htmlFor="avg_members">Média de Membros</Label>
        <Input
          id="avg_members"
          type="number"
          {...register('avg_members', { valueAsNumber: true })}
          placeholder="0"
        />
      </div>
    </div>
  );
};

export default BasicInfoFields;
