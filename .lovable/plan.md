
# Plano de Implementação White-Label Multi-Tenant

## Visão Geral da Solução

Transformar o sistema atual em uma plataforma white-label SaaS onde cada igreja (tenant) terá:
- Subdomínio único (ex: `igreja-paz.gestor.app`)
- Personalização visual completa (cores, logo, nome, fontes)
- Área pública independente (Home com widgets configuráveis)
- Dados isolados no mesmo banco via `tenant_id`
- Cadastro híbrido (self-service + aprovação super admin)

---

## Fase 1: Infraestrutura de Tenants

### 1.1 Criar Tabela `tenants`

Nova tabela central para gerenciar todos os clientes:

```text
tenants
├── id (uuid, PK)
├── slug (text, unique) - identificador URL: "igreja-paz"
├── subdomain (text, unique) - "igreja-paz" para igreja-paz.gestor.app
├── name (text) - "Igreja Evangélica Paz"
├── is_active (boolean)
├── plan_type (enum: free, basic, pro, enterprise)
├── subscription_status (enum: trial, active, suspended, cancelled)
├── trial_ends_at (timestamp)
├── created_at, updated_at
├── created_by (uuid → auth.users)
```

### 1.2 Criar Tabela `tenant_settings`

Configurações por tenant organizadas por categoria:

```text
tenant_settings
├── id (uuid, PK)
├── tenant_id (uuid → tenants)
├── category (text) - "branding", "features", "home", "emails"
├── settings (jsonb) - configurações específicas
├── updated_at, updated_by
```

### 1.3 Criar Tabela `tenant_admins`

Gestores de cada tenant:

```text
tenant_admins
├── tenant_id (uuid → tenants)
├── user_id (uuid → auth.users)
├── role (enum: owner, admin, manager)
├── created_at, invited_by
```

### 1.4 Modificar Tabelas Existentes

Adicionar coluna `tenant_id` em TODAS as tabelas de dados:

- `profiles` (já tem `congregation_id`, adicionar `tenant_id`)
- `congregations`
- `members`
- `financial_records`
- `reconciliations`
- `church_events`
- `accounts_payable`
- `suppliers`
- `departments`
- `ministries`
- `notifications`
- `documentation_sections`
- `access_profiles`
- `user_profile_assignments`

---

## Fase 2: Sistema de Branding Dinâmico

### 2.1 Estrutura de Configurações de Branding

```json
{
  "branding": {
    "name": "Igreja Evangélica Paz",
    "tagline": "Transformando vidas pelo amor de Cristo",
    "logo_url": "https://storage.../logo.png",
    "logo_dark_url": "https://storage.../logo-dark.png",
    "favicon_url": "https://storage.../favicon.ico",
    "colors": {
      "primary": "#4F46E5",
      "primary_foreground": "#FFFFFF",
      "secondary": "#10B981",
      "secondary_foreground": "#FFFFFF",
      "accent": "#F59E0B",
      "accent_foreground": "#000000"
    },
    "fonts": {
      "heading": "Poppins",
      "body": "Inter"
    },
    "border_radius": "0.5rem"
  }
}
```

### 2.2 Criar Context de Tenant

Novo `TenantContext` que:
- Detecta tenant pelo subdomínio/URL
- Carrega configurações do banco
- Aplica CSS variables dinamicamente
- Fornece dados para todos os componentes

### 2.3 Modificar CSS Variables

O sistema já usa CSS variables (`--primary`, `--secondary`). Criar hook para aplicar cores do tenant:

```typescript
// Exemplo de aplicação dinâmica
document.documentElement.style.setProperty('--primary', tenantColors.primary);
```

---

## Fase 3: Área Pública Personalizável (Home)

### 3.1 Configurações da Home por Tenant

```json
{
  "home": {
    "hero": {
      "title": "IPTM Global",
      "subtitle": "Deus não é religião, é relacionamento.",
      "background_image": "...",
      "show_login_button": true
    },
    "widgets": {
      "pastores": { "enabled": true, "order": 1, "image_url": "..." },
      "eventos": { "enabled": true, "order": 2 },
      "calendario": { "enabled": true, "order": 3 },
      "versiculo": { "enabled": true, "order": 4 },
      "mapa": { "enabled": false },
      "instagram": { "enabled": true, "instagram_handle": "@igrejapaz" },
      "pedido_oracao": { "enabled": true },
      "conecta": { "enabled": true, "custom_name": "Conecta Igreja Paz" }
    },
    "custom_sections": [
      { "type": "video", "url": "...", "title": "..." },
      { "type": "gallery", "images": [...] }
    ]
  }
}
```

### 3.2 Componente Home Dinâmico

Modificar `Home.tsx` para:
- Buscar configurações do tenant atual
- Renderizar apenas widgets habilitados
- Usar ordem configurada
- Aplicar personalizações de cada widget

---

## Fase 4: RLS Multi-Tenant

### 4.1 Função para Obter Tenant do Usuário

```sql
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$;
```

### 4.2 Políticas RLS Atualizadas

Exemplo para `members`:

```sql
-- Antes (atual)
CREATE POLICY "view_members" ON members FOR SELECT
USING (user_has_permission('membros', 'view'));

-- Depois (multi-tenant)
CREATE POLICY "view_members" ON members FOR SELECT
USING (
  tenant_id = get_user_tenant_id() 
  AND user_has_permission('membros', 'view')
);
```

### 4.3 Política para Super Admin

```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM super_admins WHERE user_id = auth.uid()
  );
$$;

-- Permitir super admin ver todos os tenants
CREATE POLICY "super_admin_all" ON members FOR ALL
USING (is_super_admin());
```

---

## Fase 5: Sistema de Onboarding

### 5.1 Fluxo Self-Service

1. Cliente acessa `/registrar-organizacao`
2. Preenche formulário: nome, email, subdomínio desejado
3. Sistema cria tenant com `subscription_status = 'pending'`
4. Super admin recebe notificação
5. Super admin aprova → tenant fica ativo

### 5.2 Fluxo Super Admin

1. Super admin acessa `/super-admin/tenants`
2. Cria tenant manualmente
3. Convida administrador da igreja por email
4. Admin da igreja completa configurações

### 5.3 Wizard de Configuração Inicial

Após aprovação, o admin do tenant verá um wizard:
1. **Identidade Visual**: Logo, cores, nome
2. **Configurar Home**: Habilitar widgets, adicionar conteúdo
3. **Perfis de Acesso**: Criar perfis ou usar templates
4. **Convidar Equipe**: Enviar convites para primeiros usuários

---

## Fase 6: Painel Super Admin

### 6.1 Nova Tabela `super_admins`

```text
super_admins
├── id (uuid, PK)
├── user_id (uuid → auth.users, unique)
├── created_at
├── created_by
```

### 6.2 Rotas Super Admin

- `/super-admin` - Dashboard geral
- `/super-admin/tenants` - Gerenciar clientes
- `/super-admin/tenants/:id` - Detalhes do tenant
- `/super-admin/users` - Todos os usuários
- `/super-admin/analytics` - Métricas de uso
- `/super-admin/billing` - Faturamento (futuro)

### 6.3 Funcionalidades

- Listar todos os tenants com métricas
- Aprovar/suspender/cancelar tenants
- Acessar qualquer tenant (impersonar)
- Ver logs de atividade global
- Configurar planos e limites

---

## Fase 7: Configurações do Tenant (Admin da Igreja)

### 7.1 Expandir Página de Configurações

Nova estrutura em `/configuracoes`:

- **Identidade Visual**
  - Logo e favicon
  - Cores primária/secundária/accent
  - Fontes
  - Modo escuro

- **Página Inicial**
  - Configurar widgets
  - Adicionar seções personalizadas
  - Textos e imagens

- **Módulos**
  - Habilitar/desabilitar funcionalidades
  - Renomear módulos (ex: "Células" em vez de "Congregações")

- **Notificações**
  - Templates de email
  - Configurações de WhatsApp

- **Integrações**
  - Instagram
  - Google Maps
  - Outros

---

## Fase 8: Resolução de Tenant

### 8.1 Middleware de Detecção

```typescript
// Detectar tenant pelo subdomínio
const getTenantFromUrl = (hostname: string): string | null => {
  // Exemplo: igreja-paz.gestor.app → "igreja-paz"
  const subdomain = hostname.split('.')[0];
  if (subdomain === 'www' || subdomain === 'app') return null;
  return subdomain;
};
```

### 8.2 Hook `useTenant`

```typescript
const useTenant = () => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Detectar e carregar tenant
  // Retornar dados e funções de atualização
};
```

### 8.3 Provider de Tenant

Envolver toda a aplicação:

```tsx
<TenantProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</TenantProvider>
```

---

## Arquivos a Criar/Modificar

### Novos Arquivos

```text
src/
├── contexts/
│   └── TenantContext.tsx          # Context do tenant
├── hooks/
│   ├── useTenant.ts               # Hook principal
│   ├── useTenantSettings.ts       # Configurações
│   └── useTenantBranding.ts       # Cores e estilos
├── pages/
│   ├── TenantRegistration.tsx     # Self-service signup
│   ├── TenantSetupWizard.tsx      # Wizard inicial
│   └── super-admin/
│       ├── Dashboard.tsx
│       ├── TenantsList.tsx
│       ├── TenantDetails.tsx
│       └── GlobalUsers.tsx
├── components/
│   ├── tenant/
│   │   ├── BrandingEditor.tsx     # Editor de cores/logo
│   │   ├── HomeWidgetManager.tsx  # Gerenciar widgets
│   │   └── ModuleToggler.tsx      # Habilitar módulos
│   └── super-admin/
│       └── TenantCard.tsx
└── utils/
    └── tenantResolver.ts          # Resolver tenant da URL
```

### Arquivos a Modificar

```text
src/
├── App.tsx                        # Adicionar TenantProvider
├── main.tsx                       # Inicialização
├── index.css                      # CSS variables dinâmicas
├── contexts/AuthContext.tsx       # Incluir tenant_id
├── pages/Home.tsx                 # Renderização dinâmica
├── pages/Settings.tsx             # Expandir configurações
├── components/layout/Layout.tsx   # Usar branding
└── components/home/widgets/*.tsx  # Configuráveis
```

---

## Migrations SQL Necessárias

1. **001_create_tenants_table.sql** - Tabela principal de tenants
2. **002_create_tenant_settings.sql** - Configurações por tenant
3. **003_create_tenant_admins.sql** - Administradores de tenant
4. **004_create_super_admins.sql** - Super administradores
5. **005_add_tenant_id_to_tables.sql** - Adicionar coluna em todas as tabelas
6. **006_update_rls_policies.sql** - Atualizar todas as políticas RLS
7. **007_create_tenant_functions.sql** - Funções auxiliares
8. **008_migrate_existing_data.sql** - Migrar dados atuais para tenant padrão

---

## Cronograma Sugerido

| Fase | Descrição | Complexidade | Prioridade |
|------|-----------|--------------|------------|
| 1 | Infraestrutura de Tenants | Alta | Crítica |
| 2 | Sistema de Branding | Média | Alta |
| 3 | Home Personalizável | Média | Alta |
| 4 | RLS Multi-Tenant | Alta | Crítica |
| 5 | Sistema de Onboarding | Média | Alta |
| 6 | Painel Super Admin | Média | Média |
| 7 | Configurações do Tenant | Média | Alta |
| 8 | Resolução de Tenant | Baixa | Crítica |

---

## Considerações Técnicas

### Performance
- Cache de configurações do tenant em localStorage
- Invalidação via Supabase Realtime
- Lazy loading de configurações avançadas

### Segurança
- RLS obrigatório em todas as tabelas
- Verificação de tenant em toda query
- Super admin não pode editar dados, apenas visualizar/gerenciar

### Escalabilidade
- Índices em `tenant_id` em todas as tabelas
- Possibilidade futura de schemas separados
- Preparado para migração para projetos Supabase separados

### Domínios Personalizados (Futuro)
- Estrutura preparada para CNAME
- Tabela `tenant_domains` para múltiplos domínios
- Verificação de propriedade via DNS TXT

