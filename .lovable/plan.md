

# Criar tela de visualização de Pedidos de Oração (área logada)

## Problema

Os pedidos de oração são enviados pela Home pública e salvos no banco com `tenant_id`, mas não existe nenhuma tela na área logada para os admins visualizarem esses pedidos.

## Solução

Criar uma página de listagem de pedidos de oração acessível para admins da organização no menu lateral.

### 1. `src/pages/PedidosOracao.tsx` — Nova página

- Layout padrão com `<Layout>`
- Query para listar pedidos de oração filtrados por `tenant_id` do usuário logado (a RLS já filtra)
- Tabela/cards com colunas: Nome (ou "Anônimo"), Texto do pedido, Data de envio
- Ordenação por data decrescente (mais recentes primeiro)
- Busca por nome ou texto

### 2. `src/hooks/usePedidosOracao.ts` — Adicionar query de listagem

- Adicionar `useQuery` para buscar pedidos com `supabase.from('pedidos_oracao').select('*').order('created_at', { ascending: false })`
- A RLS existente (`Admins can view tenant prayer requests`) já garante isolamento por tenant

### 3. `src/App.tsx` — Adicionar rota

- Rota protegida `/pedidos-oracao` apontando para a nova página

### 4. `src/components/layout/Sidebar.tsx` — Adicionar item no menu

- Novo item "Pedidos de Oração" com ícone `Heart` no menu lateral

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/pages/PedidosOracao.tsx` | Nova página com listagem |
| `src/hooks/usePedidosOracao.ts` | Adicionar query de listagem |
| `src/App.tsx` | Adicionar rota protegida |
| `src/components/layout/Sidebar.tsx` (ou `DesktopSidebar`/`MobileSidebar`) | Adicionar item no menu |

