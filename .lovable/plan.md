
# Plano: Adicionar Logo do Igreja Moove

## Objetivo
Substituir o logo antigo (`fiveicon.svg`) pelo novo logo oficial do Igreja Moove em todos os lugares relevantes do sistema.

## Arquivos Afetados

### 1. Copiar o logo para o projeto
- **De**: `user-uploads://logoIM.png`
- **Para**: `src/assets/logoIM.png`

### 2. Atualizar Layout.tsx
Substituir a importacao e uso do `fiveIcon` pelo novo `logoIM`:

| Local | Alteracao |
|-------|-----------|
| Linha 9 | Trocar `import fiveIcon from '@/assets/fiveicon.svg'` por `import logoIM from '@/assets/logoIM.png'` |
| Linha 59 | Trocar `src={fiveIcon}` por `src={logoIM}` |
| Linha 60 | Trocar `alt="IPTM Logo"` por `alt="Igreja Moove"` |
| Linha 89 | Trocar `src={fiveIcon}` por `src={logoIM}` |
| Linha 90 | Trocar `alt="IPTM Logo"` por `alt="Igreja Moove"` |

### 3. Pagina de Login (AuthPage.tsx)
Adicionar o logo acima do titulo "Igreja Moove" para reforcar a identidade visual na tela de login.

### 4. Considerar outros locais (opcional)
- Sidebar Desktop/Mobile: Podem receber o logo no cabecalho
- Super Admin Layout: Pode manter o icone atual diferenciado

## Resultado Esperado
O novo logo do Igreja Moove (circulo azul com igreja + texto) aparecera no header do painel administrativo e na tela de login, substituindo o icone antigo e reforçando a identidade da marca.
