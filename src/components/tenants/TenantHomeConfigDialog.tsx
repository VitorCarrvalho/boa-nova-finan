import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TenantHomeConfig } from '@/contexts/TenantContext';
import { GripVertical, Instagram, MapPin, Users } from 'lucide-react';

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
  
  // Dados específicos dos widgets
  const [instagram, setInstagram] = React.useState(homeConfig?.instagram || { handle: '', url: '' });
  const [address, setAddress] = React.useState(homeConfig?.address || { street: '', neighborhood: '', city: '', cep: '' });
  const [pastoresImageUrl, setPastoresImageUrl] = React.useState(homeConfig?.pastoresImageUrl || '');

  React.useEffect(() => {
    if (homeConfig) {
      setWidgets(homeConfig.widgets);
      setWidgetOrder(homeConfig.widgetOrder);
      setInstagram(homeConfig.instagram || { handle: '', url: '' });
      setAddress(homeConfig.address || { street: '', neighborhood: '', city: '', cep: '' });
      setPastoresImageUrl(homeConfig.pastoresImageUrl || '');
    } else {
      setWidgets(defaultHomeConfig.widgets);
      setWidgetOrder(defaultHomeConfig.widgetOrder);
      setInstagram({ handle: '', url: '' });
      setAddress({ street: '', neighborhood: '', city: '', cep: '' });
      setPastoresImageUrl('');
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
      instagram: instagram.handle ? instagram : undefined,
      address: address.street ? address : undefined,
      pastoresImageUrl: pastoresImageUrl || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Config. Home - {tenantName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widgets Habilitados e Ordem */}
          <div>
            <h4 className="font-medium mb-3">Widgets Habilitados e Ordem</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
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

          {/* Configuração do Instagram */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Instagram className="h-4 w-4" />
              <h4 className="font-medium">Instagram</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="instagram-handle">Handle</Label>
                <Input
                  id="instagram-handle"
                  placeholder="@suaigreja"
                  value={instagram.handle}
                  onChange={(e) => setInstagram({ ...instagram, handle: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="instagram-url">URL do Perfil</Label>
                <Input
                  id="instagram-url"
                  placeholder="https://instagram.com/suaigreja"
                  value={instagram.url}
                  onChange={(e) => setInstagram({ ...instagram, url: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Configuração do Endereço */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4" />
              <h4 className="font-medium">Endereço da Igreja</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="address-street">Rua e Número</Label>
                <Input
                  id="address-street"
                  placeholder="Rua Principal, 100"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address-neighborhood">Bairro</Label>
                <Input
                  id="address-neighborhood"
                  placeholder="Centro"
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address-city">Cidade - Estado</Label>
                <Input
                  id="address-city"
                  placeholder="São Paulo - SP"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="address-cep">CEP</Label>
                <Input
                  id="address-cep"
                  placeholder="00000-000"
                  value={address.cep}
                  onChange={(e) => setAddress({ ...address, cep: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Configuração da Imagem dos Pastores */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <h4 className="font-medium">Imagem dos Pastores</h4>
            </div>
            <div>
              <Label htmlFor="pastores-image">URL da Imagem</Label>
              <Input
                id="pastores-image"
                placeholder="https://exemplo.com/imagem.jpg"
                value={pastoresImageUrl}
                onChange={(e) => setPastoresImageUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole a URL de uma imagem hospedada (ex: Supabase Storage)
              </p>
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
