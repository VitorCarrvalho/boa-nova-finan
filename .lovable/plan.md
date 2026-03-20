

# Adicionar upload de foto no cadastro público de membros

## Problema

O bucket `profile-pictures` existe mas só permite upload por usuários autenticados. O formulário público é acessado por `anon`, então precisa de um bucket/policy que permita upload anônimo.

## Solução

### 1. Migração SQL: Criar bucket `member-photos` com policy anon

- Criar bucket `member-photos` (público, para exibir as fotos)
- Policy INSERT para `anon`: permitir upload no bucket `member-photos` (com path livre)
- Policy SELECT para `public`: permitir leitura pública

### 2. `src/pages/MemberRegistration.tsx`

- Adicionar estado `photoFile` e `photoPreview` para preview da imagem selecionada
- Adicionar campo de upload com preview circular (Avatar) antes dos campos do formulário
- No `handleSubmit`:
  1. Se há foto, fazer upload para `member-photos/{tenantId}/{timestamp}.ext`
  2. Obter URL pública
  3. Inserir no `members` com `photo_url` preenchido
- Aceitar apenas imagens (JPG, PNG, WEBP), máximo 5MB
- Preview da foto selecionada com opção de remover

## Arquivos

| Arquivo | Alteração |
|---|---|
| Migração SQL | Criar bucket `member-photos` + policies anon |
| `src/pages/MemberRegistration.tsx` | Campo de upload com preview + lógica de upload no submit |

