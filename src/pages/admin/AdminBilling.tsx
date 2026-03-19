import React, { useState } from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Search,
  Download,
  ExternalLink
} from 'lucide-react';
import { useTenantSubscriptions } from '@/hooks/useTenantSubscriptions';
import { Skeleton } from '@/components/ui/skeleton';
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

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-700 border-green-500/30',
  past_due: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  canceled: 'bg-red-500/20 text-red-700 border-red-500/30',
  unpaid: 'bg-red-500/20 text-red-700 border-red-500/30',
  trial: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

const statusLabels: Record<string, string> = {
  active: 'Ativa',
  past_due: 'Atrasada',
  canceled: 'Cancelada',
  unpaid: 'Não Paga',
  trial: 'Trial',
};

const planPrices: Record<string, number> = {
  free: 0,
  basic: 97,
  pro: 197,
  enterprise: 397,
};

const AdminBilling = () => {
  const { subscriptions, invoices, stats, loading } = useTenantSubscriptions();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statCards = [
    {
      title: 'Receita Mensal (MRR)',
      value: `R$ ${stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Assinaturas Ativas',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      color: 'from-primary to-primary/80',
    },
    {
      title: 'Churn Rate',
      value: `${stats.churnRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Pagamentos Pendentes',
      value: stats.pendingPayments,
      icon: AlertCircle,
      color: 'from-secondary to-secondary/80',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="h-7 w-7" />
              Billing & Faturamento
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie assinaturas e pagamentos</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Assinaturas</CardTitle>
                <CardDescription>Todas as assinaturas de tenants</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchTerm ? 'Nenhuma assinatura encontrada' : 'Nenhuma assinatura cadastrada'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor Mensal</TableHead>
                    <TableHead>Próxima Cobrança</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.tenantName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{sub.planType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[sub.status] || statusColors.active}>
                          {statusLabels[sub.status] || sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        R$ {planPrices[sub.planType]?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.currentPeriodEnd 
                          ? format(new Date(sub.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Últimas Faturas</CardTitle>
            <CardDescription>Histórico recente de faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma fatura encontrada</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 10).map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-500' :
                        invoice.status === 'pending' ? 'bg-secondary' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{invoice.tenantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(invoice.periodStart), "MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          invoice.status === 'paid' ? 'border-green-500/30 text-green-600' :
                          invoice.status === 'pending' ? 'border-amber-500/30 text-amber-600' : 
                          'border-red-500/30 text-red-600'
                        }`}
                      >
                        {invoice.status === 'paid' ? 'Paga' : invoice.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AdminBilling;
