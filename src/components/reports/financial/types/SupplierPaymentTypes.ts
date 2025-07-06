
export interface SupplierPayment {
  id: string;
  amount: number;
  method: string;
  category: string;
  created_at: string;
  description: string | null;
  congregation_id: string | null;
  type: string;
  attendees: number | null;
  event_date: string | null;
  event_type: string | null;
  created_by: string;
  updated_at: string;
}

export interface SupplierPaymentFilters {
  congregationId: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
}

export interface SupplierTotal {
  name: string;
  total: number;
  count: number;
}
