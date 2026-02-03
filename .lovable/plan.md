
# Plano: Correção da Arquitetura Multi-Tenant

## Problemas Identificados

### 1. Configurações de Personalização no Lugar Errado
A página de personalização (branding, home, módulos) está em `/tenants` que só Super Admins veem. Admins dos tenants não conseguem personalizar sua própria igreja.

### 2. Dados Compartilhados Entre Tenants
As tabelas principais não possuem `tenant_id`:
- `members` - Sem tenant_id
- `church_events` - Sem tenant_id  
- `financial_records` - Sem tenant_id
- `congregations` - Sem tenant_id
- `ministries` - Sem tenant_id
- `departments` - Sem tenant_id
- `suppliers` - Sem tenant_id
- E outras tabelas de dados...

Isso faz com que todos os tenants vejam os mesmos dados (como mostra a screenshot - Mica vendo eventos e membros da IPTM).

---

## Solução em Duas Partes

### Parte 1: Página de Configurações do Tenant

Adicionar na página `/configuracoes` abas para que o Admin do tenant possa personalizar:

```text
┌─────────────────────────────────────────────────────────┐
│ Configurações                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Geral]  [Branding]  [Home]  [Módulos]  [Segurança]   │
│                                                         │
│  ┌─ ABA BRANDING ────────────────────────────────────┐ │
│  │                                                    │ │
│  │  Logo da Igreja         [Upload]                  │ │
│  │  Favicon                [Upload]                  │ │
│  │  Nome da Igreja         [______________]          │ │
│  │  Tagline                [______________]          │ │
│  │                                                    │ │
│  │  Cor Primária           [Picker] #2652e9          │ │
│  │  Cor Secundária         [Picker]                  │ │
│  │  Cor de Destaque        [Picker]                  │ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Arquivos a modificar/criar:**
- `src/pages/Settings.tsx` - Adicionar tabs com configurações do tenant
- Reutilizar componentes de `TenantBrandingDialog`, `TenantHomeConfigDialog`, `TenantModulesDialog`
- Criar hook `useCurrentTenantSettings.ts` para carregar/salvar configurações do tenant atual

### Parte 2: Isolamento de Dados por Tenant (Migração de Banco)

Adicionar coluna `tenant_id` a TODAS as tabelas de dados:

```sql
-- Tabelas que precisam de tenant_id
ALTER TABLE members ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE church_events ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE financial_records ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE congregations ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE ministries ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE departments ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE suppliers ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE reconciliations ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE accounts_payable ADD COLUMN tenant_id UUID REFERENCES tenants(id);
-- E outras tabelas relacionadas...

-- Criar índices para performance
CREATE INDEX idx_members_tenant ON members(tenant_id);
CREATE INDEX idx_events_tenant ON church_events(tenant_id);
-- etc...

-- Atualizar RLS policies para filtrar por tenant
CREATE POLICY "Users can only see their tenant data" ON members
  FOR ALL USING (
    tenant_id = get_user_tenant_id(auth.uid())
  );
```

**Atualizar hooks de dados para filtrar por tenant:**
- `useMemberData.ts`
- `useEventData.ts`
- `useFinancialData.ts`
- `useCongregationData.ts`
- `useMinistryData.ts`
- `useDepartmentData.ts`
- `useSupplierData.ts`
- E outros hooks de dados...

---

## Sequência de Implementação

### Fase 1: Configurações do Tenant (Rápido)
1. Modificar `Settings.tsx` para adicionar tabs de personalização
2. Permitir que Admins do tenant editem branding/home/módulos
3. Usar o `tenant_id` do profile do usuário logado

### Fase 2: Isolamento de Dados (Mais Complexo)
1. Migração SQL para adicionar `tenant_id` em todas as tabelas
2. Definir tenant padrão (IPTM Global) para dados existentes
3. Atualizar RLS policies
4. Atualizar todos os hooks de dados para filtrar por tenant
5. Atualizar mutations para incluir tenant_id nos inserts

---

## Decisão Necessária

O Problema 2 (isolamento de dados) é uma mudança **estrutural grande** que afeta:
- 15+ tabelas no banco de dados
- 10+ hooks de dados
- Todas as operações de CRUD
- Políticas RLS

**Você quer que eu implemente:**

**A) Apenas Parte 1** - Configurações do Tenant na página Settings (rápido)

**B) Parte 1 + Parte 2** - Configurações + Isolamento completo de dados (mais complexo, mas resolve o problema raiz)

---

## Resumo Técnico

| Item | Situação Atual | Solução |
|------|---------------|---------|
| Personalização | Só Super Admin em /tenants | Admin pode editar em /configuracoes |
| Dados de Membros | Compartilhados | Filtrar por tenant_id |
| Dados de Eventos | Compartilhados | Filtrar por tenant_id |
| Dados Financeiros | Compartilhados | Filtrar por tenant_id |
| RLS Policies | Sem tenant | Adicionar filtro tenant_id |
