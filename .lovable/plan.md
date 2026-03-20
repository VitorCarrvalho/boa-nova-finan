

# Funcionalidades para Pedidos de Oração

## Situação atual

A tabela `pedidos_oracao` possui apenas: `id`, `nome`, `texto`, `created_at`, `tenant_id`. A página é uma listagem simples sem nenhuma ação.

## Plano

### 1. Migração SQL: Adicionar colunas de gestão

Adicionar à tabela `pedidos_oracao`:
- `is_read boolean NOT NULL DEFAULT false` — marcar como visto
- `is_followed boolean NOT NULL DEFAULT false` — flag de acompanhar
- `read_at timestamptz` — quando foi lido
- `read_by uuid` — quem leu

Adicionar policy de UPDATE e DELETE para admins autenticados do tenant:
- UPDATE: `is_current_user_org_admin() AND tenant_id = get_user_tenant_id(auth.uid())`
- DELETE: mesma condição

### 2. `src/hooks/usePedidosOracao.ts` — Adicionar mutations

- `markAsRead(id)` — UPDATE `is_read = true, read_at = now(), read_by = auth.uid()`
- `toggleFollow(id, value)` — UPDATE `is_followed = value`
- `deletePedido(id)` — DELETE por id
- Cada mutation invalida `queryKey: ['pedidos-oracao']`

### 3. `src/pages/PedidosOracao.tsx` — UI completa

- Adicionar colunas na tabela: Status (visto/não visto), Acompanhar (flag), Ações
- Botão "Marcar como visto" (ícone Eye/EyeOff) com toggle
- Botão estrela/bookmark para "Acompanhar" com toggle
- Botão de deletar com confirmação via AlertDialog
- Filtros por tabs: Todos / Não lidos / Acompanhados
- Badge com contagem de não lidos no header
- Linha com destaque visual (bg diferente) para pedidos não lidos

## Arquivos

| Arquivo | Alteração |
|---|---|
| Migração SQL | Adicionar colunas `is_read`, `is_followed`, `read_at`, `read_by`; policies UPDATE/DELETE |
| `src/hooks/usePedidosOracao.ts` | Mutations: markAsRead, toggleFollow, deletePedido |
| `src/pages/PedidosOracao.tsx` | UI com ações, filtros por tab, badges, confirmação de exclusão |

