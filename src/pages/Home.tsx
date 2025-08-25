
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PastoresWidget from '@/components/home/widgets/PastoresWidget';
import ProximosEventosWidget from '@/components/home/widgets/ProximosEventosWidget';
import CalendarioWidget from '@/components/home/widgets/CalendarioWidget';
import VersiculoWidget from '@/components/home/widgets/VersiculoWidget';
import MapaWidget from '@/components/home/widgets/MapaWidget';
import InstagramWidget from '@/components/home/widgets/InstagramWidget';
import PedidoOracaoWidget from '@/components/home/widgets/PedidoOracaoWidget';
import FloatingLoginButton from '@/components/home/FloatingLoginButton';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Permitir visualização dos widgets mesmo após logout
  // Usuários logados podem acessar via dashboard, mas podem ver widgets se navegarem diretamente

  return (
    <div className="min-h-screen home-background relative">
      {/* Grid Container */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Título da Igreja com efeito Black Piano */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl widget-title text-slate-700 font-bold mb-3 tracking-tight">
            IPTM Global
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground italic font-medium">
            "Deus não é religião, é relacionamento."
          </p>
        </div>

        {/* iPhone-style Widget Layout - Responsivo */}
        <div className="max-w-md mx-auto md:max-w-4xl space-y-6">
          
          {/* Linha 0: Pastores - 1 widget grande */}
          <div className="w-full">
            <PastoresWidget />
          </div>
          
          {/* Linha 1: Próximos Eventos - 1 widget grande */}
          <div className="w-full">
            <ProximosEventosWidget />
          </div>
          
          {/* Linha 2: Calendário e Versículo - 2 widgets */}
          <div className="grid grid-cols-2 gap-6">
            <CalendarioWidget />
            <div className="md:col-span-1">
              <VersiculoWidget />
            </div>
          </div>
          
          {/* Linha 3: Mapa - 1 widget grande */}
          <div className="w-full">
            <MapaWidget />
          </div>
          
          {/* Linha 4: Instagram e Pedido - 2 widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InstagramWidget />
            <div className="md:col-span-1">
              <PedidoOracaoWidget />
            </div>
          </div>
          
        </div>
      </div>

      {/* Botão Flutuante de Login */}
      <FloatingLoginButton />
    </div>
  );
};

export default Home;
