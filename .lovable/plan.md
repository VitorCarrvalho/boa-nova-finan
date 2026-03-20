

# Correção: Dados da Config Home não refletem na Home pública

## Causa raiz

Três problemas identificados:

### Bug 1 — TenantContext ignora campos extras do home config
Em `loadTenantSettings` (TenantContext.tsx, linhas 212-219), ao processar a categoria `home`, apenas `widgets`, `widgetOrder` e `customBanners` são extraídos. Os campos `instagram`, `address` e `pastoresImageUrl` — que existem no banco — são descartados e nunca chegam ao estado do contexto.

**Dados no banco (confirmados):**
- `address`: `{street: "Rua da Lagoa, 17", neighborhood: "Vila Lourdes", city: "Carapicuíba", cep: "06397280"}`
- `pastoresImageUrl`: URL válida do storage
- `instagram`: `null` (não foi salvo — ver Bug 3)

### Bug 2 — MapaWidget com endereço hardcoded
O componente `MapaWidget.tsx` calcula a variável `address` corretamente do config, mas nas linhas 56-57 exibe texto hardcoded ("Rua João Vicente, 741", "Osvaldo Cruz - Rio de Janeiro") em vez de usar a variável.

### Bug 3 — Instagram não salvo no banco
O campo `instagram` está `null` no banco. Provavelmente o formulário de config home da organização (TenantHomeConfigDialog) não está salvando este campo no merge de settings.

## Correções

### 1. `src/contexts/TenantContext.tsx`
No `loadTenantSettings`, ao processar `home`, incluir os campos faltantes:
```ts
setHomeConfig({
  ...defaultHomeConfig,
  widgets: ...,
  widgetOrder: ...,
  customBanners: ...,
  instagram: homeSettings.instagram,    // NOVO
  address: homeSettings.address,        // NOVO
  pastoresImageUrl: homeSettings.pastoresImageUrl, // NOVO
});
```

### 2. `src/components/home/widgets/MapaWidget.tsx`
Substituir as linhas hardcoded (56-57) pelo uso das variáveis `endereco` e `address`:
```tsx
<p className="text-slate-800 font-medium">{address.street}</p>
<p className="text-slate-600 text-sm">
  {address.neighborhood}{address.city ? ` - ${address.city}` : ''}
</p>
```

### 3. `src/components/tenants/TenantHomeConfigDialog.tsx`
Verificar que o `onSubmit` envia `instagram`, `address` e `pastoresImageUrl` no payload (e que o hook `updateTenantHomeConfig` faz merge correto preservando esses campos). O TenantHomeConfigDialog pode estar omitindo esses campos no objeto enviado.

### 4. `src/hooks/useTenantAdmin.ts` — Verificar merge de settings
Garantir que `updateTenantHomeConfig` faz spread/merge do objeto existente com os novos dados, sem apagar campos extras.

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/contexts/TenantContext.tsx` | Incluir `instagram`, `address`, `pastoresImageUrl` no `setHomeConfig` |
| `src/components/home/widgets/MapaWidget.tsx` | Usar variáveis dinâmicas em vez de texto hardcoded |
| `src/components/tenants/TenantHomeConfigDialog.tsx` | Garantir que instagram/address são incluídos no payload |
| `src/hooks/useTenantAdmin.ts` | Verificar merge correto dos settings |

