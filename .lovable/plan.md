

# Plano: Isolar Super Admin exclusivamente nas rotas /admin

## Problema

1. **Super Admin vê sidebar de organização**: `usePermissions` retorna `isFullAccess = true` para super admins, fazendo `canViewModule` retornar `true` para todos os módulos de organização. O `Layout.tsx` só usa `SuperAdminLayout` em rotas `/admin/*` — nas demais, renderiza o sidebar normal com todos os módulos.

2. **Botão "Ver como Tenant" ainda existe**: Em `SuperAdminLayout.tsx`, o botão redireciona para `/dashboard`, permitindo ao super admin acessar rotas de organização.

3. **Super Admin não é redirecionado**: O `ProtectedRoute` só redireciona super admin de `/` para `/admin`, mas permite acesso a qualquer outra rota de organização (`/dashboard`, `/membros`, etc.).

## Correções

### 1. ProtectedRoute — Bloquear super admin em rotas de organização

**Arquivo:** `src/components/ProtectedRoute.tsx`

Após o check de `isAdminRoute` (linha 55-70), adicionar:

```
// Super Admin só pode acessar rotas /admin/*
if (isSuperAdmin && !isAdminRoute) {
  return <Navigate to="/admin" replace />;
}
```

Isso garante que qualquer tentativa de acessar `/dashboard`, `/membros`, etc. redireciona automaticamente para `/admin`.

### 2. SuperAdminLayout — Remover "Ver como Tenant"

**Arquivo:** `src/components/layout/SuperAdminLayout.tsx`

- Remover o `Button` "Ver como Tenant" (linha 80-87)
- Remover a função `handleSwitchToTenantView` e o `import useNavigate`
- Remover o `DropdownMenuItem` "Ver como Tenant" do dropdown mobile (linha 107-112)

### 3. Layout — Simplificar lógica de super admin

**Arquivo:** `src/components/layout/Layout.tsx`

Com o ProtectedRoute bloqueando rotas de org para super admin, a condição na linha 50 (`if (isSuperAdmin && isAdminRoute)`) se torna redundante, mas pode ser mantida como fallback seguro. Remover o comentário sobre "Ver como Tenant".

### Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| `src/components/ProtectedRoute.tsx` | Bloquear super admin em rotas não-admin |
| `src/components/layout/SuperAdminLayout.tsx` | Remover botão/menu "Ver como Tenant" |

### Resultado

- Super Admin loga → vai para `/admin`
- Super Admin tenta acessar `/dashboard` → redirecionado para `/admin`
- Sidebar do super admin mostra apenas: Dashboard, Organizações, Billing, Métricas, Auditoria, Configurações
- Botão "Ver como Tenant" não existe mais

