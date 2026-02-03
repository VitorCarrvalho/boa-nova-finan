
# Plano: Renomear Sistema de "Gestor IPTM" para "Igreja Moove"

## Problema Identificado

O sistema atualmente usa "Gestor IPTM" como nome em varios lugares, porem:
- **IPTM** e o nome de uma igreja especifica (um tenant)
- **Igreja Moove** e o nome correto do sistema/plataforma SaaS

## Arquivos a Modificar

### 1. Pagina de Login (`src/components/auth/AuthPage.tsx`)
**Linha 241**: Alterar titulo de "Gestor iptm" para "Igreja Moove"

### 2. Sidebar Desktop (`src/components/layout/Sidebar.tsx`)
**Linha 323**: Alterar titulo de "Gestor iptm" para "Igreja Moove"

### 3. Sidebar Mobile (`src/components/layout/MobileSidebar.tsx`)
**Linha 292**: Alterar titulo de "Gestor iptm" para "Igreja Moove"

### 4. Contexto de Tenant (`src/contexts/TenantContext.tsx`)
**Linha 65**: Alterar `churchName` padrao de "IPTM Global" para "Igreja Moove"
**Linha 66**: Atualizar `tagline` padrao (opcional)

### 5. HTML Base (`index.html`)
**Linhas 7, 11**: Atualizar titulo e og:title para "Igreja Moove"
**Linha 8**: Atualizar descricao meta

### 6. Pagina Conecta Management (`src/pages/ConectaManagement.tsx`)
**Linha 251**: Atualizar titulo do Helmet

## Resumo das Mudancas

| Arquivo | De | Para |
|---------|-----|------|
| AuthPage.tsx | "Gestor iptm" | "Igreja Moove" |
| Sidebar.tsx | "Gestor iptm" | "Igreja Moove" |
| MobileSidebar.tsx | "Gestor iptm" | "Igreja Moove" |
| TenantContext.tsx | "IPTM Global" | "Igreja Moove" |
| index.html | "gestor" | "Igreja Moove" |
| ConectaManagement.tsx | "Gestor IPTM" | "Igreja Moove" |

## Nota sobre Modulo "Conecta IPTM"

O modulo "Conecta IPTM" pode ser mantido como esta, pois e um modulo especifico para a comunidade IPTM. Se desejar renomear para "Conecta Moove" ou algo generico, isso pode ser feito em uma alteracao futura.
