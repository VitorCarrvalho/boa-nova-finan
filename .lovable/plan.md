

# Correção: Pastor da Lagoinha não vê menu de Membros nem registros

## Problemas identificados

### Problema 1 — Pastor não está atribuído à congregação
A congregação "Sede" da Lagoinha tem `responsible_pastor_ids: []`. O hook `useUserCongregationAccess` procura congregações onde o pastor está listado em `responsible_pastor_ids`. Como o pastor `vitor@lagoinha.com` não está nesse array, `assignedCongregations` retorna vazio.

Em `useMemberData.ts`, quando o perfil é "Pastor" e `assignedCongregations` está vazio, o código retorna `[]` imediatamente (linha 32-34), sem nem fazer query ao banco.

**Impacto**: Mesmo que o menu apareça, a lista de membros vem vazia.

### Problema 2 — `useMemberData` é restritivo demais para Pastores
O filtro de congregação em `useMemberData` é hardcoded para o perfil "Pastor". Se um pastor não estiver vinculado a nenhuma congregação via `responsible_pastor_ids`, ele simplesmente não vê NENHUM membro — mesmo que seu perfil de acesso tenha permissão total ao módulo `membros`.

A lógica deveria respeitar as permissões do perfil de acesso, não fazer um filtro rígido baseado no nome "Pastor".

### Problema 3 — Menu pode não aparecer (race condition)
O `usePermissions` depende de `userPermissions` estar carregado no AuthContext. Se o sidebar renderiza antes do `processUserAuthentication` completar, `userPermissions` é `null` → `hasPermission` retorna `false` → menu não aparece. Em geral isso se resolve ao re-renderizar, mas pode causar flicker ou falha visual.

## Correções

### 1. `src/hooks/useMemberData.ts` — Remover filtro hardcoded de Pastor
Remover a lógica que filtra membros por `assignedCongregations` quando o perfil é "Pastor". A filtragem por congregação deve ser feita apenas se o módulo `membros` exigir acesso a congregação (e atualmente não exige — `requiresCongregationAccess` não está definido para membros). O RLS já garante isolamento por tenant.

```ts
// ANTES: filtro rígido por perfil "Pastor"
if (userAccessProfile === 'Pastor' && congregationAccess?.assignedCongregations) { ... }

// DEPOIS: remover esse bloco inteiro
// A RLS já filtra por tenant_id, não precisa filtrar por congregação no frontend
```

Mesma correção para `useMemberStats`.

### 2. Verificar se o menu de membros aparece corretamente
Após a correção do filtro, o menu deve aparecer normalmente pois as permissões estão corretas no banco (`membros.view: true`). Se persistir um problema de timing, adicionar um guard no sidebar para não filtrar itens enquanto `userPermissions` for `null`.

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/hooks/useMemberData.ts` | Remover filtro hardcoded por congregação para perfil "Pastor" em `useMembers` e `useMemberStats` |

