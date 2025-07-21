import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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

  // Redirecionar usuários logados para o dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Se usuário está logado, não renderizar nada (vai redirecionar)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Grid Container */}
      <div className="container mx-auto px-4 py-8">
        {/* iPhone-style Widget Layout - Responsivo */}
        <div className="max-w-md mx-auto md:max-w-4xl space-y-4">
          
          {/* Linha 1: Próximos Eventos - 1 widget grande */}
          <div className="w-full">
            <ProximosEventosWidget />
          </div>
          
          {/* Linha 2: Calendário e Versículo - 2 widgets */}
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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