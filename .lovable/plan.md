

# Cadastro Público de Membros com Aprovação

## Resumo

Criar uma página pública (`/cadastro-membro/:slug`) onde novos membros preenchem todos os campos do cadastro. Após envio, recebem confirmação de que está em análise. Na tela de Membros, uma nova aba "Pendentes de Aprovação" permite ao admin aprovar (membro vira ativo) ou rejeitar (registro excluído).

## Alterações

### 1. Migração SQL: Adicionar campo `approval_status` à tabela `members`

- Adicionar coluna `approval_status text NOT NULL DEFAULT 'approved'` (para manter compatibilidade com membros existentes)
- Valores possíveis: `pending`, `approved`, `rejected`
- Adicionar policy RLS para `anon` INSERT: permitir inserção com `status = 'pending'` e `terms_accepted` (ou sem autenticação, dado que é público)
- Nova policy: `Anon can submit member registration` — INSERT para `anon` com `WITH CHECK (approval_status = 'pending')`
- Atualizar a query de `useMembers` para filtrar `approval_status = 'approved'` por padrão

### 2. Nova página: `src/pages/MemberRegistration.tsx`

- URL pública: `/cadastro-membro/:slug`
- Resolve o `slug` para buscar o `tenant_id` da tabela `tenants` (via query pública)
- Formulário completo: Nome, CPF, RG, Email, Telefone, Endereço, Escolaridade, Instagram, Congregação (dropdown público filtrado pelo tenant), Ministérios (checkboxes)
- Insere na tabela `members` com `is_active = false`, `approval_status = 'pending'`, `tenant_id` do slug
- Após envio: tela de sucesso com mensagem "Cadastro recebido! Seu cadastro está em análise e será avaliado pela administração."
- Layout limpo sem sidebar, sem autenticação

### 3. RLS: Permitir `anon` acessar congregações pelo tenant

- Criar nova policy SELECT `anon` na tabela `congregations` para que o formulário público consiga listar congregações: `USING (is_active = true AND tenant_id = <tenant do slug>)`
- Alternativa mais simples: usar a view `congregations_public` já existente (que não tem RLS)

### 4. Rota no `src/App.tsx`

- Adicionar rota pública `/cadastro-membro/:slug` sem `ProtectedRoute`

### 5. Aba "Pendentes" na página `src/pages/Members.tsx`

- Adicionar `Tabs` com duas abas: "Membros" (lista atual) e "Pendentes de Aprovação"
- Na aba pendentes: lista de membros com `approval_status = 'pending'`
- Cada item tem botões "Aprovar" e "Rejeitar"
- Aprovar: atualiza `approval_status = 'approved'` e `is_active = true`
- Rejeitar: deleta o registro da tabela `members`
- Badge com contagem de pendentes na aba

### 6. Hook `src/hooks/usePendingMembers.ts`

- Query: `members` WHERE `approval_status = 'pending'` AND tenant do usuário
- Mutations: `approveMember` (UPDATE status), `rejectMember` (DELETE)

### 7. Atualizar `src/hooks/useMemberData.ts`

- `useMembers`: adicionar filtro `.eq('approval_status', 'approved')` para não misturar pendentes na listagem principal

## Arquivos

| Arquivo | Alteração |
|---|---|
| Migração SQL | Adicionar `approval_status`, policy anon INSERT |
| `src/pages/MemberRegistration.tsx` | Nova página pública |
| `src/App.tsx` | Rota `/cadastro-membro/:slug` |
| `src/pages/Members.tsx` | Adicionar sistema de abas com "Pendentes" |
| `src/hooks/usePendingMembers.ts` | Novo hook para pendentes |
| `src/hooks/useMemberData.ts` | Filtrar approved na listagem |

## Segurança

- Formulário público aceita apenas INSERT com `approval_status = 'pending'`
- Anon não pode alterar status nem ver membros existentes
- Aprovação/rejeição restrita a admins via RLS existente
- `tenant_id` resolvido pelo slug no servidor, não manipulável pelo cliente

