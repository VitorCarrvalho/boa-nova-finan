

# Correções: Menu "Gestão de Tenants" visível para admin + Sidebar expandida por padrão

## Problema 1: Menu "Gestão de Tenants" aparece para admin da organização

No `DesktopSidebar.tsx` (linha ~310), o item "Gestão de Tenants" usa a condição `isSuperAdmin`, que vem do hook `usePermissions`. Porém, o admin da organização pode estar recebendo `isSuperAdmin = true` incorretamente, ou a condição não está funcionando. Preciso verificar se o `useSuperAdmin` está retornando corretamente `false` para admins de organização.

Olhando o código (linha 309): `{isSuperAdmin && (` -- isso deveria funcionar. Vou verificar se o `usePermissions` repassa corretamente o valor do `useSuperAdmin`.

No `usePermissions.ts` linha 10: `const { isSuperAdmin } = useSuperAdmin();` -- isso está correto. Se o admin da organização não está na tabela `super_admins`, deveria retornar `false`. É possível que o usuário admin criado para a organização tenha sido inserido na tabela `super_admins` por engano durante testes. Vou verificar via query.

Independente disso, a correção no código é adicionar uma verificação dupla: além de `isSuperAdmin`, verificar que a rota `/admin` é exclusiva. Mas como o sidebar já usa `isSuperAdmin` corretamente, o problema provavelmente é nos dados.

## Problema 2: Sidebar deve abrir expandida com textos

O `Layout.tsx` já tem `defaultOpen={true}` na linha 86, então a sidebar desktop já abre expandida. A funcionalidade de recolher já existe via `SidebarTrigger` no header. Isso já está implementado corretamente.

## Plano de Ação

### 1. Verificar dados — query `super_admins`
Verificar se o admin da organização está indevidamente na tabela `super_admins`. Se sim, removê-lo.

### 2. Garantia no código — `DesktopSidebar.tsx`
Como camada extra de segurança, verificar que o item "Gestão de Tenants" não aparece para usuários com `tenant_id` (admins de organização são sempre vinculados a um tenant):

**Arquivo:** `src/components/layout/DesktopSidebar.tsx` (linha ~309)

Alterar de:
```tsx
{isSuperAdmin && (
```
Para:
```tsx
{isSuperAdmin && !user?.tenant_id && (
```

Porém o `user` do AuthContext é o auth user, não o profile. Alternativa mais segura: manter apenas `isSuperAdmin` mas garantir que o hook `useSuperAdmin` consulta corretamente a tabela dedicada (já faz isso).

**Ação real**: Verificar a tabela `super_admins` e, se necessário, limpar dados. No código, a condição `isSuperAdmin` já é correta.

### 3. Sidebar — confirmar comportamento
O layout já está configurado com `defaultOpen={true}` e `SidebarTrigger` visível. Nenhuma alteração necessária, apenas confirmar que funciona.

---

**Resumo**: A investigação principal é na tabela `super_admins` para verificar se há registros indevidos. A correção no código será mínima — apenas se os dados estiverem corretos e mesmo assim o menu aparecer.

