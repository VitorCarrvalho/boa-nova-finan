

# Correção: Hyperlink do subdomínio

## Problema

O texto do subdomínio está dividido em dois `<span>` separados (`mica` + `.igrejamoove.com.br`), e o link `<a>` é apenas o ícone de seta. O redirecionamento para `igrejamoove.com.br` ao acessar `mica.igrejamoove.com.br` é um comportamento de DNS/servidor (o domínio provavelmente não está configurado), mas podemos melhorar a UX transformando todo o texto em um único hyperlink clicável.

## Alteração

**Arquivo:** `src/components/tenants/TenantTable.tsx` (linhas 193-205)

Substituir os dois `<span>` separados + ícone por um único `<a>` que engloba todo o texto:

```tsx
<TableCell>
  <a
    href={`https://${tenant.subdomain}.igrejamoove.com.br`}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 text-sm text-primary hover:underline"
  >
    {tenant.subdomain}.igrejamoove.com.br
    <ExternalLink className="h-3 w-3" />
  </a>
</TableCell>
```

Isso garante que o link completo seja clicável e visualmente claro como hyperlink.

> **Nota:** Se ao clicar o browser redireciona para `igrejamoove.com.br`, isso indica que o DNS do subdomínio `mica.igrejamoove.com.br` não está configurado corretamente no servidor/registrador de domínio. O código estará enviando a URL correta.

