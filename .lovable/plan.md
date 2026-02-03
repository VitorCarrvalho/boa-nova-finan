
# Plano: Correção Definitiva do Multi-Tenant

## Problemas Identificados

### Problema 1: Políticas RLS Duplicadas
Existem **DUAS** políticas SELECT na tabela `members`:
- `Tenant users can view their tenant members` → filtra por tenant
- `Usuários com permissão podem ver membros` → **NÃO filtra por tenant**

Como RLS policies são **OR**, a política antiga permite ver tudo!

O mesmo problema existe em TODAS as tabelas de dados.

### Problema 2: Dados Existentes sem tenant_id
Todos os membros, eventos, etc. têm `tenant_id = NULL`. Precisam ser associados ao tenant correto (IPTM Global).

### Problema 3: TenantContext não carrega corretamente
O `fetchTenantData` pode ter race condition com `currentUserId`.

---

## Solução

### Parte 1: Migração SQL para Remover Políticas Antigas

Remover TODAS as políticas antigas que não filtram por tenant:

```sql
-- MEMBERS
DROP POLICY IF EXISTS "Usuários com permissão podem ver membros" ON members;
DROP POLICY IF EXISTS "Usuários com permissão podem criar membros" ON members;
DROP POLICY IF EXISTS "Usuários com permissão podem editar membros" ON members;
DROP POLICY IF EXISTS "Users can view members for dropdowns" ON members;

-- CHURCH_EVENTS  
DROP POLICY IF EXISTS "Usuários com permissão podem ver eventos" ON church_events;
DROP POLICY IF EXISTS "Usuários com permissão podem criar eventos" ON church_events;
DROP POLICY IF EXISTS "Usuários com permissão podem atualizar eventos" ON church_events;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar eventos" ON church_events;
DROP POLICY IF EXISTS "Public can view active events" ON church_events;

-- CONGREGATIONS
DROP POLICY IF EXISTS "Public can view basic congregation info for registration" ON congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem criar congregações" ON congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem editar congregações" ON congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar congregações" ON congregations;
DROP POLICY IF EXISTS "Usuários com permissão podem ver congregações" ON congregations;

-- ... e todas as outras tabelas
```

### Parte 2: Atualizar Dados Existentes

Associar todos os dados sem tenant_id ao IPTM Global:

```sql
-- O ID do IPTM Global é 846fa096-6e2c-4f36-bb2c-3d807c4e4939
UPDATE members SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE church_events SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE congregations SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE ministries SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE departments SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE suppliers SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE financial_records SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE reconciliations SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
UPDATE accounts_payable SET tenant_id = '846fa096-6e2c-4f36-bb2c-3d807c4e4939' WHERE tenant_id IS NULL;
```

### Parte 3: Corrigir TenantContext

Garantir que `fetchTenantData` é re-executado quando `currentUserId` muda:

```typescript
// Adicionar currentUserId como dependência explícita do useEffect
useEffect(() => {
  // Só executar se loading terminou ou userId mudou
  if (currentUserId !== undefined) {
    fetchTenantData();
  }
}, [currentUserId, tenantIdentifier]);
```

---

## Tabelas Afetadas

| Tabela | Políticas a Remover | Dados a Migrar |
|--------|---------------------|----------------|
| members | 4 políticas antigas | ~7 registros |
| church_events | 5 políticas antigas | X registros |
| congregations | 5 políticas antigas | X registros |
| ministries | 5 políticas antigas | X registros |
| departments | 4 políticas antigas | X registros |
| suppliers | 4 políticas antigas | X registros |
| financial_records | 3 políticas antigas | X registros |
| reconciliations | 4 políticas antigas | X registros |
| accounts_payable | 4 políticas antigas | X registros |
| expense_categories | 2 políticas antigas | X registros |
| access_profiles | 2 políticas antigas | Manter NULL para perfis globais |

---

## Resultado Esperado

Após a correção:

1. **admin@mica.com** → Vê apenas dados da Mica (tenant_id = bf9bb59f)
2. **admin@iptm.com** → Vê apenas dados do IPTM Global (tenant_id = 846fa096)
3. **Super Admin** → Vê dados de todos os tenants
4. **Tela de Configurações** → Mostra abas Branding/Home/Módulos para usuários com tenant

---

## Arquivos a Modificar

1. **Nova migração SQL** - Remover políticas duplicadas e migrar dados
2. **src/contexts/TenantContext.tsx** - Corrigir race condition no carregamento

