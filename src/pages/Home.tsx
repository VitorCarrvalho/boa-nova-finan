
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantHome } from '@/hooks/useTenantHome';
import { useTenantBranding } from '@/hooks/useTenantBranding';
import PastoresWidget from '@/components/home/widgets/PastoresWidget';
import ProximosEventosWidget from '@/components/home/widgets/ProximosEventosWidget';
import CalendarioWidget from '@/components/home/widgets/CalendarioWidget';
import VersiculoWidget from '@/components/home/widgets/VersiculoWidget';
import MapaWidget from '@/components/home/widgets/MapaWidget';
import InstagramWidget from '@/components/home/widgets/InstagramWidget';
import PedidoOracaoWidget from '@/components/home/widgets/PedidoOracaoWidget';
import ConectaWidget from '@/components/home/widgets/ConectaWidget';
import FloatingLoginButton from '@/components/home/FloatingLoginButton';

const widgetComponents: Record<string, React.ComponentType> = {
  pastores: PastoresWidget,
  eventos: ProximosEventosWidget,
  calendario: CalendarioWidget,
  versiculo: VersiculoWidget,
  mapa: MapaWidget,
  instagram: InstagramWidget,
  oracao: PedidoOracaoWidget,
  conecta: ConectaWidget,
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: tenantLoading, error: tenantError } = useTenant();
  const { isWidgetEnabled, getOrderedWidgets } = useTenantHome();
  const { branding, loading: brandingLoading } = useTenantBranding();

  if (tenantLoading || brandingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center home-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="min-h-screen flex items-center justify-center home-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Organização não encontrada</h1>
          <p className="text-muted-foreground">{tenantError}</p>
        </div>
      </div>
    );
  }

  // Render widgets based on configuration
  const renderWidget = (widgetKey: string) => {
    if (!isWidgetEnabled(widgetKey)) return null;
    const Component = widgetComponents[widgetKey];
    if (!Component) return null;
    return <Component key={widgetKey} />;
  };

  const orderedWidgets = getOrderedWidgets();

  // Group widgets for layout
  const getWidgetLayout = () => {
    const layout: React.ReactNode[] = [];
    
    orderedWidgets.forEach((widgetKey, index) => {
      const widget = renderWidget(widgetKey);
      if (!widget) return;

      // Full width widgets
      if (['pastores', 'eventos', 'mapa', 'conecta'].includes(widgetKey)) {
        layout.push(
          <div key={`full-${widgetKey}`} className="w-full">
            {widget}
          </div>
        );
      } 
      // Small widgets - pair them up
      else if (['calendario', 'versiculo'].includes(widgetKey)) {
        const otherKey = widgetKey === 'calendario' ? 'versiculo' : 'calendario';
        const otherEnabled = isWidgetEnabled(otherKey);
        
        // Only render pair once (when processing the first one in order)
        if (orderedWidgets.indexOf(widgetKey) < orderedWidgets.indexOf(otherKey) || !otherEnabled) {
          if (otherEnabled) {
            layout.push(
              <div key="calendario-versiculo-pair" className="grid grid-cols-2 gap-6">
                {renderWidget('calendario')}
                <div className="md:col-span-1">
                  {renderWidget('versiculo')}
                </div>
              </div>
            );
          } else {
            layout.push(
              <div key={`single-${widgetKey}`} className="w-full">
                {widget}
              </div>
            );
          }
        }
      }
      // Instagram and Oracao pair
      else if (['instagram', 'oracao'].includes(widgetKey)) {
        const otherKey = widgetKey === 'instagram' ? 'oracao' : 'instagram';
        const otherEnabled = isWidgetEnabled(otherKey);
        
        if (orderedWidgets.indexOf(widgetKey) < orderedWidgets.indexOf(otherKey) || !otherEnabled) {
          if (otherEnabled) {
            layout.push(
              <div key="instagram-oracao-pair" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderWidget('instagram')}
                <div className="md:col-span-1">
                  {renderWidget('oracao')}
                </div>
              </div>
            );
          } else {
            layout.push(
              <div key={`single-${widgetKey}`} className="w-full">
                {widget}
              </div>
            );
          }
        }
      }
    });

    return layout;
  };

  return (
    <div className="min-h-screen home-background relative">
      {/* Grid Container */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Título da Igreja com efeito Black Piano */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl widget-title text-slate-700 font-bold mb-3 tracking-tight">
            {branding.churchName}
          </h1>
          {branding.tagline && (
            <p className="text-lg md:text-xl text-muted-foreground italic font-medium">
              "{branding.tagline}"
            </p>
          )}
        </div>

        {/* Dynamic Widget Layout */}
        <div className="max-w-md mx-auto md:max-w-4xl space-y-6">
          {getWidgetLayout()}
        </div>
      </div>

      {/* Botão Flutuante de Login */}
      <FloatingLoginButton />
    </div>
  );
};

export default Home;
