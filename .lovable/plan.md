

# Plano: White-Label com Subdominio - Abordagem Hibrida

Manter `tenant_id` no banco e codigo. Renomear apenas na interface para "Organizacao". Configurar deteccao de subdominio para `igrejamoove.com.br`.

---

## Etapa 1 — Deteccao de Subdominio

**Arquivo:** `src/contexts/TenantContext.tsx`

Atualizar `getTenantIdentifier` para detectar subdominios em `igrejamoove.com.br`:

```text
mica.igrejamoove.com.br → slug = "mica"
lagoinha.igrejamoove.com.br → slug = "lagoinha"
igrejamoove.com.br (sem sub) → plataforma admin
```

Adicionar `igrejamoove.com.br` na lista de dominios reconhecidos.

---

## Etapa 2 — Redirecionar Raiz para /auth

**Arquivos:** `src/App.tsx`, remover `src/pages/Home.tsx` e `src/pages/Index.tsx` das rotas

- Rota `/` passa a ser `<Navigate to="/auth" replace />`
- Manter arquivos Home/widgets no repositorio (uso futuro PWA) mas desconectar das rotas

---

## Etapa 3 — Renomear Interface: Tenants → Organizacoes

**Arquivos afetados (~8):**

- `src/components/layout/SuperAdminSidebar.tsx` — menu "Tenants" → "Organizacoes"
- `src/pages/admin/AdminTenants.tsx` — titulo "Gestao de Tenants" → "Gestao de Organizacoes"
- `src/components/tenants/TenantTable.tsx` — labels da tabela
- `src/components/tenants/TenantFormDialog.tsx` — labels do formulario
- `src/components/tenants/TenantUsersDialog.tsx` — labels
- `src/components/tenants/TenantBrandingDialog.tsx` — labels
- `src/components/tenants/TenantHomeConfigDialog.tsx` — labels
- `src/components/tenants/TenantModulesDialog.tsx` — labels

Rota `/admin/tenants` → `/admin/organizacoes` (manter redirect de compatibilidade)

---

## Etapa 4 — Renomear IPTM → Igreja Moove

**Arquivos afetados (~10):**

- `src/pages/ConectaIPTM.tsx` — "Conecta IPTM" → "Conecta Moove"
- `src/pages/ConectaManagement.tsx` — "Gestao Conecta IPTM" → "Gestao Conecta Moove"
- `src/pages/ConectaProviderProfile.tsx` — mensagem WhatsApp
- `src/pages/admin/AdminSettings.tsx` — placeholder "IPTM" → "Igreja Moove"
- `src/components/home/widgets/PastoresWidget.tsx` — alt text
- `src/utils/moduleStructure.ts` — label "Conecta IPTM" → "Conecta Moove"
- `src/contexts/TenantContext.tsx` — comentarios e nomes default
- `src/hooks/useTenantModules.ts` — comentarios
- `src/components/layout/SuperAdminSidebar.tsx` — qualquer referencia IPTM

---

## Etapa 5 — Remover Rota /tenants Duplicada

**Arquivo:** `src/App.tsx`

- Remover rota `/tenants` (pagina `TenantManagement.tsx`)
- Manter apenas `/admin/organizacoes` como ponto unico de gestao

---

## Etapa 6 — Remover Rota /tenants da Pagina de Gestao Legada

Arquivo `src/pages/TenantManagement.tsx` pode ser mantido mas desconectado das rotas.

---

## Resumo

| O que muda | Onde |
|---|---|
| Deteccao subdominio igrejamoove.com.br | TenantContext |
| `/` → `/auth` | App.tsx |
| Labels "Tenant" → "Organizacao" | ~8 componentes UI |
| "IPTM" → "Igreja Moove" / "Conecta Moove" | ~10 arquivos |
| Remover rota `/tenants` duplicada | App.tsx |

| O que NAO muda |
|---|
| Tabelas do banco (tenants, tenant_id, tenant_settings) |
| RLS policies |
| Funcoes SQL (get_user_tenant_id, etc) |
| Hooks internos (useTenantAdmin, TenantContext) |
| Edge Functions |

**Estimativa:** ~20 arquivos modificados, zero migracao SQL.

