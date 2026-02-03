

# Plano: Atualizar Sufixo do Subdomínio

## Problema Identificado
No formulário de criação/edição de Tenant (`TenantFormDialog.tsx`), o sufixo do subdomínio está definido como `.iptm` mas deve ser atualizado para `.igrejamoove`.

## Alteração Necessária

### Arquivo: `src/components/tenants/TenantFormDialog.tsx`

**Linha 165-167 (atual):**
```tsx
<span className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground">
  .iptm
</span>
```

**Alteração:**
```tsx
<span className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground">
  .igrejamoove
</span>
```

## Resultado
O formulário de novo tenant mostrará o sufixo correto `.igrejamoove` ao lado do campo de subdomínio, indicando que o endereço final será algo como `mica.igrejamoove.app`.

