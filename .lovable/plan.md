
# Plano: Eliminar Dados Hardcoded dos Widgets da Home

## Problema Identificado
Quando você acessa via `?tenant=mica`, os widgets da Home ainda mostram informações da IPTM:
- Instagram: `@catedraliptmoficial`
- Pastores: Foto específica da IPTM Global
- Mapa: Endereço "Rua João Vicente, 741 - Osvaldo Cruz - RJ"
- Conecta: Título "Conecta IPTM"

## Solução Proposta

Expandir a configuração de Home do tenant para incluir dados específicos de cada widget, tornando tudo personalizável.

### 1. Atualizar Estrutura de Dados (TenantContext)

Adicionar novos campos ao `TenantHomeConfig`:

```typescript
export interface TenantHomeConfig {
  widgets: { ... };
  widgetOrder: string[];
  customBanners: Array<...>;
  
  // NOVOS CAMPOS:
  instagram?: {
    handle: string;      // ex: "@igrejamica"
    url: string;         // ex: "https://instagram.com/igrejamica"
  };
  address?: {
    street: string;      // ex: "Rua Principal, 100"
    neighborhood: string; // ex: "Centro"
    city: string;        // ex: "São Paulo - SP"
    cep: string;         // ex: "01000-000"
  };
  pastoresImageUrl?: string; // URL da imagem dos pastores
}
```

### 2. Atualizar Widgets para Usar Dados do Tenant

**InstagramWidget.tsx:**
```typescript
const { homeConfig } = useTenant();
const instagramHandle = homeConfig.instagram?.handle || '@igrejamoove';
const instagramUrl = homeConfig.instagram?.url || 'https://instagram.com/igrejamoove';
```

**MapaWidget.tsx:**
```typescript
const { homeConfig } = useTenant();
const address = homeConfig.address || {
  street: 'Não configurado',
  neighborhood: '',
  city: '',
  cep: ''
};
```

**PastoresWidget.tsx:**
```typescript
const { homeConfig } = useTenant();
const pastoresImageUrl = homeConfig.pastoresImageUrl || '/placeholder.svg';
```

**ConectaWidget.tsx:**
```typescript
const { branding } = useTenant();
// Usar nome genérico "Conecta" + nome da igreja
<h3>Conecta {branding.churchName.split(' ')[0]}</h3>
// Resultado: "Conecta Mica" ou "Conecta IPTM"
```

### 3. Atualizar Dialog de Configuração da Home

Adicionar seções no `TenantHomeConfigDialog.tsx` para configurar:

- **Instagram**: Campo para handle e URL
- **Endereço**: Campos para rua, bairro, cidade, CEP
- **Imagem dos Pastores**: Upload de imagem

### 4. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/TenantContext.tsx` | Expandir interface `TenantHomeConfig` |
| `src/components/home/widgets/InstagramWidget.tsx` | Usar dados do tenant |
| `src/components/home/widgets/MapaWidget.tsx` | Usar dados do tenant |
| `src/components/home/widgets/PastoresWidget.tsx` | Usar dados do tenant |
| `src/components/home/widgets/ConectaWidget.tsx` | Usar branding.churchName |
| `src/components/tenants/TenantHomeConfigDialog.tsx` | Adicionar campos de config |

### 5. Valores Padrão (Fallback)

Para tenants que ainda não configuraram seus dados, usaremos valores genéricos neutros:
- Instagram: Ocultar widget ou mostrar "Não configurado"
- Mapa: Ocultar widget ou mostrar "Endereço não configurado"  
- Pastores: Placeholder ou ocultar widget
- Conecta: Usar "Conecta" + primeira palavra do nome da igreja

## Resultado Esperado

Ao acessar `?tenant=mica`:
- Todos os widgets mostrarão dados específicos da Mica (quando configurados)
- Nenhuma referência à IPTM aparecerá
- Admin do tenant pode personalizar cada widget no painel de gestão
