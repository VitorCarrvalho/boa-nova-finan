

# Correção: Formulário público de cadastro de membros

## Problema 1: Logo genérico ao invés do logo da organização

A página `MemberRegistration.tsx` usa um ícone `<Church>` do Lucide. O logo real da organização está salvo em `tenant_settings` (category = 'branding', `settings.logoUrl`).

**Correção**: Na função `loadTenant`, buscar também o `tenant_settings` com `category = 'branding'` para o tenant, extrair `settings.logoUrl` e `settings.churchName`. Substituir o ícone `<Church>` por uma tag `<img>` com o logo real. Se não houver logo, manter o ícone como fallback.

## Problema 2: Erro `null value in column "user_id" of relation "audit_logs"`

O trigger `audit_members` na tabela `members` executa `log_changes()`, que insere em `audit_logs` com `user_id = auth.uid()`. Para inserções anônimas (formulário público), `auth.uid()` é `NULL`, mas `audit_logs.user_id` é `NOT NULL`.

**Correção**: Migração SQL para alterar a função `log_changes()` — usar `COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)` como `user_id`, ou tornar a coluna `user_id` nullable em `audit_logs`. A opção mais limpa é tornar `user_id` nullable, pois registros criados anonimamente legitimamente não têm usuário.

## Arquivos

| Arquivo | Alteração |
|---|---|
| Migração SQL | Tornar `audit_logs.user_id` nullable + atualizar `log_changes()` para aceitar `auth.uid()` null |
| `src/pages/MemberRegistration.tsx` | Buscar branding do tenant e exibir logo real |

