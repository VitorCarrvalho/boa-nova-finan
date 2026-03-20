
# Correção: Perfis de acesso herdados indevidamente por novas organizações

## Problema

Duas causas raiz:

1. **RLS permite ver perfis globais**: A policy `Tenant users can view their tenant access profiles` inclui `tenant_id IS NULL`, fazendo o admin da organização ver todos os perfis globais (Super Admin, Gerente Financeiro, Membro, etc.) além dos seus próprios.

2. **Perfis padrão incompletos no onboard**: A função `onboard-tenant` cria apenas 4 perfis (Admin, Pastor, Gerente Financeiro, Membro), mas o correto são 5: **Admin, Analista, Pastor, Presidente, Diretor**.

## Solução

### 1. Migração SQL: Corrigir RLS da `access_profiles`

Alterar a policy `Tenant users can view their tenant access profiles` para que usuários de um tenant vejam **apenas** perfis do seu tenant (não mais perfis globais com `tenant_id IS NULL`):

```sql
DROP POLICY "Tenant users can view their tenant access profiles" ON access_profiles;
CREATE POLICY "Tenant users can view their tenant access profiles"
  ON access_profiles FOR SELECT TO public
  USING (
    is_super_admin() 
    OR (is_active = true AND tenant_id = get_user_tenant_id(auth.uid()))
  );
```

Também remover a policy `Users can view their own active access profile` (usa `get_current_user_profile_id()` que já é coberta pela policy acima):

```sql
DROP POLICY "Users can view their own active access profile" ON access_profiles;
CREATE POLICY "Users can view own profile"
  ON access_profiles FOR SELECT TO public
  USING (id = get_current_user_profile_id() AND is_active = true);
```

### 2. Edge Function: Atualizar perfis padrão no `onboard-tenant`

Substituir os 4 perfis atuais (Admin, Pastor, Gerente Financeiro, Membro) pelos 5 corretos:
- **Admin** — Acesso total à organização
- **Analista** — Visualiza contas a pagar e relatórios
- **Pastor** — Gestão da congregação com acesso financeiro
- **Presidente** — Acesso a todos os módulos e ações
- **Diretor** — Perfil para diretores com poder de aprovação

Remover Gerente Financeiro e Membro da lista padrão.

### 3. Limpeza de dados (via migração SQL)

Para a organização já criada (tenant `d7613584-...`), não há perfis extras indevidos — os perfis globais aparecem apenas na visualização. A correção da RLS resolve automaticamente.

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| Migração SQL | Corrigir RLS de `access_profiles` para filtrar por `tenant_id` |
| `supabase/functions/onboard-tenant/index.ts` | Substituir perfis padrão pelos 5 corretos |

## Resultado
- Admin da organização vê apenas os perfis do seu tenant
- Novos tenants recebem exatamente 5 perfis padrão
- Perfis criados pelo admin ficam isolados à sua organização
