
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface UserRoleDropdownProps {
  value: UserRole;
  onValueChange: (value: UserRole) => void;
  placeholder?: string;
  disabled?: boolean;
}

const UserRoleDropdown: React.FC<UserRoleDropdownProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione o cargo",
  disabled = false
}) => {
  const roleDisplayNames = {
    'superadmin': 'Super Administrador',
    'admin': 'Administrador',
    'finance': 'Financeiro',
    'pastor': 'Pastor',
    'worker': 'Obreiro',
    'assistente': 'Assistente',
    'analista': 'Analista',
    'coordenador': 'Coordenador',
    'gerente': 'Gerente',
    'diretor': 'Diretor',
    'presidente': 'Presidente'
  };

  const roles: UserRole[] = [
    'superadmin',
    'admin',
    'finance',
    'pastor',
    'worker',
    'assistente',
    'analista',
    'coordenador',
    'gerente',
    'diretor',
    'presidente'
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {roleDisplayNames[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default UserRoleDropdown;
