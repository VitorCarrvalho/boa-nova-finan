

# Isolar pedidos de oração por organização (tenant_id)

## Problema

A tabela `pedidos_oracao` não possui coluna `tenant_id`. Todos os pedidos de oração de todas as organizações vão para o mesmo "pool", sem isolamento.

## Correções

### 1. Migração SQL: Adicionar `tenant_id` à tabela `pedidos_oracao`

- Adicionar coluna `tenant_id uuid` (nullable, para não quebrar registros existentes)
- Atualizar policies de INSERT (anon e authenticated) para aceitar `tenant_id`
- Atualizar policy de SELECT para filtrar por `tenant_id` do usuário logado
- Adicionar policy SELECT para `anon` (não aplicável — admins veem, anon só insere)

### 2. `src/hooks/usePedidosOracao.ts`

- Receber `tenantId` como parâmetro (via hook ou argumento do mutation)
- Incluir `tenant_id` no objeto inserido no Supabase

### 3. `src/components/home/widgets/PedidoOracaoWidget.tsx`

- Obter `tenant.id` do `TenantContext` via `useTenant()`
- Passar `tenantId` ao chamar `createPedido.mutateAsync()`

## Arquivos

| Arquivo | Alteração |
|---|---|
| Migração SQL | Adicionar coluna `tenant_id`, atualizar RLS policies |
| `src/hooks/usePedidosOracao.ts` | Incluir `tenant_id` no insert |
| `src/components/home/widgets/PedidoOracaoWidget.tsx` | Passar `tenant.id` do contexto ao hook |

