import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccessProfiles } from '@/hooks/useAccessProfiles';

interface AccessProfileDropdownProps {
  value: string | null;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const AccessProfileDropdown: React.FC<AccessProfileDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione o perfil de acesso",
  disabled = false
}) => {
  const { data: profiles, isLoading } = useAccessProfiles();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value || ''} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {profiles?.map((profile) => (
          <SelectItem key={profile.id} value={profile.id}>
            <div className="flex flex-col">
              <span className="font-medium">{profile.name}</span>
              {profile.description && (
                <span className="text-sm text-muted-foreground">{profile.description}</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AccessProfileDropdown;