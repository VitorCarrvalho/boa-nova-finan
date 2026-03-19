

# Plano: Nova Paleta de Cores — Azul + Ambar

Substituir completamente o esquema de cores atual (baseado em vermelho/cinza) pela nova identidade azul profundo + ambar/laranja, com glassmorphism e sombras customizadas.

---

## Etapa 1 — CSS Variables (src/index.css)

Atualizar `:root` com a nova paleta:

```text
--primary:            217 91% 45%       (azul profundo)
--primary-foreground: 0 0% 100%         (branco)
--secondary:          35 92% 50%        (ambar)
--secondary-foreground: 0 0% 100%
--accent:             35 92% 50%        (ambar = accent)
--accent-foreground:  0 0% 100%
--background:         210 20% 98%       (branco frio)
--foreground:         222 47% 11%       (texto escuro)
--muted:              210 20% 96%
--muted-foreground:   215 16% 47%
--border:             214 32% 91%
--input:              214 32% 91%
--card:               0 0% 100%
--destructive:        0 84% 60%
--ring:               217 91% 45%       (azul = ring)
```

Atualizar sidebar variables para consistencia com azul. Atualizar modo `.dark` com equivalentes escuros da paleta azul/ambar.

Adicionar classes utilitarias CSS para gradientes e sombras:

```css
.gradient-primary   { background: linear-gradient(135deg, hsl(217,91%,45%), hsl(230,80%,55%)); }
.gradient-secondary { background: linear-gradient(135deg, hsl(35,92%,50%), hsl(25,95%,55%)); }
.gradient-hero      { background: linear-gradient(180deg, hsl(217,91%,97%), hsl(210,20%,98%)); }
.shadow-soft        { box-shadow: 0 4px 20px -2px rgba(26,107,196,0.08); }
.shadow-card        { box-shadow: 0 8px 30px -4px rgba(26,107,196,0.12); }
.shadow-elevated    { box-shadow: 0 20px 50px -10px rgba(26,107,196,0.15); }
```

---

## Etapa 2 — Tailwind Config (tailwind.config.ts)

Adicionar ao `extend`:
- Custom boxShadow: `soft`, `card`, `elevated` com valores primary-based
- Nenhuma cor hardcoded extra necessaria (usamos CSS variables)

---

## Etapa 3 — Substituir Cores Hardcoded nos Componentes (~30 arquivos)

Substituir todas as ocorrencias de `bg-red-600`, `hover:bg-red-700`, `text-red-600`, `bg-red-50`, `bg-red-100`, `border-red-` (usadas como cores de marca, NAO como erros) por classes semanticas:

| De | Para |
|---|---|
| `bg-red-600 hover:bg-red-700` (botoes primarios) | `bg-primary hover:bg-primary/90 text-primary-foreground` |
| `text-red-600` (icones de marca) | `text-primary` |
| `bg-red-100 text-red-600` (avatars) | `bg-primary/10 text-primary` |
| `bg-red-50 text-red-600` (menu ativo sutil) | `bg-primary/10 text-primary` |
| `border-red-600` (spinners) | `border-primary` |
| `bg-red-600 text-white` (sidebar ativo) | `bg-primary text-primary-foreground` |
| `text-red-600 hover:bg-red-50` (logout) | `text-destructive hover:bg-destructive/10` |

**Arquivos afetados** (todos os que usam red como cor de marca):

- `src/components/layout/Sidebar.tsx` (~20 ocorrencias)
- `src/components/layout/MobileSidebar.tsx`
- `src/components/suppliers/components/SupplierFormActions.tsx`
- `src/components/members/MemberForm.tsx`
- `src/components/events/EventTable.tsx`
- `src/components/departments/DepartmentForm.tsx`
- `src/components/congregations/CongregationForm.tsx`
- `src/components/financial/FinancialForm.tsx`
- `src/components/ministries/MinistryForm.tsx`
- `src/components/tenants/TenantUsersDialog.tsx`
- `src/pages/Departments.tsx`
- `src/pages/Congregations.tsx`
- `src/pages/Reconciliations.tsx`
- `src/pages/ResetPassword.tsx`
- `src/pages/Notifications.tsx`
- `src/pages/notifications/VideoLibrary.tsx`
- `src/pages/notifications/SentHistory.tsx`
- `src/pages/notifications/NewNotification.tsx`
- `src/pages/notifications/RecurringMessages.tsx`
- `src/pages/notifications/ScheduledMessages.tsx`
- `src/pages/ReportsMenu.tsx`
- `src/pages/ConectaProviderProfile.tsx`
- `src/components/reconciliations/*`
- `src/components/reports/financial/components/ReconciliationExportButtons.tsx`

**Preservar** `bg-red-*` / `text-red-*` quando usadas para erros/destructive (ex: validacao, alertas de erro) — essas continuam com destructive.

---

## Etapa 4 — Atualizar TenantContext Default Branding

**Arquivo:** `src/contexts/TenantContext.tsx`

Atualizar cores default do branding para a nova paleta:
- `primaryColor: '217 91% 45%'`
- `secondaryColor: '35 92% 50%'`
- `accentColor: '35 92% 50%'`

---

## Etapa 5 — Atualizar Home Background

**Arquivo:** `src/index.css`

Atualizar `.home-background` para usar tons de azul frio ao inves de cinza puro, alinhando com `gradient-hero`.

---

## Resumo

| Camada | Mudanca |
|---|---|
| CSS Variables | Nova paleta azul+ambar em :root e .dark |
| Tailwind | Sombras customizadas |
| ~30 componentes | `red-*` → `primary`/semantico |
| TenantContext | Default branding atualizado |
| Glassmorphism | Sombras atualizadas com tom azul |

Nenhuma mudanca em banco de dados ou edge functions.

