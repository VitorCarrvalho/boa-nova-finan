

# Correção: Lista de usuários mostra usuários de todas as organizações

## Problema

Os componentes `UserManagement.tsx` e `MobileUserManagement.tsx` fazem `SELECT` na tabela `profiles` com filtro apenas por `approval_status = 'ativo'`, sem filtrar por `tenant_id`. Como as policies RLS da tabela `profiles` são permissivas (OR entre múltiplas policies), usuários de outras organizações ficam visíveis.

O mesmo problema afeta `PendingApprovals.tsx` e `MobilePendingApprovals.tsx` (contas a aprovar).

## Solução

Criar uma RPC `SECURITY DEFINER` que retorna perfis filtrados por `tenant_id`, similar ao padrão já usado em `get_profiles_by_ids` e `count_profiles_by_tenant`.

### 1. Migração SQL: Criar função `get_tenant_profiles`

```sql
CREATE OR REPLACE FUNCTION public.get_tenant_profiles(
  _status text DEFAULT 'ativo'
)
RETURNS TABLE(
  id uuid, name text, email text, role user_role,
  profile_id uuid, congregation_id uuid, 
  approval_status text, created_at timestamptz,
  photo_url text, ministries text[],
  rejection_reason text, tenant_id uuid
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.id, p.name, p.email, p.role,
         p.profile_id, p.congregation_id,
         p.approval_status, p.created_at,
         p.photo_url, p.ministries,
         p.rejection_reason, p.tenant_id
  FROM public.profiles p
  WHERE p.tenant_id = get_user_tenant_id(auth.uid())
    AND p.approval_status = _status;
$$;
```

### 2. `src/components/settings/UserManagement.tsx` (linhas 31-42)

Substituir a query direta por RPC + join manual com `access_profiles`:

```typescript
const { data: profilesData } = await supabase.rpc('get_tenant_profiles', { _status: 'ativo' });
// Then fetch access_profiles for each profile_id
```

### 3. `src/components/access-management/MobileUserManagement.tsx` (linhas 56-68)

Mesma substituição: usar RPC `get_tenant_profiles` ao invés de query direta em `profiles`.

### 4. Verificar PendingApprovals e MobilePendingApprovals

Aplicar mesma correção para listar apenas pendentes da organização, usando `get_tenant_profiles` com `_status: 'em_analise'`.

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| Migração SQL | Criar função `get_tenant_profiles` |
| `src/components/settings/UserManagement.tsx` | Usar RPC para listar usuários |
| `src/components/access-management/MobileUserManagement.tsx` | Usar RPC para listar usuários |
| `src/components/access-management/PendingApprovals.tsx` | Usar RPC para pendentes |
| `src/components/access-management/MobilePendingApprovals.tsx` | Usar RPC para pendentes |

## Resultado
- Admin da organização vê apenas usuários do seu tenant
- Pendentes de aprovação filtrados por organização
- Sem dependência das policies RLS permissivas para isolamento

