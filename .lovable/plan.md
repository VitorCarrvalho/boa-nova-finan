

# Mover "Gestão de Acessos" para dentro de "Configurações"

## Abordagem

Remover o item "Gestão de Acessos" como menu independente no sidebar e transformá-lo em uma aba dentro da página de Configurações, ao lado das abas existentes (Branding, Home, Módulos, Geral, Segurança).

## Alterações

### 1. `src/pages/Settings.tsx` — Adicionar aba "Gestão de Acessos"
- Importar os componentes de AccessManagement (PendingApprovals, ProfileConfiguration, UserManagement e versões mobile)
- Adicionar nova `TabsTrigger` com ícone `Shield` e label "Gestão de Acessos"
- Adicionar `TabsContent` que renderiza o conteúdo da página AccessManagement (as 3 sub-abas: Contas a Aprovar, Configuração de Perfis, Usuários)
- Condicionar a visibilidade da aba com `canViewModule('gestao-acessos')` via `usePermissions`

### 2. `src/components/layout/DesktopSidebar.tsx` (linhas 305-314) — Remover item
- Remover o bloco `{canViewModule('gestao-acessos') && (...)}` que renderiza o menu "Gestão de Acessos"

### 3. `src/components/layout/MobileSidebar.tsx` (linhas 481-490) — Remover item
- Remover o bloco `{canAccessAccessManagement && (...)}` que renderiza "Gestão de Acessos"

### 4. `src/App.tsx` — Manter rota `/gestao-acessos`
- Manter a rota existente para não quebrar links diretos, mas opcionalmente redirecionar para `/configuracoes?tab=gestao-acessos`

## Resultado
- "Gestão de Acessos" aparece como aba dentro de Configurações, junto a Branding, Home, Módulos, Geral e Segurança
- Menu lateral fica mais limpo, sem item independente de Gestão de Acessos
- Funcionalidade preservada integralmente

