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
        {/* iPhone-style Grid Layout */}
        <div className="grid grid-cols-3 gap-4 auto-rows-min max-w-4xl mx-auto">
          {/* Calendário - pequeno */}
          <CalendarioWidget />
          
          {/* Instagram - pequeno */}
          <InstagramWidget />
          
          {/* Próximos Eventos - grande */}
          <ProximosEventosWidget />
          
          {/* Mapa - médio */}
          <MapaWidget />
          
          {/* Versículo do Dia - grande */}
          <VersiculoWidget />
          
          {/* Pedido de Oração - grande */}
          <PedidoOracaoWidget />
        </div>
      </div>

      {/* Botão Flutuante de Login */}
      <FloatingLoginButton />
    </div>
  );
};

export default Home;