import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PermissionsDiagnostic = () => {
  const { user, userAccessProfile, userPermissions } = useAuth();
  const { canViewModule } = usePermissions();

  const testModules = [
    'dashboard',
    'gestao-acessos',
    'contas-pagar',
    'financeiro',
    'membros',
    'eventos',
    'congregacoes',
    'ministerios',
    'fornecedores',
    'relatorios',
    'configuracoes',
    'notificacoes'
  ];

  if (!user) {
    return <div>Usuário não logado</div>;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Diagnóstico de Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <strong>Usuário:</strong> {user.email} ({userAccessProfile})
          </div>
          
          <div>
            <strong>Status das Permissões:</strong>
            {userPermissions ? (
              <Badge variant="default" className="ml-2">
                {Object.keys(userPermissions).length} módulos carregados
              </Badge>
            ) : (
              <Badge variant="destructive" className="ml-2">
                Nenhuma permissão carregada
              </Badge>
            )}
          </div>

          <div>
            <strong>Módulos e Acesso:</strong>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {testModules.map(module => (
                <div key={module} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{module}</span>
                  <Badge variant={canViewModule(module) ? "default" : "secondary"}>
                    {canViewModule(module) ? "✓" : "✗"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {userPermissions && (
            <div>
              <strong>Permissões Brutas:</strong>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                {JSON.stringify(userPermissions, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsDiagnostic;