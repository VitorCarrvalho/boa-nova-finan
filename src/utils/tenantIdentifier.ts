export function getTenantIdentifier(): string | null {
  // 1. Verificar query parameter primeiro (para testes/preview)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  if (tenantParam) {
    return tenantParam;
  }

  const hostname = window.location.hostname;
  
  // 2. Check for localhost or preview URLs (default tenant)
  if (hostname === 'localhost' || 
      hostname.includes('lovable.app') || 
      hostname.includes('lovableproject.com') ||
      hostname.includes('127.0.0.1')) {
    return null; // Use default/main tenant
  }
  
  // 3. Detectar subdomínio em igrejamoove.com.br
  const mooveDomains = ['igrejamoove.com.br', 'igrejamoove.app'];
  for (const domain of mooveDomains) {
    if (hostname.endsWith(`.${domain}`)) {
      const subdomain = hostname.replace(`.${domain}`, '');
      if (subdomain && !subdomain.includes('.')) {
        return subdomain;
      }
    }
    // Domínio raiz sem subdomínio → plataforma admin
    if (hostname === domain || hostname === `www.${domain}`) {
      return null;
    }
  }
  
  // 4. Extract subdomain from other hostnames
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0]; // Return subdomain
  }
  
  return null;
}
