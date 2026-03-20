

# Correção: Falha na criação de admin ao criar organização + Limpeza de usuários órfãos

## Problemas Identificados

### 1. Erro "email already exists"
Os logs da edge function `create-tenant-user` mostram que `admin@mica.com` já existia no `auth.users` de tentativas anteriores. A edge function falha com erro 400, mas o tenant já foi criado nos steps 1-4 do `useTenantAdmin.createTenant`. Resultado: organização criada, admin não vinculado.

### 2. Sem rollback do tenant
O `useTenantAdmin.createTenant` cria o tenant (step 1), settings (steps 2-4) e só depois chama a edge function (step 5). Se a edge function falha, o tenant persiste sem admin.

### 3. Usuários órfãos
13 usuários sem `tenant_id` e sem ser super admin existem no banco. Todos devem ser removidos.

## Correções

### 1. Limpeza de dados — Edge Function `create-tenant-user`

Atualizar a edge function para lidar com o caso de email já existente:

- Quando `auth.admin.createUser` retorna erro `email_exists`, buscar o usuário existente via `auth.admin.listUsers` por email
- Verificar se o usuário já pertence a outro tenant (via profiles.tenant_id)
  - Se sim: retornar erro "Usuário já pertence a outra organização"
  - Se não: reutilizar o auth user existente e continuar com os steps 4-6 (update profile, create tenant_admin, create assignment)

**Arquivo:** `supabase/functions/create-tenant-user/index.ts` (linhas 277-291)

### 2. Rollback do tenant ao falhar — `useTenantAdmin.ts`

No `createTenant`, se a edge function falhar (step 5), deletar o tenant criado no step 1:

```typescript
if (fnError || !fnData?.success) {
  // Rollback: delete tenant and its settings
  await supabase.from('tenant_settings').delete().eq('tenant_id', tenantId);
  await supabase.from('access_profiles').delete().eq('tenant_id', tenantId);
  await supabase.from('tenants').delete().eq('id', tenantId);
  throw new Error(fnData?.error || fnError?.message || 'Erro ao criar administrador');
}
```

**Arquivo:** `src/hooks/useTenantAdmin.ts` (linhas 277-281)

### 3. Limpeza de usuários órfãos — SQL via edge function

Usar a edge function `create-tenant-user` para deletar os 13 usuários órfãos do `auth.users` (que também remove profiles via cascade). Isso será feito com uma modificação temporária ou via SQL migration que:

- Deleta de `auth.users` os IDs dos profiles que não são super admin e não têm `tenant_id`
- Isso requer `SECURITY DEFINER` pois `auth.users` é schema reservado

Como não podemos modificar `auth.users` via migration, a limpeza será feita pela edge function existente ou por uma nova edge function de cleanup que usa `supabaseAdmin.auth.admin.deleteUser()`.

Alternativa mais simples: criar uma edge function temporária `cleanup-orphan-users` que:
1. Lista profiles sem tenant_id e que não são super admins
2. Deleta cada um via `auth.admin.deleteUser(id)` (cascade remove profile)

### Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| `supabase/functions/create-tenant-user/index.ts` | Handle "email exists" reutilizando auth user |
| `src/hooks/useTenantAdmin.ts` | Rollback tenant se criação de admin falhar |
| `supabase/functions/cleanup-orphan-users/index.ts` | Nova edge function para limpar usuários órfãos |

