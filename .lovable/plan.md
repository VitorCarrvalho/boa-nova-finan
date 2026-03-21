
# Correção Crítica: Isolamento de Login por Organização (Tenant)

## Problema

O Supabase Auth é global — qualquer usuário com credenciais válidas pode fazer login em qualquer URL de organização. Não existe nenhuma verificação que compare o `tenant_id` do usuário com o tenant da URL acessada. Resultado: `admin@lagoinha.com` consegue logar no subdomínio da Mica e ver todos os dados.

## Causa raiz

A função `signIn` no `AuthContext.tsx` (linha 602) apenas verifica `approval_status` após o login. Nunca verifica se o `tenant_id` do usuário corresponde ao tenant da organização sendo acessada.

## Plano de correção

### 1. `src/contexts/AuthContext.tsx` — Validar tenant no login

Após o login bem-sucedido (linha 630+), adicionar verificação:

1. Importar `useTenant` do TenantContext (já disponível pois TenantProvider envolve AuthProvider)
2. Na função `signIn`, após verificar `approval_status`, consultar o `tenant_id` do perfil do usuário
3. Comparar com o `tenant.id` do contexto atual
4. Se não coincidir → fazer `signOut()` imediatamente e retornar erro "Email ou senha inválidos" (mensagem genérica por segurança — não revelar que o usuário existe em outra org)

```
// Pseudocódigo da validação:
if (currentTenant && profile.tenant_id !== currentTenant.id) {
  await supabase.auth.signOut();
  return { error: { message: 'Invalid login credentials' } };
}
```

### 2. `src/contexts/AuthContext.tsx` — Validar tenant no carregamento de sessão

O mesmo check precisa existir no `processAuth` (que roda no `onAuthStateChange` e `checkSession`). Se um usuário já tem sessão ativa e acessa a URL de outra org, deve ser deslogado automaticamente.

Na função que processa a sessão existente (~linha 200+), após carregar o perfil:
- Se há tenant no contexto e o `tenant_id` do perfil não bate → fazer signOut silencioso

### 3. Mensagem de erro genérica (segurança)

A mensagem retornada deve ser **"Email ou senha incorretos"** — nunca indicar que o usuário existe em outra organização. Isso evita enumeração de contas.

## Arquivos

| Arquivo | Alteração |
|---|---|
| `src/contexts/AuthContext.tsx` | Adicionar validação de tenant no `signIn` e no `processAuth` |

## Pontos de atenção

- Super Admins devem ser isentos desta validação (eles não pertencem a nenhum tenant específico)
- A validação no preview/localhost (sem tenant definido) não deve bloquear — apenas quando há tenant identificado na URL
- O cache local (`lovable_user_data`) também deve ser invalidado quando o tenant não bate
