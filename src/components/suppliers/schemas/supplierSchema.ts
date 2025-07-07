
import * as z from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  document: z.string().optional(),
  services: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
