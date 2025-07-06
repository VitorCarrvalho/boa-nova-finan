
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSuppliers } from '@/hooks/useSupplierData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type TransactionType = Database['public']['Enums']['transaction_type'];
type FinancialCategory = Database['public']['Enums']['financial_category'];
type PaymentMethod = Database['public']['Enums']['payment_method'];

export interface FinancialFormData {
  type: TransactionType;
  category: FinancialCategory;
  amount: string;
  method: PaymentMethod;
  event_type: string;
  event_date: string;
  attendees: string;
  description: string;
  supplier_id: string;
  responsible_pastor_id: string;
  congregation_id: string;
}

export const useFinancialForm = () => {
  const { user, userRole } = useAuth();
  const { data: suppliers } = useSuppliers();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FinancialFormData>({
    type: '' as TransactionType,
    category: '' as FinancialCategory,
    amount: '',
    method: '' as PaymentMethod,
    event_type: '',
    event_date: '',
    attendees: '',
    description: '',
    supplier_id: '',
    responsible_pastor_id: '',
    congregation_id: ''
  });

  // Fetch congregations for selection
  const { data: congregations } = useQuery({
    queryKey: ['congregations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('congregations')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch pastors for selection
  const { data: pastors } = useQuery({
    queryKey: ['pastors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email')
        .eq('role', 'pastor')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch current user's pastor profile if they are a pastor
  const { data: currentUserPastor } = useQuery({
    queryKey: ['current-user-pastor', user?.id],
    queryFn: async () => {
      if (!user?.id || userRole !== 'pastor') return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (!profile?.email) return null;

      const { data: pastor, error } = await supabase
        .from('members')
        .select('id, name, email')
        .eq('email', profile.email)
        .eq('role', 'pastor')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return pastor;
    },
    enabled: !!user?.id && userRole === 'pastor',
  });

  // Set default values when data loads
  useEffect(() => {
    if (congregations && congregations.length > 0 && !formData.congregation_id) {
      const headquarters = congregations.find(c => c.name === 'Sede');
      setFormData(prev => ({
        ...prev,
        congregation_id: headquarters?.id || congregations[0].id
      }));
    }
  }, [congregations, formData.congregation_id]);

  useEffect(() => {
    if (currentUserPastor && userRole === 'pastor') {
      setFormData(prev => ({
        ...prev,
        responsible_pastor_id: currentUserPastor.id
      }));
    }
  }, [currentUserPastor, userRole]);

  const resetForm = () => {
    const defaultCongregationId = congregations?.find(c => c.name === 'Sede')?.id || congregations?.[0]?.id || '';
    setFormData({
      type: '' as TransactionType,
      category: '' as FinancialCategory,
      amount: '',
      method: '' as PaymentMethod,
      event_type: '',
      event_date: '',
      attendees: '',
      description: '',
      supplier_id: '',
      responsible_pastor_id: userRole === 'pastor' && currentUserPastor ? currentUserPastor.id : '',
      congregation_id: defaultCongregationId
    });
  };

  return {
    formData,
    setFormData,
    loading,
    setLoading,
    suppliers,
    congregations,
    pastors,
    currentUserPastor,
    userRole,
    user,
    resetForm
  };
};
