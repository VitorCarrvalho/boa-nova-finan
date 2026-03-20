

# Criar usuário diretamente pela Gestão de Acessos > Usuários

## Contexto

Atualmente, a aba "Usuários" em Configurações só lista e edita usuários existentes. Não há funcionalidade para criar um novo usuário diretamente. A criação hoje só é possível via Super Admin (Gestão de Tenants). Precisamos permitir que o admin da organização crie usuários diretamente.

## Abordagem

Criar uma edge function `create-org-user` que o admin da organização pode chamar (diferente da `create-tenant-user` que é exclusiva do super admin). Adicionar um botão "Novo Usuário" e um dialog com formulário nos componentes desktop e mobile.

## Alterações

### 1. Edge Function: `supabase/functions/create-org-user/index.ts`

Nova edge function que:
- Valida que o caller é admin da organização (`is_current_user_org_admin`)
- Recebe: `name`, `email`, `password`, `profileId`, `congregationId` (opcional)
- Usa `supabaseAdmin.auth.admin.createUser()` para criar o auth user
- Atualiza o `profiles` com `tenant_id` do caller, `approval_status = 'ativo'`, `profile_id`, `congregation_id`
- Cria `user_profile_assignments`
- Reutiliza email existente se já registrado (mesmo padrão do `create-tenant-user`)

### 2. `src/components/settings/UserManagement.tsx` (Desktop)

- Adicionar botão "Novo Usuário" no header do Card
- Adicionar Dialog com formulário: Nome, Email, Senha, Perfil de Acesso (dropdown), Congregação (dropdown opcional)
- Ao submeter, chamar `supabase.functions.invoke('create-org-user', { body: {...} })`
- Após sucesso, fechar dialog e `refetch()`

### 3. `src/components/access-management/MobileUserManagement.tsx` (Mobile)

- Mesmo botão e dialog adaptado para mobile (usando Sheet)
- Mesma lógica de criação via edge function

## Fluxo do Formulário

| Campo | Tipo | Obrigatório |
|---|---|---|
| Nome Completo | Input text | Sim |
| Email | Input email | Sim |
| Senha Temporária | Input password (min 6) | Sim |
| Perfil de Acesso | Select (access_profiles do tenant) | Sim |
| Congregação | Select (congregations do tenant) | Não |

## Arquivos

| Arquivo | Alteração |
|---|---|
| `supabase/functions/create-org-user/index.ts` | Nova edge function |
| `src/components/settings/UserManagement.tsx` | Botão + Dialog de criação |
| `src/components/access-management/MobileUserManagement.tsx` | Botão + Dialog de criação (mobile) |

## Segurança

- A edge function valida que o caller pertence ao tenant e é admin
- O novo usuário herda o `tenant_id` do caller
- Senha temporária definida pelo admin; usuário pode alterar depois
- Perfil de acesso atribuído na criação (não fica "em_analise")

