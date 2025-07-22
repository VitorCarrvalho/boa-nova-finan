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
    <div className="min-h-screen home-background relative">
      {/* Grid Container */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Título da Igreja com efeito Black Piano */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bodoni font-normal mb-3 tracking-tight">
            <span className="text-black font-bold relative inline-block"
                  style={{
                    background: 'linear-gradient(145deg, #1a1a1a 0%, #000000 50%, #1a1a1a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: `
                      0 1px 0 #333,
                      0 2px 0 #222,
                      0 3px 0 #111,
                      0 4px 8px rgba(0,0,0,0.8),
                      0 8px 16px rgba(0,0,0,0.6),
                      inset 0 1px 0 rgba(255,255,255,0.1)
                    `,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                    position: 'relative'
                  }}>
              IPTM Global
            </span>
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

        {/* Decorative elements */}
        <div className="fixed top-20 left-10 w-4 h-4 bg-blue-400/20 rounded-full animate-pulse hidden md:block" />
        <div className="fixed top-40 right-20 w-6 h-6 bg-purple-400/20 rounded-full animate-pulse hidden md:block" style={{animationDelay: '1s'}} />
        <div className="fixed bottom-32 left-32 w-3 h-3 bg-green-400/20 rounded-full animate-pulse hidden md:block" style={{animationDelay: '2s'}} />
      </div>

      {/* Botão Flutuante de Login */}
      <FloatingLoginButton />
    </div>
  );
};

export default Home;
