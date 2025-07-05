
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCongregation, useUpdateCongregation } from '@/hooks/useCongregationData';
import { useMembers } from '@/hooks/useMemberData';
import type { Database } from '@/integrations/supabase/types';

type CongregationFormData = {
  name: string;
  cnpj?: string;
  cep?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  complement?: string;
  avg_members?: number;
  has_own_property: boolean;
  rent_value?: number;
  is_active: boolean;
  responsible_pastor_ids: string[];
};

interface CongregationFormProps {
  congregation?: Database['public']['Tables']['congregations']['Row'] | null;
  onClose: () => void;
}

const CongregationForm: React.FC<CongregationFormProps> = ({ congregation, onClose }) => {
  const createMutation = useCreateCongregation();
  const updateMutation = useUpdateCongregation();
  const { data: members = [] } = useMembers();
  const isEditing = !!congregation;

  // Filter members to only show pastors
  const pastors = members.filter(member => member.role === 'pastor');

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<CongregationFormData>({
    defaultValues: {
      name: congregation?.name || '',
      cnpj: congregation?.cnpj || '',
      cep: congregation?.cep || '',
      street: congregation?.street || '',
      number: congregation?.number || '',
      city: congregation?.city || '',
      state: congregation?.state || '',
      complement: congregation?.complement || '',
      avg_members: congregation?.avg_members || undefined,
      has_own_property: congregation?.has_own_property || false,
      rent_value: congregation?.rent_value ? Number(congregation.rent_value) : undefined,
      is_active: congregation?.is_active ?? true,
      responsible_pastor_ids: congregation?.responsible_pastor_ids || [],
    },
  });

  const hasOwnProperty = watch('has_own_property');
  const selectedPastorIds = watch('responsible_pastor_ids');

  const onSubmit = async (data: CongregationFormData) => {
    try {
      if (isEditing && congregation) {
        await updateMutation.mutateAsync({
          id: congregation.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error saving congregation:', error);
    }
  };

  const handlePastorToggle = (pastorId: string) => {
    const currentIds = selectedPastorIds || [];
    const newIds = currentIds.includes(pastorId)
      ? currentIds.filter(id => id !== pastorId)
      : [...currentIds, pastorId];
    setValue('responsible_pastor_ids', newIds);
  };

  const getSelectedPastorNames = () => {
    if (!selectedPastorIds || selectedPastorIds.length === 0) return [];
    return pastors.filter(pastor => selectedPastorIds.includes(pastor.id));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Nome da Congregação *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Nome é obrigatório' })}
            placeholder="Nome da congregação"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
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

      {/* Pastores Responsáveis Section */}
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
                    onChange={() => handlePastorToggle(pastor.id)}
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
            <Label htmlFor="rent_value">Valor do Aluguel (R$)</Label>
            <Input
              id="rent_value"
              type="number"
              step="0.01"
              {...register('rent_value', { valueAsNumber: true })}
              placeholder="0.00"
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

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  );
};

export default CongregationForm;
