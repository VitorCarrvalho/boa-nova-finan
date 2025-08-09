
export interface ModuleAction {
  key: string;
  label: string;
  applicable: boolean;
}

export interface SubModule {
  key: string;
  label: string;
  actions: ModuleAction[];
  subSubModules?: SubModule[];
}

export interface Module {
  key: string;
  label: string;
  icon: string;
  actions: ModuleAction[];
  subModules?: SubModule[];
}

export const MODULE_STRUCTURE: Module[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'membros',
    label: 'Membros',
    icon: 'Users',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'congregacoes',
    label: 'Congregações',
    icon: 'Church',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'departamentos',
    label: 'Departamentos',
    icon: 'Building2',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'ministerios',
    label: 'Ministérios',
    icon: 'Heart',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'eventos',
    label: 'Eventos',
    icon: 'Calendar',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    icon: 'DollarSign',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
    subModules: [
      {
        key: 'despesas',
        label: 'Despesas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
          { key: 'edit', label: 'Editar', applicable: true },
          { key: 'delete', label: 'Excluir', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'receitas',
        label: 'Receitas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
          { key: 'edit', label: 'Editar', applicable: true },
          { key: 'delete', label: 'Excluir', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
    ],
  },
  {
    key: 'conciliacoes',
    label: 'Conciliações',
    icon: 'Calculator',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'approve', label: 'Aprovar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'fornecedores',
    label: 'Fornecedores',
    icon: 'Truck',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'contas-pagar',
    label: 'Contas a Pagar',
    icon: 'CreditCard',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'approve', label: 'Aprovar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
    subModules: [
      {
        key: 'paid_accounts',
        label: 'Contas Pagas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'new_account',
        label: 'Incluir Nova Conta',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
        ],
      },
      {
        key: 'pending_approval',
        label: 'Pendentes de Aprovação',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'approve', label: 'Aprovar', applicable: true },
        ],
      },
      {
        key: 'authorize_accounts',
        label: 'Autorizar Contas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'approve', label: 'Aprovar', applicable: true },
        ],
      },
      {
        key: 'approved_accounts',
        label: 'Contas Aprovadas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
    ],
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    icon: 'BarChart3',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
    subModules: [
      {
        key: 'eventos',
        label: 'Relatório de Eventos',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'financeiro',
        label: 'Relatório Financeiro',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'membros',
        label: 'Relatório de Membros',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'conciliacoes',
        label: 'Relatório de Conciliações',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'fornecedores',
        label: 'Relatório de Fornecedores',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
    ],
  },
  {
    key: 'notificacoes',
    label: 'Notificações',
    icon: 'Bell',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'send', label: 'Enviar', applicable: true },
    ],
  },
  {
    key: 'gestao-acessos',
    label: 'Gestão de Acessos',
    icon: 'Shield',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'approve', label: 'Aprovar', applicable: true },
    ],
  },
  {
    key: 'documentacao',
    label: 'Documentação',
    icon: 'Book',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'insert', label: 'Inserir', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
      { key: 'delete', label: 'Excluir', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    icon: 'Settings',
    actions: [
      { key: 'view', label: 'Visualizar', applicable: true },
      { key: 'edit', label: 'Editar', applicable: true },
    ],
  },
];
