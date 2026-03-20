

# Remover tema dark + Substituir logo oficial

## Alterações

### 1. Substituir logo
Copiar `logo-azul.png`, `logo-branco.png` e `logo-preto.png` para `src/assets/`. Substituir todas as referências a `logoIM` pelo novo `logo-azul.png` nos 3 arquivos:
- `src/components/layout/Layout.tsx`
- `src/components/auth/AuthPage.tsx`
- `src/pages/Onboarding.tsx`

### 2. Remover ThemeToggle do header
- `src/components/layout/HeaderProfile.tsx`: Remover import e uso de `<ThemeToggle />`

### 3. Forçar tema claro
- `src/App.tsx`: Alterar `<ThemeProvider>` para `defaultTheme="light"` e adicionar `forcedTheme="light"` (isso desabilita a troca de tema)

### 4. Remover `.dark` do CSS
- `src/index.css`: Remover todo o bloco `.dark { ... }` (linhas ~55-85) pois nunca será usado

### 5. Sonner (toaster)
- `src/components/ui/sonner.tsx`: Remover `useTheme` e fixar `theme="light"`

### 6. Manter o arquivo `theme-toggle.tsx`
Pode ser deletado, mas como não causa impacto, apenas remover o uso dele. O arquivo fica sem referências.

## Arquivos Modificados

| Arquivo | Alteração |
|---|---|
| `src/assets/logo-azul.png` | Novo logo (copiar upload) |
| `src/assets/logo-branco.png` | Logo contraste branco (copiar upload) |
| `src/assets/logo-preto.png` | Logo contraste preto (copiar upload) |
| `src/components/layout/Layout.tsx` | `logoIM` -> `logoAzul` |
| `src/components/auth/AuthPage.tsx` | `logoIM` -> `logoAzul` |
| `src/pages/Onboarding.tsx` | `logoIM` -> `logoAzul` |
| `src/components/layout/HeaderProfile.tsx` | Remover `ThemeToggle` |
| `src/App.tsx` | Forçar tema claro |
| `src/index.css` | Remover bloco `.dark` |
| `src/components/ui/sonner.tsx` | Fixar `theme="light"` |

