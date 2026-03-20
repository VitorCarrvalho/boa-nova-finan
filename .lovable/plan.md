

# Adicionar campo de foto no formulário de membro (admin)

## Contexto

O `MemberForm.tsx` (usado por admins para criar/editar membros) não possui campo de upload de foto. O campo `photo_url` já existe na tabela `members` e o bucket `member-photos` já está configurado com policies. Basta adicionar o upload no formulário.

## Alterações

### `src/components/members/MemberForm.tsx`

- Adicionar estados `photoFile` e `photoPreview` (similar ao que já existe em `MemberRegistration.tsx`)
- Inicializar `photoPreview` com `member?.photo_url` quando editando
- Adicionar campo de upload com preview circular (Avatar) no topo do formulário, antes dos campos
- No `handleSubmit`: se há foto nova, fazer upload para `member-photos/{timestamp}.ext` e incluir `photo_url` no payload
- Usar o bucket `member-photos` existente (já tem policies para authenticated via `Tenant users can insert their tenant members`)
- Aceitar JPG, PNG, WEBP, máximo 5MB

### `src/components/members/MemberTable.tsx`

- Exibir miniatura da foto (Avatar) na coluna do nome na tabela de membros

Nenhuma migração SQL necessária — o bucket e a coluna `photo_url` já existem.

