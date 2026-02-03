
# Plano: Adicionar Query Parameter para Teste de Tenant

## Objetivo
Permitir que Super Admins testem a visualização de qualquer tenant usando `?tenant=slug` na URL, sem precisar configurar DNS ou publicar.

## Exemplo de Uso
```
https://id-preview--41e4016e-aff1-4b61-8f27-09c2db2825c6.lovable.app/?tenant=mica
https://id-preview--41e4016e-aff1-4b61-8f27-09c2db2825c6.lovable.app/auth?tenant=mica
```

## Alteração Necessária

### Arquivo: `src/contexts/TenantContext.tsx`

Modificar a função `getTenantIdentifier()` para verificar também query parameters:

**Código atual (linhas 89-104):**
```typescript
function getTenantIdentifier(): string | null {
  const hostname = window.location.hostname;
  
  // Check for localhost or preview URLs (default tenant)
  if (hostname === 'localhost' || hostname.includes('lovable.app') || hostname.includes('127.0.0.1')) {
    return null; // Use default/main tenant
  }
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}
```

**Código novo:**
```typescript
function getTenantIdentifier(): string | null {
  // 1. Verificar query parameter primeiro (para testes/preview)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }

  const hostname = window.location.hostname;
  
  // 2. Check for localhost or preview URLs (default tenant)
  if (hostname === 'localhost' || hostname.includes('lovable.app') || hostname.includes('127.0.0.1')) {
    return null;
  }
  
  // 3. Extract subdomain from hostname
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return null;
}
```

## Como Funciona

1. **Prioridade 1**: Query param `?tenant=mica`
2. **Prioridade 2**: Subdomínio real (ex: `mica.igrejamoove.app`)
3. **Fallback**: Tenant padrão (Igreja Moove)

## Benefícios

- Testar branding de qualquer tenant sem configurar DNS
- Super Admin pode visualizar exatamente como o cliente vê
- Funciona em localhost e preview do Lovable
- Não afeta ambientes de produção (query param tem prioridade apenas se presente)

## Melhoria Adicional (Opcional)

Adicionar um banner discreto no topo quando estiver em "modo preview de tenant":

```tsx
{tenantParam && (
  <div className="bg-yellow-100 text-yellow-800 text-xs py-1 px-4 text-center">
    👁️ Visualizando como: {tenant?.name || tenantParam}
  </div>
)}
```

## Resultado

Após a implementação, você poderá acessar:
- `https://[preview-url]/?tenant=mica` para ver o tenant Mica
- O sistema carregará o branding configurado (logo, cores, nome)
- A tela de login e todo o painel usarão a identidade visual do tenant Mica
