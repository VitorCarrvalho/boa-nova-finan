import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreHorizontal, Edit, Trash2, Palette, Layout, Users, ExternalLink, Puzzle, Globe, Eye, RefreshCw, CheckCircle2, XCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Tenant, TenantBranding, TenantHomeConfig, TenantModulesConfig } from '@/contexts/TenantContext';

interface TenantWithSettings extends Tenant {
  branding?: TenantBranding;
  homeConfig?: TenantHomeConfig;
  modulesConfig?: TenantModulesConfig;
  adminsCount?: number;
  usersCount?: number;
  dnsStatus?: string;
  dnsCheckedAt?: string | null;
}

interface TenantTableProps {
  tenants: TenantWithSettings[];
  onEdit: (tenant: TenantWithSettings) => void;
  onEditBranding: (tenant: TenantWithSettings) => void;
  onEditHome: (tenant: TenantWithSettings) => void;
  onEditModules: (tenant: TenantWithSettings) => void;
  onManageUsers: (tenant: TenantWithSettings) => void;
  onDelete: (tenant: TenantWithSettings) => void;
  onViewDns?: (tenant: TenantWithSettings) => void;
  onCheckDns?: (tenantId: string, subdomain: string) => Promise<string | null>;
}

const planBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  free: 'outline',
  basic: 'secondary',
  pro: 'default',
  enterprise: 'default',
};

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  trial: 'outline',
  active: 'default',
  pending: 'secondary',
  suspended: 'destructive',
  cancelled: 'destructive',
};

function DnsStatusBadge({ status, checkedAt, onCheck, loading }: {
  status: string;
  checkedAt?: string | null;
  onCheck: () => void;
  loading: boolean;
}) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    active: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: 'Online',
      className: 'bg-green-600 text-white border-transparent hover:bg-green-700',
    },
    partial: {
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Parcial',
      className: 'bg-yellow-500 text-white border-transparent hover:bg-yellow-600',
    },
    offline: {
      icon: <XCircle className="h-3 w-3" />,
      label: 'Offline',
      className: 'bg-destructive text-destructive-foreground border-transparent',
    },
    pending: {
      icon: <Clock className="h-3 w-3" />,
      label: 'Pendente',
      className: 'bg-muted text-muted-foreground border-transparent',
    },
  };

  const { icon, label, className } = config[status] || config.pending;

  const timeAgo = checkedAt
    ? (() => {
        const diff = Date.now() - new Date(checkedAt).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'agora';
        if (mins < 60) return `${mins}min atrás`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h atrás`;
        return `${Math.floor(hrs / 24)}d atrás`;
      })()
    : 'nunca verificado';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            <Badge className={`gap-1 text-[10px] px-1.5 py-0.5 ${className}`}>
              {icon}
              {label}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onCheck();
              }}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Última verificação: {timeAgo}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TenantTable({
  tenants,
  onEdit,
  onEditBranding,
  onEditHome,
  onEditModules,
  onManageUsers,
  onDelete,
  onViewDns,
  onCheckDns,
}: TenantTableProps) {
  const [checkingDns, setCheckingDns] = useState<Record<string, boolean>>({});

  const handleCheckDns = async (tenantId: string, subdomain: string) => {
    if (!onCheckDns) return;
    setCheckingDns(prev => ({ ...prev, [tenantId]: true }));
    try {
      await onCheckDns(tenantId, subdomain);
    } finally {
      setCheckingDns(prev => ({ ...prev, [tenantId]: false }));
    }
  };

  if (tenants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma organização cadastrada ainda.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Subdomínio</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">DNS</TableHead>
            <TableHead className="text-center">Usuários</TableHead>
            <TableHead className="text-center">Ativo</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.map((tenant) => (
            <TableRow key={tenant.id}>
              <TableCell className="font-medium">
                <div>
                  {tenant.name}
                  <div className="text-xs text-muted-foreground">{tenant.slug}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span className="text-sm">{tenant.subdomain}</span>
                  <span className="text-xs text-muted-foreground">.igrejamoove</span>
                  <a
                    href={`https://${tenant.subdomain}.igrejamoove.com.br`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary ml-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={planBadgeVariant[tenant.planType] || 'outline'}>
                  {tenant.planType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant[tenant.subscriptionStatus] || 'outline'}>
                  {tenant.subscriptionStatus}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <DnsStatusBadge
                  status={tenant.dnsStatus || 'pending'}
                  checkedAt={tenant.dnsCheckedAt}
                  onCheck={() => handleCheckDns(tenant.id, tenant.subdomain)}
                  loading={!!checkingDns[tenant.id]}
                />
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm">{tenant.usersCount || 0}</span>
              </TableCell>
              <TableCell className="text-center">
                {tenant.isActive ? (
                  <Badge variant="default" className="bg-green-600">Sim</Badge>
                ) : (
                  <Badge variant="destructive">Não</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewAsTenant && (
                      <DropdownMenuItem onClick={() => onViewAsTenant(tenant)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver como Organização
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onEdit(tenant)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditBranding(tenant)}>
                      <Palette className="mr-2 h-4 w-4" />
                      Branding
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditHome(tenant)}>
                      <Layout className="mr-2 h-4 w-4" />
                      Config Home
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditModules(tenant)}>
                      <Puzzle className="mr-2 h-4 w-4" />
                      Módulos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManageUsers(tenant)}>
                      <Users className="mr-2 h-4 w-4" />
                      Usuários
                    </DropdownMenuItem>
                    {onViewDns && (
                      <DropdownMenuItem onClick={() => onViewDns(tenant)}>
                        <Globe className="mr-2 h-4 w-4" />
                        Config DNS
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(tenant)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TenantTable;
