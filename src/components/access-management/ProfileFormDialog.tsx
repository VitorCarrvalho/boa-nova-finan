import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { MODULE_STRUCTURE } from '@/utils/moduleStructure';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, Users, Church, Building2, Heart, Calendar,
  DollarSign, Calculator, Truck, CreditCard, BarChart3, Bell,
  Shield, Book, Settings, Network
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, Church, Building2, Heart, Calendar,
  DollarSign, Calculator, Truck, CreditCard, BarChart3, Bell,
  Shield, Book, Settings, Network,
};

interface ProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    description: string;
    permissions: Record<string, any>;
  };
  onFormDataChange: (data: any) => void;
  onSave: () => Promise<void>;
  isEditing: boolean;
  isLoading?: boolean;
}

/**
 * Check if a module is "active" (any permission is true)
 */
function isModuleActive(permissions: Record<string, any>, moduleKey: string): boolean {
  const modulePerm = permissions[moduleKey];
  if (!modulePerm || typeof modulePerm !== 'object') return false;
  
  return Object.values(modulePerm).some((val: any) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'object' && val !== null) {
      return Object.values(val).some(Boolean);
    }
    return false;
  });
}

/**
 * Set all permissions for a module to true or false
 */
function setModulePermissions(moduleKey: string, enabled: boolean): Record<string, any> {
  const module = MODULE_STRUCTURE.find(m => m.key === moduleKey);
  if (!module) return {};

  const modulePerms: Record<string, any> = {};
  module.actions.forEach(action => {
    modulePerms[action.key] = enabled;
  });
  module.subModules?.forEach(sub => {
    modulePerms[sub.key] = {};
    sub.actions.forEach(action => {
      modulePerms[sub.key][action.key] = enabled;
    });
  });
  return modulePerms;
}

const ProfileFormDialog: React.FC<ProfileFormDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSave,
  isEditing,
  isLoading = false
}) => {
  const handleModuleToggle = (moduleKey: string, enabled: boolean) => {
    onFormDataChange({
      ...formData,
      permissions: {
        ...formData.permissions,
        [moduleKey]: setModulePermissions(moduleKey, enabled),
      }
    });
  };

  const handleSelectAll = () => {
    const allActive = MODULE_STRUCTURE.every(m => isModuleActive(formData.permissions, m.key));
    const newPermissions: Record<string, any> = {};
    MODULE_STRUCTURE.forEach(m => {
      newPermissions[m.key] = setModulePermissions(m.key, !allActive);
    });
    onFormDataChange({ ...formData, permissions: newPermissions });
  };

  const activeCount = MODULE_STRUCTURE.filter(m => isModuleActive(formData.permissions, m.key)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Perfil' : 'Criar Novo Perfil'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações e módulos do perfil' : 'Configure o novo perfil com os módulos que ele terá acesso'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Perfil *</Label>
              <Input
                value={formData.name}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                placeholder="Ex: Analista Financeiro"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                placeholder="Descreva as responsabilidades deste perfil"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Module Toggles */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Módulos com Acesso</h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {activeCount}/{MODULE_STRUCTURE.length} ativos
              </Badge>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {activeCount === MODULE_STRUCTURE.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[340px] pr-4">
            <div className="space-y-2">
              {MODULE_STRUCTURE.map((module) => {
                const Icon = iconMap[module.icon] || LayoutDashboard;
                const active = isModuleActive(formData.permissions, module.key);

                return (
                  <div
                    key={module.key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      active ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${active ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <Label className="font-medium">{module.label}</Label>
                        {module.subModules && module.subModules.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Inclui: {module.subModules.map(s => s.label).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={active}
                      onCheckedChange={(checked) => handleModuleToggle(module.key, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isLoading || !formData.name.trim()}>
            {isLoading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')} Perfil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileFormDialog;
