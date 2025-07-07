
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useSupplierForm } from './hooks/useSupplierForm';
import SupplierBasicFields from './components/SupplierBasicFields';
import SupplierDetailsFields from './components/SupplierDetailsFields';
import SupplierFormActions from './components/SupplierFormActions';

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any;
}

const SupplierForm = ({ open, onOpenChange, supplier }: SupplierFormProps) => {
  const { form, onSubmit, isLoading } = useSupplierForm({ supplier, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <SupplierBasicFields control={form.control} />
            <SupplierDetailsFields control={form.control} />
            <SupplierFormActions
              onCancel={() => onOpenChange(false)}
              isEditing={!!supplier}
              isLoading={isLoading}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierForm;
