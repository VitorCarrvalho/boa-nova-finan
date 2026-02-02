import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLog {
  id: string;
  action: string;
  adminEmail: string | null;
  tenantName: string | null;
  tenantId: string | null;
  details: string | null;
  createdAt: string;
  ipAddress: string | null;
}

export function useAdminAuditLogs(period: string = '7d', actionFilter: string = 'all') {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const getPeriodDays = (period: string): number => {
    switch (period) {
      case '1d': return 1;
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      default: return 7;
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const days = getPeriodDays(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch audit logs from the existing audit_logs table
      let query = supabase
        .from('audit_logs')
        .select('id, action_type, user_id, table_name, record_id, new_value, previous_value, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.ilike('action_type', `%${actionFilter}%`);
      }

      const { data: auditLogs, error } = await query;

      if (error) throw error;

      // Fetch tenants for mapping
      const { data: tenants } = await supabase
        .from('tenants')
        .select('id, name');

      const tenantMap = new Map(tenants?.map(t => [t.id, t.name]));

      // Transform audit logs
      const transformedLogs: AuditLog[] = (auditLogs || []).map(log => {
        // Try to extract tenant info from the record
        let tenantName = null;
        let tenantId = null;
        
        const newValue = log.new_value as Record<string, any> | null;
        const previousValue = log.previous_value as Record<string, any> | null;
        
        if (newValue?.tenant_id) {
          tenantId = newValue.tenant_id;
          tenantName = tenantMap.get(tenantId) || null;
        } else if (previousValue?.tenant_id) {
          tenantId = previousValue.tenant_id;
          tenantName = tenantMap.get(tenantId) || null;
        }

        // Generate details from the action
        let details = `${log.action_type} em ${log.table_name}`;
        if (newValue?.name) {
          details = `${log.action_type}: ${newValue.name}`;
        }

        return {
          id: log.id,
          action: log.action_type.toLowerCase(),
          adminEmail: null, // Would need to join with profiles
          tenantName,
          tenantId,
          details,
          createdAt: log.created_at,
          ipAddress: null,
        };
      });

      setLogs(transformedLogs);

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Return empty array instead of failing
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [period, actionFilter]);

  const exportLogs = async () => {
    try {
      // Generate CSV content
      const headers = ['Data/Hora', 'Admin', 'Ação', 'Tenant', 'Detalhes'];
      const rows = logs.map(log => [
        new Date(log.createdAt).toLocaleString('pt-BR'),
        log.adminEmail || 'Sistema',
        log.action,
        log.tenantName || '-',
        log.details || '-',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

    } catch (error) {
      console.error('Error exporting logs:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    exportLogs,
    refetch: fetchLogs,
  };
}

export default useAdminAuditLogs;
