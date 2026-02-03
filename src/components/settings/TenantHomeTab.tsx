import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantHomeConfig } from '@/contexts/TenantContext';
import { GripVertical, Instagram, MapPin, Users } from 'lucide-react';
import { useCurrentTenantSettings } from '@/hooks/useCurrentTenantSettings';

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

export function TenantHomeTab() {
  const { homeConfig, saveHomeConfig, loading, tenant } = useCurrentTenantSettings();
  
  const [widgets, setWidgets] = React.useState(homeConfig?.widgets || defaultHomeConfig.widgets);
  const [widgetOrder, setWidgetOrder] = React.useState(homeConfig?.widgetOrder || defaultHomeConfig.widgetOrder);
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
    await saveHomeConfig({
      widgets,
      widgetOrder,
      customBanners: homeConfig?.customBanners || [],
      instagram: instagram.handle ? instagram : undefined,
      address: address.street ? address : undefined,
      pastoresImageUrl: pastoresImageUrl || undefined,
    });
  };

  if (!tenant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Configurações da Home estão disponíveis apenas para organizações específicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Widgets Habilitados e Ordem */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Widgets da Home</CardTitle>
          <CardDescription>Habilite e ordene os widgets que aparecem na página inicial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
        </CardContent>
      </Card>

      {/* Configuração do Instagram */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            <CardTitle className="text-lg">Instagram</CardTitle>
          </div>
          <CardDescription>Configure o widget de Instagram</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </CardContent>
      </Card>

      {/* Configuração do Endereço */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <CardTitle className="text-lg">Endereço da Igreja</CardTitle>
          </div>
          <CardDescription>Configure o endereço exibido no mapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
        </CardContent>
      </Card>

      {/* Configuração da Imagem dos Pastores */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-lg">Imagem dos Pastores</CardTitle>
          </div>
          <CardDescription>URL da imagem exibida no widget de Pastores</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Configurações da Home'}
        </Button>
      </div>
    </div>
  );
}

export default TenantHomeTab;
