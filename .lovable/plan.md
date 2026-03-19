

# Plano: Wizard de Onboarding Self-Service

Criar um fluxo público onde igrejas podem se auto-cadastrar na plataforma, criando automaticamente a organização, o usuário administrador e todas as configurações padrão.

---

## Fluxo do Usuário

```text
/onboarding
  Step 1: Dados da Igreja (nome, cidade, estado)
  Step 2: Conta do Administrador (nome, email, senha)
  Step 3: Escolha do Plano (free/basic/pro)
  Step 4: Resumo + Confirmação
  → Redirect para /auth com toast de sucesso
```

---

## Etapa 1 — Edge Function `onboard-tenant`

**Arquivo:** `supabase/functions/onboard-tenant/index.ts`

Nova edge function pública (sem autenticação) que executa todo o provisioning:

1. Valida inputs (nome, slug, email, senha)
2. Verifica unicidade de slug/subdomain
3. Cria o tenant na tabela `tenants` (status: `trial`, ativo)
4. Cria `tenant_settings` (branding com cores padrão azul+ambar, home, modules)
5. Cria usuário no Auth via `auth.admin.createUser`
6. Atualiza `profiles` com `tenant_id`, `approval_status: 'ativo'`, `role: 'admin'`
7. Cria `tenant_admins` com role `owner`
8. Cria perfis de acesso padrão (Admin, Pastor, Gerente Financeiro, Membro) vinculados ao tenant
9. Atribui perfil Admin ao usuário criado
10. Retorna sucesso com dados do tenant

Reutiliza a lógica de `defaultProfiles` já existente em `create-tenant-user`.

**Config:** `verify_jwt = false` no `config.toml`

---

## Etapa 2 — Página `/onboarding`

**Arquivo:** `src/pages/Onboarding.tsx`

Wizard multi-step com visual alinhado à identidade azul+ambar:

- **Step 1 — Igreja:** Nome, cidade, estado (slug auto-gerado)
- **Step 2 — Administrador:** Nome completo, email, senha, confirmar senha
- **Step 3 — Plano:** Cards visuais para Free, Basic, Pro (trial de 14 dias em todos)
- **Step 4 — Resumo:** Revisão de todos os dados + botão "Criar Minha Igreja"

Componentes: progress bar, validação com zod, feedback de erro inline, loading state durante criação.

---

## Etapa 3 — Rota no App.tsx

Adicionar rota pública:
```
<Route path="/onboarding" element={<Onboarding />} />
```

---

## Etapa 4 — Link na Tela de Login

Adicionar na `AuthPage.tsx` um CTA abaixo do card de login:
```
"Sua igreja ainda não está na plataforma? Cadastre-se agora"
→ Link para /onboarding
```

---

## Etapa 5 — Branding Padrão Correto

Garantir que a edge function use as cores corretas da nova paleta ao criar `tenant_settings`:
- `primaryColor: '217 91% 45%'`
- `secondaryColor: '35 92% 50%'`
- `accentColor: '35 92% 50%'`

Também corrigir o `useTenantAdmin.ts` que ainda usa cores antigas (`222.2 47.4% 11.2%`).

---

## Resumo

| Componente | Tipo |
|---|---|
| `onboard-tenant` edge function | Backend (público) |
| `Onboarding.tsx` page | Frontend (wizard 4 steps) |
| Rota `/onboarding` | App.tsx |
| CTA na tela de login | AuthPage.tsx |
| Config.toml update | verify_jwt = false |

Nenhuma migração de banco necessária — usa tabelas existentes (`tenants`, `tenant_settings`, `profiles`, `tenant_admins`, `access_profiles`, `user_profile_assignments`).

