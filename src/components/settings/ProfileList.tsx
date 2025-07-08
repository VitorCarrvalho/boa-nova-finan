
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAccessProfiles, useDeleteAccessProfile, AccessProfile } from '@/hooks/useAccessProfiles';
import AccessProfileForm from './AccessProfileForm';

interface ProfileListProps {
  selectedProfile: AccessProfile | null;
  onSelectProfile: (profile: AccessProfile) => void;
}

const ProfileList: React.FC<ProfileListProps> = ({ selectedProfile, onSelectProfile }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [editingProfile, setEditingProfile] = React.useState<AccessProfile | null>(null);

  const { data: profiles, isLoading } = useAccessProfiles();
  const deleteMutation = useDeleteAccessProfile();

  const handleEdit = (profile: AccessProfile) => {
    setEditingProfile(profile);
    setShowForm(true);
  };

  const handleDelete = async (profile: AccessProfile) => {
    if (profile.is_system_profile) {
      return; // Cannot delete system profiles
    }

    if (confirm(`Tem certeza que deseja excluir o perfil "${profile.name}"?`)) {
      await deleteMutation.mutateAsync(profile.id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProfile(null);
  };

  if (isLoading) {
    return (
      <div className="w-80 p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Perfis de Acesso</h3>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {profiles?.map(profile => (
          <Card 
            key={profile.id}
            className={`cursor-pointer transition-all ${
              selectedProfile?.id === profile.id 
                ? 'ring-2 ring-red-500 bg-red-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelectProfile(profile)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{profile.name}</CardTitle>
                <div className="flex items-center gap-1">
                  {profile.is_system_profile && (
                    <Badge variant="secondary" className="text-xs">Sistema</Badge>
                  )}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(profile);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {!profile.is_system_profile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(profile);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {profile.description && (
                <CardDescription className="text-xs">
                  {profile.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>

      <AccessProfileForm
        open={showForm}
        onOpenChange={handleCloseForm}
        profile={editingProfile}
      />
    </div>
  );
};

export default ProfileList;
