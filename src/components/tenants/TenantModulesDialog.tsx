import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, Users, Church, Building2, Heart, Calendar,
  DollarSign, Calculator, Truck, CreditCard, BarChart3, Bell,
  Shield, Book, Settings, Network
} from 'lucide-react';
import { 
  ALL_MODULES, 
  PLAN_DEFAULT_MODULES, 
  CORE_MODULES,
  TenantModulesConfig,
  getDefaultModulesForPlan 
} from '@/hooks/useTenantModules';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Church,
  Building2,
  Heart,
  Calendar,
  DollarSign,
  Calculator,
  Truck,
  CreditCard,
  BarChart3,
  Bell,
  Shield,
  Book,
  Settings,
  Network,
};

interface TenantModulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  tenantPlan: string;
  modulesConfig?: TenantModulesConfig;
  onSubmit: (modules: TenantModulesConfig) => Promise<void>;
  loading?: boolean;
}

export function TenantModulesDialog({
  open,
  onOpenChange,
  tenantName,
  tenantPlan,
  modulesConfig,
  onSubmit,
  loading = false,
}: TenantModulesDialogProps) {
  const [modules, setModules] = React.useState<TenantModulesConfig>({});
  
  // Inicializar módulos quando o dialog abre
  React.useEffect(() => {
    if (open) {
      if (modulesConfig && Object.keys(modulesConfig).length > 0) {
        setModules(modulesConfig);
      } else {
        // Usar padrão do plano se não há configuração
        setModules(getDefaultModulesForPlan(tenantPlan));
      }
    }
  }, [open, modulesConfig, tenantPlan]);

  const handleToggle = (moduleKey: string, enabled: boolean) => {
    // Não permitir desabilitar módulos core
    if (CORE_MODULES.includes(moduleKey) && !enabled) {
      return;
    }
    setModules(prev => ({ ...prev, [moduleKey]: enabled }));
  };

  const handleSubmit = async () => {
    await onSubmit(modules);
    onOpenChange(false);
  };

  const handleResetToPlan = () => {
    setModules(getDefaultModulesForPlan(tenantPlan));
  };

  const handleEnableAll = () => {
    const allEnabled: TenantModulesConfig = {};
    ALL_MODULES.forEach(m => {
      allEnabled[m.key] = true;
    });
    setModules(allEnabled);
  };

  const planModules = PLAN_DEFAULT_MODULES[tenantPlan] || PLAN_DEFAULT_MODULES.free;
  const enabledCount = Object.values(modules).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configurar Módulos - {tenantName}</DialogTitle>
          <DialogDescription>
            Habilite ou desabilite módulos para este tenant. Módulos desabilitados não aparecerão na interface.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Plano: {tenantPlan}</Badge>
            <Badge variant="secondary">{enabledCount}/{ALL_MODULES.length} módulos ativos</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleResetToPlan}>
              Restaurar Plano
            </Button>
            <Button variant="outline" size="sm" onClick={handleEnableAll}>
              Habilitar Todos
            </Button>
          </div>
        </div>

        <Separator />

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {ALL_MODULES.map((module) => {
              const Icon = iconMap[module.icon] || LayoutDashboard;
              const isCore = CORE_MODULES.includes(module.key);
              const isInPlan = planModules.includes(module.key);
              const isEnabled = modules[module.key] === true;

              return (
                <div
                  key={module.key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isEnabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{module.label}</Label>
                        {isCore && (
                          <Badge variant="default" className="text-xs">Core</Badge>
                        )}
                        {isInPlan && !isCore && (
                          <Badge variant="secondary" className="text-xs">Incluído no Plano</Badge>
                        )}
                        {!isInPlan && !isCore && isEnabled && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                            Extra
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {module.key}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(module.key, checked)}
                    disabled={isCore}
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <p className="text-xs text-muted-foreground">
            Módulos "Core" não podem ser desabilitados.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Configuração'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TenantModulesDialog;
