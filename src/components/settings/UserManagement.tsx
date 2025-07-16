
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AccessProfileDropdown from './AccessProfileDropdown';
import { Database } from '@/integrations/supabase/types';
import { Pencil, Save, X } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

const UserManagement = () => {
  // Only show approved users with access profiles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['approvedUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          access_profiles:profile_id (
            id,
            name,
            description
          )
        `)
        .eq('approval_status', 'ativo')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ profileId: string | null }>({
    profileId: null
  });

  const handleEditUser = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({
      profileId: user.profile_id
    });
  };

  const handleSaveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_id: editForm.profileId
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso!",
      });

      setEditingUser(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ profileId: null });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando usuários...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Gerencie usuários aprovados e seus perfis de acesso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                {editingUser === user.id ? (
                  <div>
                    <Label htmlFor={`profile-${user.id}`}>Perfil de Acesso</Label>
                    <AccessProfileDropdown
                      value={editForm.profileId}
                      onValueChange={(profileId) => setEditForm({ profileId })}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-blue-600">
                      {user.access_profiles?.name || 'Sem perfil atribuído'}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingUser === user.id ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSaveUser(user.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
