import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useCurrentTenantSettings } from '@/hooks/useCurrentTenantSettings';

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

export function TenantModulesTab() {
  const { tenant, modulesConfig, saveModulesConfig, loading } = useCurrentTenantSettings();
  const [modules, setModules] = React.useState<TenantModulesConfig>({});
  
  const tenantPlan = tenant?.planType || 'free';

  React.useEffect(() => {
    if (modulesConfig && Object.keys(modulesConfig).length > 0) {
      setModules(modulesConfig);
    } else {
      setModules(getDefaultModulesForPlan(tenantPlan));
    }
  }, [modulesConfig, tenantPlan]);

  const handleToggle = (moduleKey: string, enabled: boolean) => {
    if (CORE_MODULES.includes(moduleKey) && !enabled) {
      return;
    }
    setModules(prev => ({ ...prev, [moduleKey]: enabled }));
  };

  const handleSubmit = async () => {
    await saveModulesConfig(modules);
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

  if (!tenant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Configurações de módulos estão disponíveis apenas para organizações específicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const planModules = PLAN_DEFAULT_MODULES[tenantPlan] || PLAN_DEFAULT_MODULES.free;
  const enabledCount = Object.values(modules).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Módulos do Sistema</CardTitle>
          <CardDescription>
            Habilite ou desabilite módulos para sua organização. Módulos desabilitados não aparecerão na interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
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

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
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

          <p className="text-xs text-muted-foreground mt-4">
            Módulos "Core" não podem ser desabilitados.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Módulos'}
        </Button>
      </div>
    </div>
  );
}

export default TenantModulesTab;
