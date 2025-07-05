
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useCreateCongregation, useUpdateCongregation } from '@/hooks/useCongregationData';
import BasicInfoFields from './BasicInfoFields';
import AddressFields from './AddressFields';
import PastorSelection from './PastorSelection';
import PropertyFields from './PropertyFields';
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
  const isEditing = !!congregation;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CongregationFormData>({
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

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <BasicInfoFields register={register} errors={errors} />

      <PastorSelection
        selectedPastorIds={selectedPastorIds}
        onPastorToggle={handlePastorToggle}
      />

      <AddressFields register={register} />

      <PropertyFields register={register} hasOwnProperty={hasOwnProperty} />

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
