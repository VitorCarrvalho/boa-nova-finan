

# Correção: Usuários da organização não aparecem (recursão infinita em RLS)

## Problema Real

O admin da organização **foi criado com sucesso** no banco de dados. O registro `admin@mica.com` existe com `tenant_id` correto e role `owner` na tabela `tenant_admins`. O problema é que ao tentar **visualizar** os usuários do tenant (dialog "Gerenciar Usuários"), a query em `profiles` falha com:

```
infinite recursion detected in policy for relation "profiles"
```

Isso acontece porque a policy `Admins can manage all profiles` usa `is_current_user_org_admin()`, que internamente consulta `profiles` → `access_profiles` → `profiles`, gerando recursão. Como o super admin não está em `profiles` com um `profile_id` válido de uma organização, o Postgres entra em loop.

## Solução

### 1. Migração SQL: Criar função `SECURITY DEFINER` para buscar profiles por IDs

Criar uma função segura que bypassa RLS para buscar profiles específicos, usada pelo `useTenantUsers`:

```sql
CREATE OR REPLACE FUNCTION public.get_profiles_by_ids(_user_ids uuid[])
RETURNS TABLE(id uuid, name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.name, p.email
  FROM public.profiles p
  WHERE p.id = ANY(_user_ids);
$$;
```

### 2. Código: Alterar `useTenantUsers.ts` para usar a função RPC

Substituir a query direta em `profiles` (linhas 61-64) por uma chamada RPC:

```typescript
const { data: profiles, error: profilesError } = await supabase
  .rpc('get_profiles_by_ids', { _user_ids: userIds });
```

Isso evita completamente a recursão de RLS, pois a função `SECURITY DEFINER` executa com privilégios do owner.

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| Migração SQL | Criar função `get_profiles_by_ids` |
| `src/hooks/useTenantUsers.ts` | Usar `rpc('get_profiles_by_ids')` ao invés de query direta |

## Resultado

- O dialog de "Gerenciar Usuários" mostrará corretamente os admins criados
- O super admin conseguirá visualizar usuários de qualquer organização sem erros de recursão

