
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { type SupplierFormData } from '../schemas/supplierSchema';

interface SupplierDetailsFieldsProps {
  control: Control<SupplierFormData>;
}

const SupplierDetailsFields = ({ control }: SupplierDetailsFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="services"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Serviços</FormLabel>
            <FormControl>
              <Textarea placeholder="Descrição dos serviços" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Textarea placeholder="Endereço completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SupplierDetailsFields;
