
# Plano: Painel Administrativo Exclusivo para Super Admin

## Visao Geral

Criar uma experiencia completamente separada para o Super Admin, que e o gestor da **plataforma SaaS como um todo**, nao de uma igreja especifica. O Super Admin precisa de ferramentas para:

1. **Gestao de Tenants (Igrejas)** - Cadastrar, editar, ativar/desativar
2. **Billing/Faturamento** - Controle de assinaturas e cobranças via Stripe
3. **Metricas de Uso** - Usuarios ativos, dados armazenados, acoes realizadas
4. **Auditoria** - Logs de acesso e acoes criticas por tenant

---

## Arquitetura da Solucao

### 1. Layout Exclusivo para Super Admin

Criar um layout alternativo que sera usado automaticamente quando o usuario logado for Super Admin:

```text
/src/components/layout/
  ├── Layout.tsx (existente - detecta se e super admin e renderiza o correto)
  ├── SuperAdminLayout.tsx (NOVO)
  ├── SuperAdminSidebar.tsx (NOVO)
  └── DesktopSidebar.tsx (existente)
```

O sidebar do Super Admin tera menus completamente diferentes:

| Menu | Rota | Descricao |
|------|------|-----------|
| Dashboard | /admin | Visao geral da plataforma |
| Tenants | /admin/tenants | Gestao de igrejas clientes |
| Billing | /admin/billing | Faturamento e assinaturas |
| Metricas | /admin/metricas | Consumo e uso da plataforma |
| Auditoria | /admin/auditoria | Logs e historico de acoes |
| Configuracoes | /admin/configuracoes | Config. globais da plataforma |

---

### 2. Novas Paginas para Super Admin

#### 2.1 Dashboard Admin (`/admin`)
Pagina inicial exclusiva com KPIs da plataforma:

**Cards de Metricas:**
- Total de Tenants (ativos/inativos)
- Receita Mensal Recorrente (MRR)
- Total de Usuarios na plataforma
- Conciliacoes processadas no mes
- Valor total transacionado

**Graficos:**
- Evolucao de tenants ao longo do tempo
- Receita por plano (Free, Basic, Pro, Enterprise)
- Usuarios ativos por tenant (top 10)
- Distribuicao geografica das igrejas

#### 2.2 Gestao de Tenants (`/admin/tenants`)
Reutiliza a pagina `/tenants` existente, mas com melhorias:

- Lista de todos os tenants com filtros avancados
- Acoes rapidas: Ativar/Desativar, Mudar plano, Ver metricas
- Criar novo tenant com onboarding automatico
- Configurar modulos por tenant (ja implementado)

#### 2.3 Billing (`/admin/billing`)
Central de faturamento com integracao Stripe:

**Funcionalidades:**
- Listar assinaturas ativas/canceladas/pendentes
- Ver proximas cobranças
- Registrar pagamentos manuais (se necessario)
- Gerar faturas/invoices
- Ver historico de pagamentos por tenant
- Dashboard de receita (MRR, churn, lifetime value)

**Integracao Stripe:**
- Criar produtos para cada plano (Free, Basic, Pro, Enterprise)
- Gerenciar assinaturas automaticamente
- Webhooks para atualizar status de pagamento
- Portal do cliente (link para tenant ver suas faturas)

#### 2.4 Metricas (`/admin/metricas`)
Dashboard de uso da plataforma por tenant:

**Metricas de Usuarios:**
- Usuarios cadastrados vs ativos (ultimo login < 30 dias)
- Grafico de logins por dia/semana/mes
- Usuarios por perfil de acesso

**Metricas de Dados:**
- Total de membros cadastrados
- Total de eventos criados
- Total de registros financeiros
- Armazenamento utilizado (storage buckets)

**Metricas de Acoes:**
- Conciliacoes enviadas por mes
- Notificacoes disparadas
- Contas a pagar processadas

**Filtros:**
- Por tenant especifico
- Por periodo (7d, 30d, 90d, 12m)
- Por plano

#### 2.5 Auditoria (`/admin/auditoria`)
Centro de logs e seguranca:

- Historico de logins por tenant
- Acoes criticas (alteracao de plano, desativacao, etc)
- Erros e falhas do sistema
- Exportacao de logs para compliance

---

### 3. Banco de Dados

#### 3.1 Novas Tabelas

```sql
-- Tabela de subscriptions para controlar assinaturas
CREATE TABLE public.tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan_type tenant_plan_type NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active', -- active, past_due, canceled, unpaid
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  monthly_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de invoices/faturas
CREATE TABLE public.tenant_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de metricas por tenant (agregadas diariamente)
CREATE TABLE public.tenant_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  active_users INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_reconciliations INTEGER DEFAULT 0,
  total_financial_records INTEGER DEFAULT 0,
  total_notifications_sent INTEGER DEFAULT 0,
  login_count INTEGER DEFAULT 0,
  storage_used_mb NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, metric_date)
);

-- Tabela de logs de auditoria do admin
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_tenant_id UUID REFERENCES public.tenants(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3.2 Politicas RLS
- Apenas super admins podem acessar essas tabelas
- Usar funcao `is_super_admin()` ja existente

---

### 4. Integracao Stripe

#### 4.1 Produtos e Precos
Criar 4 produtos no Stripe:

| Plano | Preco Mensal (sugestao) | Modulos Inclusos |
|-------|-------------------------|------------------|
| Free | R$ 0 | Dashboard, Membros, Eventos |
| Basic | R$ 97/mes | + Congregacoes, Ministerios, Departamentos |
| Pro | R$ 197/mes | + Financeiro, Conciliacoes, Fornecedores, Relatorios |
| Enterprise | R$ 397/mes | Todos + Suporte prioritario |

#### 4.2 Edge Functions

**`stripe-webhook`**: Receber eventos do Stripe
- `invoice.paid` - Atualizar status da subscription
- `invoice.payment_failed` - Marcar como pendente
- `customer.subscription.deleted` - Cancelar acesso

**`create-checkout-session`**: Criar sessao de pagamento para upgrade de plano

**`create-customer-portal`**: Gerar link para tenant gerenciar sua assinatura

---

### 5. Arquivos a Criar

**Novos componentes e paginas:**
```text
src/
  ├── components/
  │   ├── layout/
  │   │   ├── SuperAdminLayout.tsx
  │   │   └── SuperAdminSidebar.tsx
  │   └── admin/
  │       ├── AdminDashboard.tsx
  │       ├── AdminMetricsCards.tsx
  │       ├── BillingOverview.tsx
  │       ├── SubscriptionTable.tsx
  │       ├── InvoiceTable.tsx
  │       ├── TenantMetricsChart.tsx
  │       ├── UsageMetricsChart.tsx
  │       └── AuditLogTable.tsx
  ├── pages/
  │   └── admin/
  │       ├── AdminDashboard.tsx
  │       ├── AdminTenants.tsx
  │       ├── AdminBilling.tsx
  │       ├── AdminMetrics.tsx
  │       ├── AdminAuditoria.tsx
  │       └── AdminSettings.tsx
  └── hooks/
      ├── useSuperAdminDashboard.ts
      ├── useTenantSubscriptions.ts
      ├── useTenantMetrics.ts
      └── useAdminAuditLogs.ts
```

**Edge Functions:**
```text
supabase/functions/
  ├── stripe-webhook/index.ts
  ├── create-checkout-session/index.ts
  └── create-customer-portal/index.ts
```

---

### 6. Arquivos a Modificar

**Layout:**
- `src/components/layout/Layout.tsx` - Detectar super admin e renderizar layout correto

**Rotas:**
- `src/App.tsx` - Adicionar rotas `/admin/*`

**Context:**
- `src/contexts/AuthContext.tsx` - Adicionar flag `isSuperAdmin` no contexto

---

### 7. Fluxo de Deteccao Super Admin

```text
Usuario faz login
       │
       ▼
AuthContext verifica se esta em super_admins
       │
       ▼
┌──────┴──────┐
│             │
▼             ▼
Super Admin   Usuario Normal
     │              │
     ▼              ▼
SuperAdminLayout   Layout padrao
     │              │
     ▼              ▼
/admin/*       /dashboard, /membros, etc
```

---

### 8. Ordem de Implementacao

**Fase 1 - Estrutura Base:**
1. Criar layout e sidebar do Super Admin
2. Modificar Layout.tsx para detectar super admin
3. Criar pagina Dashboard Admin basica
4. Adicionar rotas no App.tsx

**Fase 2 - Metricas e Dados:**
1. Criar tabelas de metricas no banco
2. Implementar hooks de metricas
3. Criar dashboard com graficos

**Fase 3 - Billing/Stripe:**
1. Habilitar integracao Stripe (ferramenta Lovable)
2. Criar tabelas de subscriptions/invoices
3. Implementar edge functions de webhook
4. Criar interface de billing

**Fase 4 - Auditoria:**
1. Criar tabela de audit logs
2. Implementar triggers para registrar acoes
3. Criar interface de auditoria

---

### 9. Beneficios

1. **Separacao clara**: Super Admin tem experiencia propria, sem confusao com modulos de igreja
2. **Controle total**: Visao 360 de todos os tenants e suas metricas
3. **Monetizacao**: Controle de billing automatizado com Stripe
4. **Compliance**: Logs de auditoria para rastreabilidade
5. **Escalabilidade**: Arquitetura preparada para crescer

---

### 10. Consideracoes de Seguranca

- Todas as rotas `/admin/*` verificam `is_super_admin()` no backend
- Nenhuma informacao sensivel exposta no frontend
- Webhook do Stripe validado com signature
- Logs de auditoria para todas as acoes criticas
