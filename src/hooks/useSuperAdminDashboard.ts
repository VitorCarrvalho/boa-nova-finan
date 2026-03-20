import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  mrr: number;
  paidSubscriptions: number;
  reconciliationsThisMonth: number;
}

interface TenantByPlan {
  name: string;
  value: number;
}

interface RecentActivity {
  type: 'new_tenant' | 'subscription' | 'user' | 'other';
  description: string;
  tenantName: string;
  time: string;
}

interface MRRHistory {
  month: string;
  value: number;
}

export function useSuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tenantsByPlan, setTenantsByPlan] = useState<TenantByPlan[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [mrrHistory, setMrrHistory] = useState<MRRHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const planPrices: Record<string, number> = {
    free: 0,
    basic: 97,
    pro: 197,
    enterprise: 397,
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch tenants stats
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, is_active, plan_type, subscription_status, created_at');

      if (tenantsError) throw tenantsError;

      const totalTenants = tenants?.length || 0;
      const activeTenants = tenants?.filter(t => t.is_active).length || 0;

      // Calculate MRR
      let mrr = 0;
      let paidSubscriptions = 0;
      const planCounts: Record<string, number> = {
        Free: 0,
        Basic: 0,
        Pro: 0,
        Enterprise: 0,
      };

      tenants?.forEach(tenant => {
        const plan = tenant.plan_type || 'free';
        const planKey = plan.charAt(0).toUpperCase() + plan.slice(1);
        planCounts[planKey] = (planCounts[planKey] || 0) + 1;
        
        if (tenant.subscription_status === 'active' && plan !== 'free') {
          mrr += planPrices[plan] || 0;
          paidSubscriptions++;
        }
      });

      setTenantsByPlan(
        Object.entries(planCounts).map(([name, value]) => ({ name, value }))
      );

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch reconciliations this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: reconciliationsThisMonth } = await supabase
        .from('reconciliations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      setStats({
        totalTenants,
        activeTenants,
        totalUsers: totalUsers || 0,
        activeUsers: totalUsers || 0,
        mrr,
        paidSubscriptions,
        reconciliationsThisMonth: reconciliationsThisMonth || 0,
      });

      // MRR history: only current month (no fake history)
      const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'short' });
      setMrrHistory([{ month: currentMonth, value: mrr }]);

      // Recent activity from audit_logs (real data)
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('action_type, table_name, created_at, tenant_id')
        .order('created_at', { ascending: false })
        .limit(5);

      const activity: RecentActivity[] = (auditLogs || []).map(log => ({
        type: 'other' as const,
        description: `${log.action_type} em ${log.table_name}`,
        tenantName: '',
        time: new Date(log.created_at).toLocaleDateString('pt-BR'),
      }));
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    tenantsByPlan,
    recentActivity,
    mrrHistory,
    loading,
    refetch: fetchDashboardData,
  };
}

export default useSuperAdminDashboard;
