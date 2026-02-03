
# Plano: Gestão de Usuários por Tenant

## Objetivo
Implementar um sistema para que Super Admins possam criar e gerenciar usuários administradores para cada tenant diretamente da página de Gestão de Tenants.

## Fluxo de Uso

1. Super Admin clica em "Usuários" no menu de ações do tenant Mica
2. Abre um dialog mostrando a lista de admins do tenant (atualmente vazia)
3. Super Admin clica em "Adicionar Admin"
4. Preenche: Nome, Email, Senha temporária e Role (Owner/Admin/Manager)
5. Sistema cria o usuário no Supabase Auth e associa ao tenant
6. Usuário recebe email de confirmação e pode acessar o sistema do tenant

## Arquivos a Criar

### 1. `src/components/tenants/TenantUsersDialog.tsx`
Dialog principal para gestão de usuários do tenant.

```text
+----------------------------------------------+
|  Usuários - Mica                        [X] |
|----------------------------------------------|
|  Gerencie os administradores deste tenant    |
|                                              |
|  [+ Adicionar Admin]                         |
|                                              |
|  +------------------------------------------+|
|  | Nome         | Email           | Role    ||
|  |--------------|-----------------|---------|
|  | João Silva   | joao@mica.com   | Owner   ||
|  | Maria Santos | maria@mica.com  | Admin   ||
|  +------------------------------------------+|
|                                              |
|                              [Fechar]        |
+----------------------------------------------+
```

Funcionalidades:
- Listar admins do tenant (da tabela `tenant_admins`)
- Botão para adicionar novo admin
- Opção de remover admin existente
- Mostrar role de cada admin (Owner/Admin/Manager)

### 2. `src/components/tenants/TenantUserFormDialog.tsx`
Sub-dialog para criar/editar um admin.

```text
+----------------------------------------------+
|  Adicionar Administrador                [X] |
|----------------------------------------------|
|                                              |
|  Nome Completo                               |
|  [____________________________]              |
|                                              |
|  Email                                       |
|  [____________________________]              |
|                                              |
|  Senha Temporária                            |
|  [____________________________]              |
|                                              |
|  Perfil de Acesso do Tenant                  |
|  [Owner ▼]                                   |
|   - Owner: Acesso total ao tenant            |
|   - Admin: Gerencia usuários e configs       |
|   - Manager: Gerencia operações              |
|                                              |
|             [Cancelar]  [Criar Usuário]      |
+----------------------------------------------+
```

### 3. `src/hooks/useTenantUsers.ts`
Hook para operações CRUD de usuários do tenant.

```typescript
interface TenantUser {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'manager';
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

// Funções:
- fetchTenantUsers(tenantId)
- createTenantUser(tenantId, userData)
- updateTenantUserRole(userId, newRole)
- removeTenantUser(userId)
```

## Arquivos a Modificar

### 4. `src/pages/admin/AdminTenants.tsx`
- Adicionar estado `usersOpen` e `TenantUsersDialog`
- Implementar `handleManageUsers` para abrir o dialog

### 5. `src/hooks/useTenantAdmin.ts`
- Adicionar função `createTenantUser` que:
  1. Cria usuário no Supabase Auth via `supabase.auth.admin.createUser()`
  2. Insere registro em `profiles` com `tenant_id` correto
  3. Insere registro em `tenant_admins` com a role selecionada

## Fluxo Técnico de Criação de Usuário

```text
1. Super Admin preenche formulário
         |
         v
2. Chamar supabase.auth.admin.createUser()
   - email, password, email_confirm: true
         |
         v
3. Criar profile no banco
   - id: user.id
   - name, email, tenant_id
   - approval_status: 'ativo'
   - role: 'admin'
         |
         v
4. Criar tenant_admin
   - user_id, tenant_id
   - role: 'owner' | 'admin' | 'manager'
   - invited_by: super_admin_id
         |
         v
5. Usuário pode fazer login
   e acessar o tenant
```

## Considerações de Segurança

1. **Criação via Admin API**: Usar `supabase.auth.admin.createUser()` requer uma Edge Function com service_role key
2. **Alternativa**: Usar o fluxo de convite (`supabase.auth.inviteUserByEmail()`)
3. **RLS**: Usuários só verão dados do próprio tenant

## Estrutura de Permissões

| Role | Pode criar usuários | Pode editar branding | Pode ver relatórios |
|------|---------------------|----------------------|---------------------|
| Owner | Sim | Sim | Sim |
| Admin | Sim | Sim | Sim |
| Manager | Não | Não | Sim |

## Resultado Esperado

Após implementação, você poderá:
1. Clicar em "Usuários" no tenant Mica
2. Criar um admin com email `admin@mica.com`
3. Esse usuário poderá fazer login em `?tenant=mica`
4. Verá apenas dados da Mica, com branding personalizado
