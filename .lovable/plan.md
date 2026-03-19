
# Plano: White-Label com Subdomínio - Abordagem Híbrida

## ✅ IMPLEMENTADO

### Etapa 1 — Detecção de Subdomínio ✅
- `getTenantIdentifier` atualizado para detectar subdomínios em `igrejamoove.com.br` e `igrejamoove.app`
- `mica.igrejamoove.com.br` → slug "mica"
- Domínio raiz sem subdomínio → plataforma admin (retorna null)

### Etapa 2 — Redirecionar Raiz para /auth ✅
- Rota `/` agora redireciona para `/auth`
- Imports de Home e Index removidos do App.tsx
- Arquivos Home/widgets mantidos no repositório para uso futuro

### Etapa 3 — Renomear Interface: Tenants → Organizações ✅
- SuperAdminSidebar: "Tenants" → "Organizações"
- AdminTenants: "Gestão de Tenants" → "Gestão de Organizações"
- TenantTable: labels atualizados
- TenantFormDialog: "Novo Tenant" → "Nova Organização"
- TenantUsersDialog: labels atualizados
- TenantModulesDialog: labels atualizados
- AdminSettings: "Auto-aprovação de Tenants" → "Auto-aprovação de Organizações"
- Rota `/admin/tenants` → `/admin/organizacoes` (com redirect de compatibilidade)

### Etapa 4 — Renomear IPTM → Igreja Moove ✅
- ConectaIPTM: "Conecta IPTM" → "Conecta Moove"
- ConectaManagement: "Gestão Conecta IPTM" → "Gestão Conecta Moove"
- ConectaProviderProfile: mensagem WhatsApp atualizada
- AdminSettings: placeholder "Sistema IPTM" → "Igreja Moove"
- PastoresWidget: alt text atualizado
- moduleStructure.ts: label "Conecta IPTM" → "Conecta Moove"
- TenantContext: comentários atualizados
- useTenantModules: comentários atualizados

### Etapa 5 — Remover Rota /tenants Duplicada ✅
- Rota `/tenants` removida e redirecionada para `/admin/organizacoes`
- Import de TenantManagement removido

### Etapa 6 — Provisioning Automático de Organização ✅
- Wizard de criação com 2 etapas (dados + admin)
- Criação automática de perfis de acesso padrão (Admin, Pastor, Gerente Financeiro, Membro)
- Criação automática de config de módulos padrão (todos habilitados)
- Criação automática de settings de branding e home
- Primeiro admin criado via Edge Function com perfil Admin atribuído
- Validação de unicidade de slug/subdomínio
- Toasts corrigidos: "Tenant" → "Organização"

### Etapa 7 — DNS e Visualização ✅
- Dialog de instruções DNS com registros CNAME e A copiáveis
- Informações sobre propagação e SSL
- URLs de acesso (produção e teste/preview)
- "Ver como Organização" — navega para /dashboard?tenant=slug
- Link externo na tabela atualizado para igrejamoove.com.br

### Etapa 8 — Wizard de Onboarding Self-Service ✅
- Edge Function pública `onboard-tenant` (verify_jwt=false)
  - Cria tenant, tenant_settings (branding/home/modules), access_profiles, auth user, profile, tenant_admins
  - Rollback automático em caso de falha
  - Validação de slug e email únicos
  - Branding padrão com paleta azul+âmbar (217 91% 45% / 35 92% 50%)
- Página `/onboarding` com wizard de 4 etapas:
  - Step 1: Dados da Igreja (nome, cidade, estado, slug auto-gerado)
  - Step 2: Conta do Administrador (nome, email, senha)
  - Step 3: Escolha do Plano (Free/Basic/Pro com trial 14 dias)
  - Step 4: Resumo e confirmação
- Rota pública `/onboarding` no App.tsx
- CTA "Cadastre-se agora" na tela de login (AuthPage)
- Cores padrão corrigidas no useTenantAdmin.ts

## O que NÃO mudou (por design)
- Tabelas do banco (tenants, tenant_id, tenant_settings)
- RLS policies
- Funções SQL (get_user_tenant_id, etc.)
- Hooks internos (useTenantAdmin, TenantContext)
- Nomes de arquivos de componentes (TenantTable.tsx, etc.)
