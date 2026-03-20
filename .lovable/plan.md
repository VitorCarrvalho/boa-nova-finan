

# Isolar prestadores do Conecta Moove por organização (tenant)

## Problema

A tabela `service_providers` não possui coluna `tenant_id`. Todos os prestadores cadastrados são visíveis para qualquer admin de qualquer organização. Os 2 registros que aparecem na screenshot não pertencem à organização atual.

## Solução

### 1. Migração SQL: Adicionar `tenant_id` à `service_providers`

- Adicionar coluna `tenant_id uuid REFERENCES tenants(id)` à tabela
- Atualizar as policies RLS do admin para filtrar por `tenant_id = get_user_tenant_id(auth.uid())`
- A policy pública de leitura (`status = 'approved'`) pode continuar global (marketplace aberto) ou ser filtrada — depende da decisão abaixo
- A policy de INSERT deve setar `tenant_id` do caller

### 2. `src/pages/ConectaManagement.tsx` — Filtrar por tenant

- Na query de fetch (linha 72), não precisa de filtro manual pois a RLS já cuidará do isolamento
- No submit de novos providers, incluir `tenant_id` no payload

### 3. `src/components/conecta/ConectaSubmitForm.tsx` — Incluir tenant_id

- Ao inserir novo prestador, incluir o `tenant_id` do usuário logado

### 4. Dados existentes

- Os 2 registros existentes (SP e João Silva) provavelmente foram criados sem tenant_id. A migração pode atribuí-los ao tenant principal (Igreja Moove) ou deixá-los como `NULL` — nesse caso a RLS os excluirá automaticamente da visualização de tenants específicos.

## Decisão necessária

O marketplace Conecta é **global** (todos veem todos os aprovados) ou **por organização** (cada igreja vê só seus prestadores)?

- Se **global**: a policy SELECT pública permanece sem filtro de tenant. Apenas a gestão (admin) é isolada por tenant.
- Se **por organização**: a policy SELECT pública também filtra por tenant.

## Arquivos

| Arquivo | Alteração |
|---|---|
| Migração SQL | Adicionar `tenant_id`, atualizar RLS admin |
| `src/pages/ConectaManagement.tsx` | Nenhuma mudança manual necessária (RLS resolve) |
| `src/components/conecta/ConectaSubmitForm.tsx` | Incluir `tenant_id` no insert |

