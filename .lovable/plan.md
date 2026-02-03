
# Plano: Sistema de Branding Personalizavel por Tenant

## Objetivo
Permitir que cada tenant (igreja) configure seu proprio logo e paleta de cores, aplicando automaticamente na tela de login e em todo o painel administrativo.

## Arquitetura Atual (ja existente)

O sistema JA possui uma infraestrutura de branding:

1. **TenantContext.tsx**: Carrega configuracoes do tenant baseado no subdominio
2. **tenant_settings (banco)**: Armazena branding em JSON (category = 'branding')
3. **TenantBrandingDialog.tsx**: Formulario para editar branding (cores HSL, logo URL, nome, etc.)
4. **useTenantBranding.ts**: Hook para consumir branding no frontend

### Estrutura de Branding Existente
```typescript
interface TenantBranding {
  primaryColor: string;      // HSL: "222.2 47.4% 11.2%"
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  fontFamily: string;
  churchName: string;
  tagline: string | null;
}
```

## O Que Falta Implementar

### 1. Tela de Login Dinamica (AuthPage.tsx)

**Problema atual**: A tela de login usa logo estatico (`logoIM.png`) e cor fixa (`#2652e9`)

**Solucao**:
- Usar `useTenantBranding()` para obter logo e cores do tenant
- Renderizar logo do tenant se existir, senao usar logo padrao
- Aplicar `primaryColor` do tenant nos botoes
- Mostrar `churchName` e `tagline` do tenant

### 2. Layout Administrativo (Layout.tsx)

**Problema atual**: Logo estatico no header

**Solucao**:
- Usar branding do tenant no header
- Logo dinamico baseado no tenant

### 3. Seletores de Cor Amigaveis (TenantBrandingDialog.tsx)

**Problema atual**: Usuario precisa digitar valores HSL manualmente (ex: "222.2 47.4% 11.2%")

**Solucao**:
- Adicionar color picker visual (input type="color")
- Converter HEX para HSL automaticamente
- Preview em tempo real das cores

### 4. Upload de Logo (Novo)

**Problema atual**: Usuario precisa fornecer URL externa do logo

**Solucao**:
- Adicionar upload de imagem para Supabase Storage
- Bucket ja existe: `profile-pictures` (pode ser usado) ou criar `tenant-logos`
- Salvar URL gerada no branding

---

## Arquivos a Modificar

### 1. `src/components/auth/AuthPage.tsx`
- Importar `useTenantBranding` ou `useTenant`
- Substituir logo estatico por `branding.logoUrl || logoIM`
- Aplicar `branding.primaryColor` nos botoes
- Mostrar `branding.churchName` como titulo (se existir)

### 2. `src/components/layout/Layout.tsx`
- Usar branding do tenant no header
- Logo dinamico

### 3. `src/components/tenants/TenantBrandingDialog.tsx`
- Adicionar color pickers visuais
- Funcao de conversao HEX para HSL
- Componente de upload de logo
- Preview do logo carregado

### 4. `src/contexts/TenantContext.tsx`
- Adicionar campo `buttonColor` ou usar `primaryColor` para botoes
- (Opcional) Adicionar mais opcoes de personalizacao

### 5. Criar: `src/utils/colorUtils.ts`
- Funcao `hexToHsl(hex: string): string`
- Funcao `hslToHex(hsl: string): string`
- Facilitar conversao entre formatos

### 6. Criar bucket de storage (SQL Migration)
- Bucket: `tenant-logos`
- Politica: Super admins podem fazer upload

---

## Fluxo de Funcionamento

```
+------------------------+
|  Super Admin acessa    |
|  /admin/tenants        |
+-----------+------------+
            |
            v
+------------------------+
|  Clica em "Branding"   |
|  de um tenant          |
+-----------+------------+
            |
            v
+------------------------+
|  TenantBrandingDialog  |
|  - Color Pickers       |
|  - Upload Logo         |
|  - Preview             |
+-----------+------------+
            |
            v
+------------------------+
|  Salva em              |
|  tenant_settings       |
+-----------+------------+
            |
            v
+------------------------+
|  Usuario do tenant     |
|  acessa via subdominio |
+-----------+------------+
            |
            v
+------------------------+
|  TenantContext carrega |
|  branding do tenant    |
+-----------+------------+
            |
            v
+------------------------+
|  AuthPage e Layout     |
|  aplicam cores/logo    |
+------------------------+
```

---

## Detalhes Tecnicos

### Conversao de Cores
- Input visual: `<input type="color">` retorna HEX (#2652e9)
- CSS Variables do Tailwind: usam HSL (222.2 47.4% 11.2%)
- Necessario converter HEX para HSL ao salvar

### Upload de Logo
- Usar Supabase Storage (bucket publico)
- Limitar tamanho (max 2MB)
- Aceitar PNG, JPG, SVG
- Retornar URL publica para salvar no branding

### Aplicacao das Cores
- Cores principais: via CSS variables (ja implementado no TenantContext)
- Botoes especificos: usar `style={{ backgroundColor: hsl(primaryColor) }}`
- Alternativa: Definir classe CSS dinamica

---

## Prioridades de Implementacao

1. **Alta**: Color pickers visuais no TenantBrandingDialog
2. **Alta**: Login dinamico com branding do tenant  
3. **Media**: Upload de logo para Storage
4. **Media**: Layout header dinamico
5. **Baixa**: Mais opcoes de personalizacao (gradientes, etc.)

---

## Resumo das Mudancas

| Arquivo | Mudanca |
|---------|---------|
| AuthPage.tsx | Usar branding dinamico (logo, cores, nome) |
| Layout.tsx | Logo dinamico no header |
| TenantBrandingDialog.tsx | Color pickers + upload de logo |
| colorUtils.ts (novo) | Funcoes de conversao HEX/HSL |
| SQL Migration | Bucket tenant-logos |

## Resultado Final

Cada tenant podera personalizar:
- Logo (upload ou URL)
- Favicon
- Cor primaria (visual picker)
- Cor secundaria
- Cor de destaque
- Nome da igreja
- Slogan/tagline
- Fonte

E essas configuracoes serao aplicadas automaticamente em:
- Tela de Login
- Header do painel
- Botoes principais
- Favicon do navegador
- Titulo da pagina
