import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const PermissionsDebug = () => {
  const { user, userPermissions, userAccessProfile, loading } = useAuth();

  // Recarregar a página para forçar refresh das permissões
  const handleRefresh = () => {
    window.location.reload();
  };

  // Mostrar apenas para usuários específicos de debug
  const isDebugUser = user?.email === 'contato@leonardosale.com' || user?.email === 'robribeir20@gmail.com';
  
  if (!isDebugUser) {
    return null;
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 Debug de Permissões - {user?.email}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
          <div>
            <strong>Loading Status:</strong>{' '}
            <Badge variant={loading ? "destructive" : "default"}>
              {loading ? "Carregando..." : "Carregado"}
            </Badge>
          </div>
          
          <div>
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </div>
          
          <div>
            <strong>User Access Profile:</strong>{' '}
            <Badge variant={userAccessProfile ? "default" : "secondary"}>
              {userAccessProfile || 'Não definido'}
            </Badge>
          </div>
          
          <div>
            <strong>Access Profile:</strong>{' '}
            <Badge variant={userAccessProfile ? "default" : "secondary"}>
              {userAccessProfile || 'Não carregado'}
            </Badge>
          </div>
          
          <div>
            <strong>Permissions Status:</strong>
            {userPermissions ? (
              <div>
                <Badge variant="default" className="mb-2">
                  {Object.keys(userPermissions).length} módulos encontrados
                </Badge>
                <div className="bg-gray-100 p-2 rounded text-xs max-h-60 overflow-auto">
                  <pre>{JSON.stringify(userPermissions, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div>
                <Badge variant="destructive">Permissões não carregadas</Badge>
                <p className="text-red-600 mt-2">
                  ⚠️ As permissões estão vazias ou null. Verifique os logs do console.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <strong>Instruções de Debug:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Abra o Console do navegador (F12)</li>
              <li>Procure por logs que começam com "🔍 {user?.email?.toUpperCase()}"</li>
              <li>Verifique se há erros nas queries de permissões</li>
              <li>Se necessário, clique em "Recarregar" para tentar novamente</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsDebug;