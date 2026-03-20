

# Correção: Contagem de usuários mostra 0 na lista de organizações

## Problema

A query `supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', t.id)` retorna `null` para o super admin devido à recursão infinita nas policies RLS da tabela `profiles` — o mesmo problema que já corrigimos para o dialog de usuários.

## Solução

### 1. Migração SQL: Criar função `count_profiles_by_tenant`

```sql
CREATE OR REPLACE FUNCTION public.count_profiles_by_tenant(_tenant_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) FROM public.profiles WHERE tenant_id = _tenant_id;
$$;
```

### 2. Código: `src/hooks/useTenantAdmin.ts` (linhas 111-114)

Substituir a query direta por RPC:

```typescript
const { data: usersCount } = await supabase
  .rpc('count_profiles_by_tenant', { _tenant_id: t.id });
```

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| Migração SQL | Criar função `count_profiles_by_tenant` |
| `src/hooks/useTenantAdmin.ts` | Usar RPC para contar usuários |

