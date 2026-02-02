
# Plano: Gestão de Módulos por Tenant

## Objetivo
Implementar um sistema que permita habilitar/desabilitar módulos específicos para cada tenant (organização), permitindo variar os preços dos planos baseado nos módulos disponíveis.

---

## Arquitetura da Solução

A solução será baseada em 3 camadas:

1. **Banco de dados**: Armazenar os módulos habilitados por tenant
2. **Context/Hook**: Verificar em tempo real se um módulo está habilitado
3. **UI de Gestão**: Permitir Super Admins configurarem os módulos por tenant

---

## Implementação

### Parte 1: Estrutura de Dados

#### 1.1 Migração SQL
Adicionar uma nova categoria "modules" na tabela `tenant_settings` que já existe. A estrutura armazenará um objeto JSON com os módulos habilitados:

```text
tenant_settings (category = 'modules')
├── settings: {
│     "dashboard": true,
│     "membros": true,
│     "congregacoes": false,
│     "financeiro": true,
│     ...
│   }
```

**Alternativa considerada**: Criar uma tabela separada `tenant_modules`. Descartada porque a estrutura `tenant_settings` já existe e é flexível o suficiente.

---

### Parte 2: Lógica de Negócio

#### 2.1 Contexto de Tenant Atualizado
Modificar `TenantContext.tsx` para incluir:
- Nova interface `TenantModulesConfig` com os módulos habilitados
- Carregar módulos junto com branding e home config
- Valor padrão: todos os módulos habilitados (para não quebrar tenants existentes)

#### 2.2 Hook `useTenantModules`
Criar hook para verificar facilmente se um módulo está habilitado:
- `isModuleEnabled(moduleKey: string): boolean`
- `getEnabledModules(): string[]`
- Considera o plano do tenant para módulos obrigatórios por plano

#### 2.3 Integração com Permissões
Atualizar `usePermissions.ts` para verificar:
1. Se o módulo está habilitado para o tenant
2. Se o usuário tem permissão no perfil de acesso

Lógica: `canViewModule = tenantModuleEnabled && userHasPermission`

---

### Parte 3: Interface de Gestão

#### 3.1 Dialog de Configuração de Módulos
Criar `TenantModulesDialog.tsx` com:
- Lista de todos os módulos disponíveis (usando `MODULE_STRUCTURE`)
- Toggle para cada módulo
- Indicação visual de módulos incluídos no plano atual
- Botão salvar que atualiza `tenant_settings`

#### 3.2 Integração na Página de Tenants
Adicionar botão "Configurar Módulos" na tabela de tenants (ao lado de Branding e Home Config).

---

### Parte 4: Aplicação das Restrições

#### 4.1 Sidebar
Atualizar para ocultar módulos desabilitados para o tenant:
```
visibleItems = menuItems.filter(item => 
  isModuleEnabled(item.module) && canViewModule(item.module)
)
```

#### 4.2 Rotas Protegidas
Atualizar `ProtectedRoute.tsx` para redirecionar se módulo não está habilitado.

---

## Módulos Disponíveis (16 total)

| Módulo | Descrição |
|--------|-----------|
| dashboard | Painel principal |
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
| configuracoes | Configurações |
| conecta | Conecta IPTM (marketplace) |

---

## Sugestão de Planos (Exemplo)

| Plano | Módulos Incluídos |
|-------|-------------------|
| **Free** | dashboard, membros, eventos, documentacao |
| **Basic** | + congregacoes, ministerios, departamentos |
| **Pro** | + financeiro, conciliacoes, fornecedores, relatorios |
| **Enterprise** | + contas-pagar, notificacoes, gestao-acessos, conecta + customização |

---

## Arquivos a Criar/Modificar

### Novos arquivos:
- `src/components/tenants/TenantModulesDialog.tsx` - Dialog de configuração
- `src/hooks/useTenantModules.ts` - Hook de verificação

### Arquivos a modificar:
- `src/contexts/TenantContext.tsx` - Adicionar modules config
- `src/hooks/useTenantAdmin.ts` - Adicionar função de update modules
- `src/hooks/usePermissions.ts` - Integrar verificação de módulo habilitado
- `src/components/layout/Sidebar.tsx` - Filtrar por módulos habilitados
- `src/pages/TenantManagement.tsx` - Adicionar botão de configurar módulos
- `src/components/tenants/TenantTable.tsx` - Adicionar coluna/ação de módulos

---

## Detalhes Técnicos

### Estrutura do JSON de Módulos
```json
{
  "dashboard": true,
  "membros": true,
  "congregacoes": true,
  "departamentos": true,
  "ministerios": true,
  "eventos": true,
  "financeiro": false,
  "conciliacoes": false,
  "fornecedores": false,
  "contas-pagar": false,
  "relatorios": false,
  "notificacoes": false,
  "gestao-acessos": false,
  "documentacao": true,
  "configuracoes": true,
  "conecta": false
}
```

### Defaults por Plano
Para facilitar a configuração, ao criar um tenant ou mudar de plano, os módulos serão pré-configurados de acordo com o plano:

```typescript
const PLAN_DEFAULT_MODULES = {
  free: ['dashboard', 'membros', 'eventos', 'documentacao', 'configuracoes'],
  basic: [...free, 'congregacoes', 'ministerios', 'departamentos'],
  pro: [...basic, 'financeiro', 'conciliacoes', 'fornecedores', 'relatorios'],
  enterprise: [...allModules] // todos habilitados
};
```

---

## Benefícios

1. **Flexibilidade de preços**: Cobrar mais por módulos avançados
2. **Simplicidade para clientes**: Não poluir interface com funcionalidades não contratadas
3. **Upsell natural**: Cliente vê que existem mais funcionalidades ao fazer upgrade
4. **Segurança**: Módulos desabilitados não são acessíveis mesmo via URL direta
