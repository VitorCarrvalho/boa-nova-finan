# Plano: Gestão de Módulos por Tenant

## Status: ✅ IMPLEMENTADO

## Objetivo
Implementar um sistema que permita habilitar/desabilitar módulos específicos para cada tenant (organização), permitindo variar os preços dos planos baseado nos módulos disponíveis.

---

## Arquivos Criados

- ✅ `src/hooks/useTenantModules.ts` - Hook para verificar se módulos estão habilitados
- ✅ `src/components/tenants/TenantModulesDialog.tsx` - UI para configurar módulos por tenant

## Arquivos Modificados

- ✅ `src/contexts/TenantContext.tsx` - Adicionado `TenantModulesConfig` e carregamento de módulos
- ✅ `src/hooks/useTenantAdmin.ts` - Adicionado `updateTenantModules` function
- ✅ `src/hooks/usePermissions.ts` - Integrado verificação de módulo habilitado com permissões
- ✅ `src/components/tenants/TenantTable.tsx` - Adicionado ação "Módulos" no menu
- ✅ `src/pages/TenantManagement.tsx` - Integrado TenantModulesDialog
- ✅ `src/utils/moduleStructure.ts` - Adicionado módulo "conecta"

---

## Como Funciona

### 1. Armazenamento
Os módulos são armazenados em `tenant_settings` com `category = 'modules'`:
```json
{
  "dashboard": true,
  "membros": true,
  "financeiro": false,
  ...
}
```

### 2. Verificação de Acesso
A lógica de verificação é dupla:
1. **Módulo habilitado para o tenant** - via `useTenantModules.isModuleEnabled()`
2. **Usuário tem permissão** - via `usePermissions.hasPermission()`

Resultado: `canViewModule = tenantModuleEnabled && userHasPermission`

### 3. Módulos Core
Os seguintes módulos não podem ser desabilitados:
- `dashboard`
- `configuracoes`

### 4. Defaults por Plano
```typescript
const PLAN_DEFAULT_MODULES = {
  free: ['dashboard', 'membros', 'eventos', 'documentacao', 'configuracoes'],
  basic: [...free, 'congregacoes', 'ministerios', 'departamentos'],
  pro: [...basic, 'financeiro', 'conciliacoes', 'fornecedores', 'relatorios'],
  enterprise: [...allModules]
};
```

---

## Como Usar

### Super Admin configura módulos:
1. Acessar `/tenants`
2. Clicar no menu de ações do tenant
3. Selecionar "Módulos"
4. Habilitar/desabilitar módulos
5. Salvar

### Para verificar em código:
```typescript
import { useTenantModules } from '@/hooks/useTenantModules';

const { isModuleEnabled } = useTenantModules();

if (isModuleEnabled('financeiro')) {
  // Mostrar funcionalidade
}
```

### Permissões combinadas:
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { canViewModule } = usePermissions();

// Automaticamente verifica:
// 1. Se módulo está habilitado para o tenant
// 2. Se usuário tem permissão no perfil
if (canViewModule('financeiro')) {
  // Mostrar módulo
}
```

---

## Módulos Disponíveis (17 total)

| Módulo | Descrição |
|--------|-----------|
| dashboard | Painel principal (Core) |
| membros | Gestão de membros |
| congregacoes | Gestão de congregações |
| departamentos | Gestão de departamentos |
| ministerios | Gestão de ministérios |
| eventos | Gestão de eventos |
| financeiro | Receitas e despesas |
| conciliacoes | Conciliações financeiras |
| fornecedores | Gestão de fornecedores |
| contas-pagar | Contas a pagar |
| relatorios | Relatórios |
| notificacoes | Sistema de notificações |
| gestao-acessos | Gestão de acessos |
| documentacao | Documentação |
| configuracoes | Configurações (Core) |
| conecta | Conecta IPTM (marketplace) |
