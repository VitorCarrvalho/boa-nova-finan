import React from 'react';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Palette, Layout, Users, ExternalLink } from 'lucide-react';
import { Tenant, TenantBranding, TenantHomeConfig } from '@/contexts/TenantContext';

interface TenantWithSettings extends Tenant {
  branding?: TenantBranding;
  homeConfig?: TenantHomeConfig;
  adminsCount?: number;
  usersCount?: number;
}

interface TenantTableProps {
  tenants: TenantWithSettings[];
  onEdit: (tenant: TenantWithSettings) => void;
  onEditBranding: (tenant: TenantWithSettings) => void;
  onEditHome: (tenant: TenantWithSettings) => void;
  onManageUsers: (tenant: TenantWithSettings) => void;
  onDelete: (tenant: TenantWithSettings) => void;
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

export function TenantTable({
  tenants,
  onEdit,
  onEditBranding,
  onEditHome,
  onManageUsers,
  onDelete,
}: TenantTableProps) {
  if (tenants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum tenant cadastrado ainda.
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
                  <a
                    href={`https://${tenant.subdomain}.iptmglobal.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
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
                    <DropdownMenuItem onClick={() => onManageUsers(tenant)}>
                      <Users className="mr-2 h-4 w-4" />
                      Usuários
                    </DropdownMenuItem>
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
