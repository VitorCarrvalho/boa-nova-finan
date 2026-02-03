
# Plano: Correção da Detecção de Tenant pelo Profile do Usuário

## Problema Identificado

O sistema não está detectando automaticamente o tenant do usuário logado. Atualmente:
- TenantContext só reconhece tenant via URL (`?tenant=slug` ou subdomínio)
- Usuários como `admin@mica.com` que têm `tenant_id` no profile não são reconhecidos
- Resultado: abas de Branding/Home/Módulos não aparecem em `/configuracoes`

## Solução Proposta

Modificar o `TenantContext.tsx` para detectar o tenant em 3 níveis:

```text
Prioridade de Detecção:
1. Query parameter (?tenant=slug) → Para testes
2. Subdomínio (mica.example.com) → Produção
3. tenant_id do profile do usuário → Fallback automático
```

## Arquivos a Modificar

### 1. `src/contexts/TenantContext.tsx`

Adicionar lógica para buscar o tenant_id do profile do usuário autenticado:

```typescript
// Adicionar dependência do AuthContext
import { useAuth } from '@/contexts/AuthContext';

// Dentro do TenantProvider:
const { user } = useAuth();

// Nova função para buscar tenant do profile
const fetchTenantFromProfile = async () => {
  if (!user?.id) return null;
  
  const { data } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();
    
  return data?.tenant_id || null;
};

// Modificar fetchTenantData para usar essa info
const fetchTenantData = async () => {
  // 1. Tentar identificador da URL
  let effectiveTenantId = tenantIdentifier;
  
  // 2. Se não encontrou na URL, buscar do profile
  if (!effectiveTenantId && user?.id) {
    const profileTenantId = await fetchTenantFromProfile();
    if (profileTenantId) {
      // Buscar tenant pelo ID
      const { data } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profileTenantId)
        .single();
      
      if (data) {
        setTenant({ /* ... dados do tenant */ });
        // Carregar branding, home, modules...
        return;
      }
    }
  }
  
  // Resto da lógica atual...
};
```

### 2. Dependência Circular

Problema: `TenantContext` precisa de `AuthContext`, mas pode haver dependência circular.

Solução: Usar `supabase.auth.getUser()` direto ao invés de `useAuth()`:

```typescript
// Em vez de useAuth (que pode causar dependência circular)
const [currentUserId, setCurrentUserId] = useState<string | null>(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setCurrentUserId(data.session?.user?.id || null);
  });
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

## Fluxo Corrigido

```text
Usuário admin@mica.com faz login
           ↓
TenantContext verifica URL
           ↓
Não encontra ?tenant ou subdomínio
           ↓
Busca tenant_id do profile (bf9bb59f-...)
           ↓
Carrega dados do tenant Mica
           ↓
tenant !== null
           ↓
Abas Branding/Home/Módulos aparecem em /configuracoes
```

## Resultado Esperado

Após a correção:

1. Usuário `admin@mica.com` faz login
2. Sistema detecta automaticamente que ele pertence à Mica
3. Ao acessar `/configuracoes`, as abas aparecem:
   - ✅ Branding (cores, logo, nome da igreja)
   - ✅ Home (widgets, Instagram, endereço)
   - ✅ Módulos (habilitar/desabilitar funcionalidades)
   - ✅ Geral
   - ✅ Segurança

4. Dados salvos vão para `tenant_settings` com `tenant_id` da Mica
5. Não precisa mais usar `?tenant=mica` na URL

## Considerações de Segurança

- O tenant é determinado pelo `tenant_id` armazenado no banco (não manipulável pelo cliente)
- RLS policies garantem que usuários só podem modificar settings do próprio tenant
- Super Admins mantêm acesso ao painel `/admin` para gerenciar todos os tenants
