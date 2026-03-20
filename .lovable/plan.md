

# Implementar Home pública por organização

## Situação atual

- `Home.tsx` existe com toda a lógica de widgets (pastores, versículo, eventos, etc.) mas **não está registrada em nenhuma rota** no `App.tsx`
- O `TenantContext` já resolve tenant por subdomínio (`mica.igrejamoove.com.br`) ou query param (`?tenant=slug`)
- A RLS de `tenant_settings` já permite leitura anônima de branding e home config para tenants ativos
- Os widgets (versículo, eventos, pedido de oração) já funcionam sem autenticação
- A rota `/` redireciona para `/auth`

## Problema

Não há rota pública que renderize a Home com os widgets da organização. Precisamos de uma URL pública por organização.

## Solução

### 1. Adicionar rota `/home` pública no `App.tsx`

- Importar `Home` de `@/pages/Home`
- Adicionar `<Route path="/home" element={<Home />} />` como rota pública (sem `ProtectedRoute`)
- Alterar a rota `/` para redirecionar para `/home` ao invés de `/auth`

Assim, ao acessar `mica.igrejamoove.com.br/home` (ou `?tenant=mica`), o `TenantContext` resolve o tenant pelo subdomínio e carrega branding + home config automaticamente.

### 2. Ajustar `Home.tsx` para não depender de `useAuth`

- Remover `useAuth()` do Home (não deve exigir autenticação)
- Manter `FloatingLoginButton` para redirecionar ao login

### 3. Ajustar rota `/` no `App.tsx`

- Mudar de `<Navigate to="/auth" />` para `<Navigate to="/home" />`
- Isso garante que `mica.igrejamoove.com.br` → `/home` → carrega home pública da organização

### 4. Garantir que widgets funcionem para `anon`

- **Versículo**: usa API externa, já funciona sem auth
- **Pastores**: usa `homeConfig.pastoresImageUrl` do TenantContext, já funciona
- **Eventos**: usa query em `church_events` — já tem policy `anon` SELECT para eventos ativos
- **Pedido de oração**: INSERT já tem policy para `anon`
- **Mapa/Instagram/Conecta**: dados estáticos do config, funcionam sem auth
- **Calendário**: derivado dos eventos, funciona com a policy anon existente

Nenhuma migração SQL necessária — as policies já suportam acesso anon.

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/App.tsx` | Importar Home, adicionar rota `/home` pública, mudar `/` → `/home` |
| `src/pages/Home.tsx` | Remover dependência de `useAuth` |

