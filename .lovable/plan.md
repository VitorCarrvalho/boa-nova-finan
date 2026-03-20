

# Ajustes na Tela de Login

## Alterações no arquivo `src/components/auth/AuthPage.tsx`

### 1. Remover aba "Cadastrar"
- Remover `TabsTrigger value="signup"` e todo o `TabsContent value="signup"` (linhas 271, 312-375)
- Mudar `grid-cols-3` para `grid-cols-2` no `TabsList` (linha 269)
- Remover estados e imports não utilizados: `name`, `congregation`, `setCongregation`, `useCongregationsPublic`, `Select/SelectContent/SelectItem/SelectTrigger/SelectValue`
- Remover função `handleSignUp`

### 2. Aumentar logo
- Trocar `w-32 h-32` por `w-48 h-48` na tag `<img>` (linha 258)

### 3. Ajustar layout do texto de onboarding
- Mover o `<div>` com o texto "Sua igreja ainda não está na plataforma?" para **dentro** do container principal, abaixo do `Card`
- Mudar layout do container de `flex items-center justify-center` para `flex flex-col items-center justify-center` para empilhar card + texto
- Adicionar `mt-8` no div do texto para dar espaçamento agradável

