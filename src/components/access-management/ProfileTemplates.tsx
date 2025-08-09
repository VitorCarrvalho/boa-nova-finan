import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Shield, Users, BarChart3 } from 'lucide-react';

export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  permissions: Record<string, any>;
  color: string;
}

const profileTemplates: ProfileTemplate[] = [
  {
    id: 'read-only',
    name: 'Somente Leitura',
    description: 'Acesso apenas para visualização de dados',
    icon: <Eye className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800',
    permissions: {
      dashboard: { view: true, export: false },
      membros: { view: true, insert: false, edit: false, delete: false, export: false },
      congregacoes: { view: true, insert: false, edit: false, delete: false, export: false },
      departamentos: { view: true, insert: false, edit: false, delete: false, export: false },
      ministerios: { view: true, insert: false, edit: false, delete: false, export: false },
      eventos: { view: true, insert: false, edit: false, delete: false, export: false },
      financeiro: { view: true, insert: false, edit: false, delete: false, export: false },
      conciliacoes: { view: true, insert: false, edit: false, delete: false, approve: false, export: false },
      fornecedores: { view: true, insert: false, edit: false, delete: false, export: false },
      'contas-pagar': { view: true, insert: false, edit: false, delete: false, approve: false, export: false },
      relatorios: { view: true, export: false },
      notificacoes: { view: true, insert: false, edit: false, delete: false, send: false },
      'gestao-acessos': { view: false, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: false, edit: false, delete: false, export: false },
      configuracoes: { view: false, edit: false }
    }
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Pode criar e editar dados, sem exclusões',
    icon: <Edit className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800',
    permissions: {
      dashboard: { view: true, export: true },
      membros: { view: true, insert: true, edit: true, delete: false, export: true },
      congregacoes: { view: true, insert: true, edit: true, delete: false, export: true },
      departamentos: { view: true, insert: true, edit: true, delete: false, export: true },
      ministerios: { view: true, insert: true, edit: true, delete: false, export: true },
      eventos: { view: true, insert: true, edit: true, delete: false, export: true },
      financeiro: { view: true, insert: true, edit: true, delete: false, export: true },
      conciliacoes: { view: true, insert: true, edit: true, delete: false, approve: false, export: true },
      fornecedores: { view: true, insert: true, edit: true, delete: false, export: true },
      'contas-pagar': { view: true, insert: true, edit: true, delete: false, approve: false, export: true },
      relatorios: { view: true, export: true },
      notificacoes: { view: true, insert: true, edit: true, delete: false, send: true },
      'gestao-acessos': { view: false, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: true, edit: true, delete: false, export: true },
      configuracoes: { view: true, edit: false }
    }
  },
  {
    id: 'manager',
    name: 'Gerente',
    description: 'Controle completo com aprovações',
    icon: <Users className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800',
    permissions: {
      dashboard: { view: true, export: true },
      membros: { view: true, insert: true, edit: true, delete: true, export: true },
      congregacoes: { view: true, insert: true, edit: true, delete: true, export: true },
      departamentos: { view: true, insert: true, edit: true, delete: true, export: true },
      ministerios: { view: true, insert: true, edit: true, delete: true, export: true },
      eventos: { view: true, insert: true, edit: true, delete: true, export: true },
      financeiro: { view: true, insert: true, edit: true, delete: false, export: true },
      conciliacoes: { view: true, insert: true, edit: true, delete: true, approve: true, export: true },
      fornecedores: { view: true, insert: true, edit: true, delete: true, export: true },
      'contas-pagar': { view: true, insert: true, edit: true, delete: true, approve: true, export: true },
      relatorios: { view: true, export: true },
      notificacoes: { view: true, insert: true, edit: true, delete: true, send: true },
      'gestao-acessos': { view: true, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: true, edit: true, delete: true, export: true },
      configuracoes: { view: true, edit: true }
    }
  },
  {
    id: 'analyst',
    name: 'Analista',
    description: 'Foco em relatórios e análises',
    icon: <BarChart3 className="h-5 w-5" />,
    color: 'bg-orange-100 text-orange-800',
    permissions: {
      dashboard: { view: true, export: true },
      membros: { view: true, insert: false, edit: false, delete: false, export: true },
      congregacoes: { view: true, insert: false, edit: false, delete: false, export: true },
      departamentos: { view: true, insert: false, edit: false, delete: false, export: true },
      ministerios: { view: true, insert: false, edit: false, delete: false, export: true },
      eventos: { view: true, insert: false, edit: false, delete: false, export: true },
      financeiro: { view: true, insert: false, edit: false, delete: false, export: true },
      conciliacoes: { view: true, insert: false, edit: false, delete: false, approve: false, export: true },
      fornecedores: { view: true, insert: false, edit: false, delete: false, export: true },
      'contas-pagar': { view: true, insert: false, edit: false, delete: false, approve: false, export: true },
      relatorios: { view: true, export: true },
      notificacoes: { view: true, insert: false, edit: false, delete: false, send: false },
      'gestao-acessos': { view: false, insert: false, edit: false, delete: false, approve: false },
      documentacao: { view: true, insert: false, edit: false, delete: false, export: true },
      configuracoes: { view: false, edit: false }
    }
  }
];

interface ProfileTemplatesProps {
  onSelectTemplate: (template: ProfileTemplate) => void;
}

const ProfileTemplates: React.FC<ProfileTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h4 className="text-sm font-medium">Templates Rápidos</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {profileTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-border/50"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${template.color}`}>
                  {template.icon}
                </div>
                <div>
                  <h5 className="font-medium text-sm">{template.name}</h5>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {Object.values(template.permissions).reduce((total, modulePerms) => {
                  return total + Object.values(modulePerms as Record<string, boolean>).filter(Boolean).length;
                }, 0)} permissões
              </Badge>
              
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Aplicar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfileTemplates;