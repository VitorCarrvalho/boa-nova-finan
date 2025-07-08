
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateAccessProfile, useUpdateAccessProfile, AccessProfile } from '@/hooks/useAccessProfiles';

interface AccessProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: AccessProfile | null;
}

const AccessProfileForm: React.FC<AccessProfileFormProps> = ({
  open,
  onOpenChange,
  profile
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const createMutation = useCreateAccessProfile();
  const updateMutation = useUpdateAccessProfile();

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setDescription(profile.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (profile) {
        await updateMutation.mutateAsync({
          id: profile.id,
          name,
          description: description || undefined
        });
      } else {
        await createMutation.mutateAsync({
          name,
          description: description || undefined
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {profile ? 'Editar Perfil de Acesso' : 'Criar Perfil de Acesso'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gerente Financeiro"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional do perfil de acesso"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (profile ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessProfileForm;
