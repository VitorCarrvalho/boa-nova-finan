

## Plano de Correção: Módulos não aparecem para usuários admin de organizações

### Diagnóstico (Causa Raiz)

Investiguei o banco de dados e encontrei o problema concreto:

- Os dois usuários da organização Mica (`admin.mica@mica.com.br` e `admin@mica.com`) estão atribuídos ao perfil **"Membro"** global (`profile_id = ef578f88-...`), que tem a maioria dos módulos com `view: false`.
- **Não existem access_profiles criados para o tenant Mica** (0 registros). A Edge Function `create-tenant-user` deveria ter criado os 4 perfis padrão (Admin, Pastor, Gerente Financeiro, Membro) mas falhou silenciosamente.
- O trigger `handle_new_user` roda primeiro e atribui o perfil global "Membro". A Edge Function depois tenta atualizar para o Admin do tenant, mas como a criação dos perfis falhou, o `adminProfileId` ficou `null` e o `profile_id` nunca foi atualizado.

### Módulos afetados

O perfil "Membro" global só libera: Dashboard, Membros (view), Congregações (view), Departamentos (view), Ministérios (view), Eventos (view), Notificações (view). Todos os demais (Financeiro, Conciliações, Fornecedores, Contas a Pagar, Relatórios, Gestão de Acessos, Documentação, Configurações) estão com `view: false`.

### Plano de Correção

**Etapa 1 — Corrigir Edge Function `create-tenant-user`**

Problema: A criação de perfis falha silenciosamente. Se falhar, o usuário fica com o perfil "Membro" global.

Correções:
- Tornar a criação de perfis **obrigatória** (não silenciar erros). Se falhar, retornar erro ao invés de continuar.
- Após criar o perfil Admin, garantir que o `profile_id` é atualizado no `profiles` com o ID correto do perfil do tenant.
- Adicionar validação: se `adminProfileId` continuar `null` após tentativa de criação, lançar erro explícito.

**Etapa 2 — Corrigir dados existentes via migração SQL**

Para tenants que já foram criados sem perfis (como Mica), criar uma migração que:
1. Identifica tenants sem access_profiles.
2. Cria os 4 perfis padrão para esses tenants.
3. Atualiza os usuários desses tenants que têm `role = 'admin'` para apontar para o perfil Admin correto do seu tenant.

**Etapa 3 — Criar configuração de módulos para tenants existentes**

Verificar se existe `tenant_settings` com `category = 'modules'` para os tenants afetados. Se não, criar com todos os módulos habilitados.

### Detalhes técnicos

```text
Fluxo atual (com bug):
  1. Edge Function chama auth.admin.createUser()
  2. Trigger handle_new_user → atribui Membro global
  3. Edge Function tenta criar access_profiles do tenant → falha silenciosa
  4. adminProfileId = null → profile_id NÃO é atualizado
  5. Usuário fica com perfil "Membro" global → poucos módulos

Fluxo corrigido:
  1. Edge Function chama auth.admin.createUser()
  2. Trigger handle_new_user → atribui Membro global  
  3. Edge Function cria access_profiles do tenant → ERRO FATAL se falhar
  4. adminProfileId = UUID válido
  5. Edge Function atualiza profile_id → Admin do tenant
  6. Usuário tem todos os módulos liberados
```

**Arquivos a modificar:**
- `supabase/functions/create-tenant-user/index.ts` — tornar criação de perfis robusta com tratamento de erro fatal
- Nova migração SQL — corrigir dados dos tenants existentes (criar perfis + atualizar usuários + criar módulos config)

