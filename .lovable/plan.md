

# Remover todos os dados mockados/fake do sistema

## Arquivos afetados e problemas encontrados

### 1. `src/pages/Dashboard.tsx` — Múltiplos dados fake

- **Linhas 49-61**: `notificationStats` e `recentActivities` são 100% hardcoded (24 mensagens enviadas, 3 agendadas, atividades fictícias com nomes inventados)
- **Linha 191, 210, 237, 245, 253, 281, 300**: Todos os `trend` são valores inventados (12%, 8%, 4%, 2%, 15%, 3%, 20%)
- **Linha 250**: "Novos Membros" com valor hardcoded `"8"`
- **Linha 385**: Tempo "há Xh" com `Math.random()`

**Correção**: 
- Notificações: buscar contagens reais da tabela `notifications` (filtrar por `status = 'sent'` e `status = 'scheduled'` do mês atual, com filtro de tenant)
- Atividades recentes: remover seção inteira ou buscar de `audit_logs` do tenant (dados reais)
- Trends: remover todos os `trend` props (não há dados históricos para calcular variação real)
- "Novos Membros": calcular membros com `created_at` nos últimos 30 dias a partir dos dados já carregados
- Remover `Math.random()` do tempo das atividades

### 2. `src/hooks/useSuperAdminDashboard.ts` — Mock no Super Admin

- **Linha 90**: `activeUsers` simulado como 70% do total (`Math.floor(totalUsers * 0.7)`)
- **Linhas 112-121**: MRR history simulado com crescimento falso
- **Linhas 124-132**: Atividades recentes são apenas tenants mais recentes, não atividades reais

**Correção**:
- `activeUsers`: mostrar apenas `totalUsers` (remover métrica fake de "ativos")
- MRR history: remover gráfico ou mostrar apenas o MRR atual (sem dados históricos reais)
- Atividades recentes: buscar de `audit_logs` ou remover

### 3. `src/hooks/useTenantMetrics.ts` — Mock em métricas

- **Linhas 129-134**: `dataByTenant` com `Math.random()` para members, events, financial
- **Linhas 160-168**: `activityOverTime` com logins/actions aleatórios

**Correção**:
- `dataByTenant`: buscar contagens reais por tenant usando queries com `group by`
- `activityOverTime`: remover ou zerar (não há dados reais de logins)

### 4. `src/hooks/useTenantSubscriptions.ts` — Faturas mock

- **Linhas 101-122**: `mockInvoices` geradas artificialmente a partir de tenants

**Correção**: Retornar array vazio de invoices até existir uma tabela real de faturas

## Resumo de alterações

| Arquivo | O que remover/corrigir |
|---|---|
| `src/pages/Dashboard.tsx` | Remover notificationStats mock, recentActivities hardcoded, trends fake, "8" novos membros, Math.random no tempo. Buscar notificações reais do DB. |
| `src/hooks/useSuperAdminDashboard.ts` | Remover activeUsers simulado, MRR history fake, simplificar atividades recentes |
| `src/hooks/useTenantMetrics.ts` | Remover dataByTenant random, activityOverTime random. Buscar dados reais ou zerar |
| `src/hooks/useTenantSubscriptions.ts` | Remover mockInvoices, retornar array vazio |

## Princípio

Onde não há dados reais disponíveis, mostrar "0" ou "Sem dados" em vez de inventar números. Isso garante que o sistema está pronto para receber informações reais sem confundir o usuário.

