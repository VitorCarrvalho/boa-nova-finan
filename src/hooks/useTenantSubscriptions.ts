import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planType: string;
  status: string;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
}

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
}

interface BillingStats {
  mrr: number;
  activeSubscriptions: number;
  churnRate: number;
  pendingPayments: number;
}

const planPrices: Record<string, number> = {
  free: 0,
  basic: 97,
  pro: 197,
  enterprise: 397,
};

export function useTenantSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    mrr: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all tenants as subscriptions (since we don't have tenant_subscriptions table yet)
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('id, name, plan_type, subscription_status, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform tenants to subscriptions
      const subs: Subscription[] = (tenants || []).map(tenant => ({
        id: tenant.id,
        tenantId: tenant.id,
        tenantName: tenant.name,
        planType: tenant.plan_type || 'free',
        status: tenant.subscription_status || (tenant.is_active ? 'active' : 'canceled'),
        currentPeriodEnd: null, // Would come from Stripe
        stripeSubscriptionId: null,
      }));

      setSubscriptions(subs);

      // Calculate stats
      let mrr = 0;
      let activeCount = 0;
      let pendingCount = 0;

      subs.forEach(sub => {
        if (sub.status === 'active' && sub.planType !== 'free') {
          mrr += planPrices[sub.planType] || 0;
          activeCount++;
        }
        if (sub.status === 'past_due' || sub.status === 'pending') {
          pendingCount++;
        }
      });

      // Calculate churn rate (simplified)
      const canceledLast30Days = subs.filter(s => s.status === 'canceled').length;
      const churnRate = subs.length > 0 ? (canceledLast30Days / subs.length) * 100 : 0;

      setStats({
        mrr,
        activeSubscriptions: activeCount,
        churnRate,
        pendingPayments: pendingCount,
      });

      // Generate mock invoices from tenants (in a real app, would come from tenant_invoices table)
      const mockInvoices: Invoice[] = (tenants || [])
        .filter(t => t.plan_type !== 'free')
        .slice(0, 10)
        .map(tenant => {
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          
          return {
            id: `inv_${tenant.id}`,
            tenantId: tenant.id,
            tenantName: tenant.name,
            amount: planPrices[tenant.plan_type || 'basic'] || 97,
            status: tenant.subscription_status === 'active' ? 'paid' : 'pending',
            periodStart: startOfMonth.toISOString(),
            periodEnd: endOfMonth.toISOString(),
            paidAt: tenant.subscription_status === 'active' ? now.toISOString() : null,
          };
        });

      setInvoices(mockInvoices);

    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    invoices,
    stats,
    loading,
    refetch: fetchSubscriptions,
  };
}

export default useTenantSubscriptions;
