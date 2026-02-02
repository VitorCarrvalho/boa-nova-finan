import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TenantHomeConfig } from '@/contexts/TenantContext';
import { GripVertical } from 'lucide-react';

interface TenantHomeConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  homeConfig?: TenantHomeConfig;
  onSubmit: (values: TenantHomeConfig) => Promise<void>;
  loading?: boolean;
}

const widgetLabels: Record<string, string> = {
  pastores: 'Pastores',
  eventos: 'Próximos Eventos',
  calendario: 'Calendário',
  versiculo: 'Versículo do Dia',
  mapa: 'Mapa',
  instagram: 'Instagram',
  oracao: 'Pedido de Oração',
  conecta: 'Conecta',
};

const defaultHomeConfig: TenantHomeConfig = {
  widgets: {
    pastores: true,
    eventos: true,
    calendario: true,
    versiculo: true,
    mapa: true,
    instagram: true,
    oracao: true,
    conecta: true,
  },
  widgetOrder: ['pastores', 'eventos', 'calendario', 'versiculo', 'mapa', 'instagram', 'oracao', 'conecta'],
  customBanners: [],
};

export function TenantHomeConfigDialog({
  open,
  onOpenChange,
  tenantName,
  homeConfig,
  onSubmit,
  loading,
}: TenantHomeConfigDialogProps) {
  const [widgets, setWidgets] = React.useState(homeConfig?.widgets || defaultHomeConfig.widgets);
  const [widgetOrder, setWidgetOrder] = React.useState(homeConfig?.widgetOrder || defaultHomeConfig.widgetOrder);

  React.useEffect(() => {
    if (homeConfig) {
      setWidgets(homeConfig.widgets);
      setWidgetOrder(homeConfig.widgetOrder);
    } else {
      setWidgets(defaultHomeConfig.widgets);
      setWidgetOrder(defaultHomeConfig.widgetOrder);
    }
  }, [homeConfig]);

  const toggleWidget = (key: string) => {
    setWidgets((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...widgetOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setWidgetOrder(newOrder);
  };

  const handleSubmit = async () => {
    await onSubmit({
      widgets,
      widgetOrder,
      customBanners: homeConfig?.customBanners || [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Config. Home - {tenantName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3">Widgets Habilitados e Ordem</h4>
            <div className="space-y-2">
              {widgetOrder.map((widgetKey, index) => (
                <div
                  key={widgetKey}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => moveWidget(index, 'up')}
                        disabled={index === 0}
                      >
                        ▲
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => moveWidget(index, 'down')}
                        disabled={index === widgetOrder.length - 1}
                      >
                        ▼
                      </Button>
                    </div>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className={widgets[widgetKey as keyof typeof widgets] ? '' : 'text-muted-foreground line-through'}>
                      {widgetLabels[widgetKey] || widgetKey}
                    </span>
                  </div>
                  <Switch
                    checked={widgets[widgetKey as keyof typeof widgets]}
                    onCheckedChange={() => toggleWidget(widgetKey)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TenantHomeConfigDialog;
