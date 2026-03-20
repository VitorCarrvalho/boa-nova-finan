

# Plano de Correção: Gestão de Acesso Completa (2 Etapas)

## Resumo das Decisões do Usuário

| Decisão | Resposta |
|---|---|
| Super Admin "Ver como Org" | **Remover** funcionalidade |
| Deleção por admin da org | **Admin pode deletar tudo** na sua org |
| Cadastro de novos usuários | **Precisa aprovação** do admin |
| Controle de módulos | **Admin da org também controla** |
| Perfil Admin | **Fixo com acesso total** |
| Role vs Access Profile | **Migrar tudo para access_profiles** (em 2 etapas) |
| Componentes de debug | **Manter como está** |
| Rota /admin bloqueada | **Mostrar página 403** |
| Perfis customizados | **Toggle simples** (ativo/inativo por módulo) |
| Aprovação de usuário | **Escolher perfil + congregação** |

---

## ETAPA 1 — Frontend: Sidebar, Rotas e Permissões (esta implementação)

### 1.1 — Esconder "Gestão de Tenants" do sidebar (somente Super Admin)

**Arquivo:** `src/components/layout/DesktopSidebar.tsx`
- Importar `useSuperAdmin`
- Linha 323: trocar `canViewModule('gestao-acessos')` por `isSuperAdmin`
- Remover o item de menu "Gestão de Tenants" para qualquer usuário que não seja Super Admin

**Arquivo:** `src/components/layout/Sidebar.tsx`
- Mesma verificação: garantir que nenhum link para `/tenants` ou `/admin` apareça para não-superadmins

### 1.2 — Remover botão "Ver como Organização"

**Arquivo:** `src/components/tenants/TenantTable.tsx`
- Remover prop `onViewAsTenant` da interface e do componente
- Remover o `DropdownMenuItem` "Ver como Organização"

**Arquivo:** `src/pages/admin/AdminTenants.tsx`
- Remover a função `handleViewAsTenant` e a prop passada ao TenantTable

### 1.3 — Bloquear rotas `/admin/*` com página 403

**Arquivo:** `src/components/ProtectedRoute.tsx`
- Adicionar verificação: se `location.pathname.startsWith('/admin')` e `!isSuperAdmin`, renderizar componente 403 (mensagem "Acesso não autorizado" + botão voltar)
- Expandir lista `isTenantRoute` para incluir todas as rotas de organização: `/conciliacoes`, `/fornecedores`, `/gestao-acessos`, `/contas-pagar`, `/relatorios`, `/notificacoes`, `/ministerios`, `/departamentos`, `/congregacoes`, `/membros`, `/conecta`, `/documentacao`, `/configuracoes`, `/financeiro`, `/dashboard`

### 1.4 — Super Admin bypass total nas permissões

**Arquivo:** `src/hooks/usePermissions.ts`
- Importar `useSuperAdmin`
- Se `isSuperAdmin === true`, todas as funções (`canViewModule`, `canInsertModule`, `canEditModule`, `canDeleteModule`, etc.) retornam `true` automaticamente

### 1.5 — Perfil Admin fixo com acesso total

**Arquivo:** `src/hooks/usePermissions.ts`
- Adicionar lógica: se o `userAccessProfile === 'Admin'`, todas as permissões retornam `true` dentro da organização (sem consultar `access_profiles.permissions`)

### 1.6 — Admin da org pode deletar registros

**Arquivos de migração SQL:**
- Alterar RLS policies de `members` e `financial_records` que atualmente restringem DELETE a `superadmin`, para também permitir `admin` com `tenant_id` correspondente
- Policies afetadas:
  - `members`: "Apenas superadmins podem deletar membros" → adicionar `OR (get_current_user_role() = 'admin' AND tenant_id = get_user_tenant_id(auth.uid()))`
  - `financial_records`: "Apenas superadmins podem deletar registros financeiros" → mesma lógica

### 1.7 — Admin da org pode controlar módulos

A tela de Configurações já tem a aba de módulos (`TenantModulesTab`). Verificar que:
- O admin da org consegue salvar `tenant_settings` com `category = 'modules'` para seu próprio `tenant_id`
- O `useTenantModules` lê corretamente essa config

### 1.8 — Gestão de Acessos: perfis com toggle simples

**Arquivo:** `src/components/access-management/ProfileConfiguration.tsx`
- Na criação/edição de perfil, exibir lista de módulos com toggle simples (ativo/inativo) ao invés de granular por ação
- Quando ativo, setar todas as ações do módulo como `true` (view, insert, edit, delete, approve, export)
- Quando inativo, setar todas como `false`
- Perfil "Admin" não pode ser editado (fixo)

### 1.9 — Aprovação de usuário: perfil + congregação

Verificar que a tela de aprovação (aba "Contas a Aprovar") já permite selecionar perfil e congregação. Se não, adicionar dropdown de congregação no dialog de aprovação.

---

## ETAPA 2 — Backend: Migrar RLS de `role` para `access_profiles` (implementação futura)

Esta etapa será feita separadamente para reduzir risco:

- Criar nova função `get_current_user_access_profile_name()` que retorna o nome do access_profile do usuário
- Atualizar todas as RLS policies que usam `get_current_user_role()` para usar a nova função
- Remover dependência do campo `profiles.role` nas policies
- Manter campo `role` na tabela para compatibilidade mas sem uso em RLS
- Atualizar `get_current_user_role()` para derivar 100% do `access_profiles.name`

---

## Arquivos a Modificar (Etapa 1)

| Arquivo | Alteração |
|---|---|
| `src/components/layout/DesktopSidebar.tsx` | Menu "Gestão de Tenants" só para Super Admin |
| `src/components/layout/Sidebar.tsx` | Idem (mobile) |
| `src/components/ProtectedRoute.tsx` | Página 403 para `/admin/*` + expandir rotas tenant |
| `src/hooks/usePermissions.ts` | Bypass para Super Admin + Admin fixo com acesso total |
| `src/components/tenants/TenantTable.tsx` | Remover "Ver como Organização" |
| `src/pages/admin/AdminTenants.tsx` | Remover handler de "Ver como Organização" |
| `src/components/access-management/ProfileConfiguration.tsx` | Toggle simples por módulo |
| Migração SQL | RLS de DELETE em members e financial_records |

