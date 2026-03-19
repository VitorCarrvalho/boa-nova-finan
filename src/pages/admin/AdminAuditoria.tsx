import React, { useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Search, 
  Download,
  Filter,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { useAdminAuditLogs } from '@/hooks/useAdminAuditLogs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const actionColors: Record<string, string> = {
  create: 'bg-green-500/20 text-green-700 border-green-500/30',
  update: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  delete: 'bg-red-500/20 text-red-700 border-red-500/30',
  login: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  logout: 'bg-muted text-muted-foreground border-border',
  approve: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  reject: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

const actionLabels: Record<string, string> = {
  create: 'Criação',
  update: 'Atualização',
  delete: 'Exclusão',
  login: 'Login',
  logout: 'Logout',
  approve: 'Aprovação',
  reject: 'Rejeição',
  create_tenant: 'Criar Tenant',
  update_tenant: 'Atualizar Tenant',
  delete_tenant: 'Excluir Tenant',
  update_subscription: 'Alterar Plano',
  user_approval: 'Aprovar Usuário',
  user_rejection: 'Rejeitar Usuário',
};

const AdminAuditoria = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [period, setPeriod] = useState('7d');
  
  const { logs, loading, exportLogs } = useAdminAuditLogs(period, actionFilter);

  const filteredLogs = logs.filter(log => 
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = async () => {
    await exportLogs();
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-7 w-7" />
              Auditoria
            </h1>
            <p className="text-muted-foreground mt-1">Logs de atividades e ações administrativas</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Logs
          </Button>
        </div>

        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tenant, admin ou detalhes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="create">Criação</SelectItem>
                  <SelectItem value="update">Atualização</SelectItem>
                  <SelectItem value="delete">Exclusão</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Hoje</SelectItem>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Histórico de Atividades</CardTitle>
            <CardDescription>
              {filteredLogs.length} registro(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                Nenhum log encontrado para os filtros selecionados
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm">{log.adminEmail || 'Sistema'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={actionColors[log.action] || actionColors.update}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.tenantName ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{log.tenantName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-muted-foreground text-sm truncate" title={log.details}>
                          {log.details || '-'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AdminAuditoria;
