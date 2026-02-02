import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  usersByTenant: Array<{ name: string; users: number }>;
}

interface DataMetrics {
  totalMembers: number;
  totalEvents: number;
  totalFinancialRecords: number;
  dataByTenant: Array<{ name: string; members: number; events: number; financial: number }>;
}

interface ActivityMetrics {
  reconciliationsThisMonth: number;
  notificationsSent: number;
  activityOverTime: Array<{ date: string; logins: number; actions: number }>;
}

interface TenantListItem {
  id: string;
  name: string;
}

export function useTenantMetrics(period: string = '30d', selectedTenantId: string | null = null) {
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    usersByTenant: [],
  });
  const [dataMetrics, setDataMetrics] = useState<DataMetrics>({
    totalMembers: 0,
    totalEvents: 0,
    totalFinancialRecords: 0,
    dataByTenant: [],
  });
  const [activityMetrics, setActivityMetrics] = useState<ActivityMetrics>({
    reconciliationsThisMonth: 0,
    notificationsSent: 0,
    activityOverTime: [],
  });
  const [tenantsList, setTenantsList] = useState<TenantListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getPeriodDays = (period: string): number => {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '12m': return 365;
      default: return 30;
    }
  };

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const days = getPeriodDays(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch tenants list
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      setTenantsList(tenants || []);

      // Build tenant filter
      const tenantFilter = selectedTenantId ? { tenant_id: selectedTenantId } : {};

      // Fetch user counts per tenant
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, tenant_id, created_at, approval_status');

      const usersByTenantMap = new Map<string, number>();
      let totalUsers = 0;
      let activeUsers = 0;

      profiles?.forEach(profile => {
        if (selectedTenantId && profile.tenant_id !== selectedTenantId) return;
        
        totalUsers++;
        if (profile.approval_status === 'ativo') {
          activeUsers++;
        }
        
        if (profile.tenant_id) {
          usersByTenantMap.set(
            profile.tenant_id,
            (usersByTenantMap.get(profile.tenant_id) || 0) + 1
          );
        }
      });

      const usersByTenant = (tenants || [])
        .map(t => ({
          name: t.name,
          users: usersByTenantMap.get(t.id) || 0,
        }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 10);

      setUserMetrics({ totalUsers, activeUsers, usersByTenant });

      // Fetch members count
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // Fetch events count
      const { count: eventsCount } = await supabase
        .from('church_events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch financial records count
      const { count: financialCount } = await supabase
        .from('financial_records')
        .select('*', { count: 'exact', head: true });

      // Generate mock data by tenant (would need proper aggregation in production)
      const dataByTenant = (tenants || []).slice(0, 8).map(t => ({
        name: t.name.length > 15 ? t.name.substring(0, 15) + '...' : t.name,
        members: Math.floor(Math.random() * 500) + 50,
        events: Math.floor(Math.random() * 50) + 5,
        financial: Math.floor(Math.random() * 200) + 20,
      }));

      setDataMetrics({
        totalMembers: membersCount || 0,
        totalEvents: eventsCount || 0,
        totalFinancialRecords: financialCount || 0,
        dataByTenant,
      });

      // Fetch reconciliations this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: reconciliationsCount } = await supabase
        .from('reconciliations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Fetch notifications sent
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent');

      // Generate activity over time (mock data for now)
      const activityOverTime = [];
      for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        activityOverTime.push({
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          logins: Math.floor(Math.random() * 100) + 20,
          actions: Math.floor(Math.random() * 200) + 50,
        });
      }

      setActivityMetrics({
        reconciliationsThisMonth: reconciliationsCount || 0,
        notificationsSent: notificationsCount || 0,
        activityOverTime,
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [period, selectedTenantId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    userMetrics,
    dataMetrics,
    activityMetrics,
    tenantsList,
    loading,
    refetch: fetchMetrics,
  };
}

export default useTenantMetrics;
