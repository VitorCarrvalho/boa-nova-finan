
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useCreateSupplier, useUpdateSupplier } from '@/hooks/useSupplierData';
import { supplierSchema, type SupplierFormData } from '../schemas/supplierSchema';

interface UseSupplierFormProps {
  supplier?: any;
  onOpenChange: (open: boolean) => void;
}

export const useSupplierForm = ({ supplier, onOpenChange }: UseSupplierFormProps) => {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      document: '',
      services: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    if (supplier) {
      form.reset({
        name: supplier.name || '',
        document: supplier.document || '',
        services: supplier.services || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      });
    } else {
      form.reset({
        name: '',
        document: '',
        services: '',
        phone: '',
        email: '',
        address: '',
      });
    }
  }, [supplier, form]);

  const onSubmit = (data: SupplierFormData) => {
    // Ensure name is always present and convert empty strings to null
    const submitData = {
      name: data.name,
      document: data.document || null,
      services: data.services || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
    };

    if (supplier) {
      updateSupplier.mutate({ id: supplier.id, ...submitData }, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    } else {
      createSupplier.mutate(submitData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  return {
    form,
    onSubmit,
    isLoading: createSupplier.isPending || updateSupplier.isPending,
  };
};
