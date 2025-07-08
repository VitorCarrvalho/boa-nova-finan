
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
    subModules: [
      {
        key: 'receitas',
        label: 'Receitas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
          { key: 'edit', label: 'Editar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'despesas',
        label: 'Despesas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
          { key: 'edit', label: 'Editar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
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
        label: 'Eventos',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'financeiro',
        label: 'Financeiro',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'membros',
        label: 'Membros',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'conciliacoes',
        label: 'Conciliações',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'export', label: 'Exportar', applicable: true },
        ],
      },
      {
        key: 'fornecedores',
        label: 'Fornecedores',
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
      { key: 'send_notification', label: 'Enviar Notificação', applicable: true },
    ],
    subModules: [
      {
        key: 'nova',
        label: 'Nova Notificação',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
          { key: 'send_notification', label: 'Enviar', applicable: true },
        ],
      },
      {
        key: 'agendadas',
        label: 'Mensagens Agendadas',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'edit', label: 'Editar', applicable: true },
        ],
      },
      {
        key: 'historico',
        label: 'Histórico Enviado',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
        ],
      },
      {
        key: 'videos',
        label: 'Biblioteca de Vídeos',
        actions: [
          { key: 'view', label: 'Visualizar', applicable: true },
          { key: 'insert', label: 'Inserir', applicable: true },
          { key: 'edit', label: 'Editar', applicable: true },
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
      { key: 'approve', label: 'Aprovar', applicable: true },
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
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
      { key: 'inactivate', label: 'Inativar', applicable: true },
      { key: 'export', label: 'Exportar', applicable: true },
    ],
  },
];
