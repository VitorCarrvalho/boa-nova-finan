

# Mover logo do header para o topo do sidebar

## Alterações

### 1. `src/components/layout/DesktopSidebar.tsx`
- Receber `displayLogo` e `displayName` como props
- Adicionar no topo do Sidebar (antes do `SidebarContent`) um `SidebarHeader` com o logo centralizado
- Quando collapsed: mostrar logo menor centralizado
- Quando expanded: mostrar logo maior centralizado

### 2. `src/components/layout/Layout.tsx` (desktop, linhas 85-112)
- Passar `displayLogo` e `displayName` como props para `DesktopSidebar`
- Remover `<img>` do logo e `<h1>` do nome da organização do header desktop
- Manter apenas `SidebarTrigger` e `HeaderProfile` no header

### 3. `src/components/layout/MobileSidebar.tsx`
- Aplicar a mesma lógica: adicionar logo no topo do sidebar mobile
- Remover logo do header mobile no `Layout.tsx` (linhas 54-82)

## Resultado
- Logo aparece centralizado no topo do sidebar (desktop e mobile)
- Header fica mais limpo, com apenas o trigger e o perfil do usuário
- Quando sidebar recolhida, logo fica em versão compacta

