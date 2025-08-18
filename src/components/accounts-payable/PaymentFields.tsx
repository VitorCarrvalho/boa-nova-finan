import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Control, FieldValues, Path } from 'react-hook-form';

interface PaymentFieldsProps<T extends FieldValues> {
  control: Control<T>;
  paymentMethod: string;
  showLabels?: boolean;
}

export function PaymentFields<T extends FieldValues>({ 
  control, 
  paymentMethod, 
  showLabels = true 
}: PaymentFieldsProps<T>) {
  const isPix = paymentMethod === 'pix';

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={'payee_name' as Path<T>}
        render={({ field }) => (
          <FormItem>
            {showLabels && <FormLabel>Nome/Razão Social *</FormLabel>}
            <FormControl>
              <Input placeholder="Nome do favorecido" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {isPix ? (
        <FormField
          control={control}
          name={'pix_key' as Path<T>}
          render={({ field }) => (
            <FormItem>
              {showLabels && <FormLabel>Chave PIX *</FormLabel>}
              <FormControl>
                <Input 
                  placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <>
          <FormField
            control={control}
            name={'bank_name' as Path<T>}
            render={({ field }) => (
              <FormItem>
                {showLabels && <FormLabel>Banco</FormLabel>}
                <FormControl>
                  <Input placeholder="Nome do banco" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name={'bank_agency' as Path<T>}
              render={({ field }) => (
                <FormItem>
                  {showLabels && <FormLabel>Agência</FormLabel>}
                  <FormControl>
                    <Input placeholder="0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={'bank_account' as Path<T>}
              render={({ field }) => (
                <FormItem>
                  {showLabels && <FormLabel>Conta</FormLabel>}
                  <FormControl>
                    <Input placeholder="00000-0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}