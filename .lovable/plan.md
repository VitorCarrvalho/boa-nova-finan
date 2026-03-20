

# Correção: Erro ao remover organização (FK constraint)

## Problema

Ao deletar uma organização, o sistema tenta deletar os `access_profiles` do tenant, mas a tabela `profiles` tem uma foreign key (`profiles_profile_id_fkey`) apontando para `access_profiles.id` com ação `NO ACTION` — ou seja, bloqueia a exclusão.

A FK `user_profile_assignments_profile_id_fkey` já está configurada como `CASCADE`, mas `profiles_profile_id_fkey` não.

## Solução

Migração SQL para alterar a FK `profiles_profile_id_fkey` de `NO ACTION` para `SET NULL`:

```sql
ALTER TABLE public.profiles 
  DROP CONSTRAINT profiles_profile_id_fkey;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_profile_id_fkey 
  FOREIGN KEY (profile_id) 
  REFERENCES public.access_profiles(id) 
  ON DELETE SET NULL;
```

Isso faz com que, ao deletar um `access_profile` (via cascade da organização), o `profile_id` dos profiles associados seja setado como `NULL` ao invés de bloquear a operação. Nenhuma alteração de código frontend é necessária.

