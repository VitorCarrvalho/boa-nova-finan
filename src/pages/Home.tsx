import React from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BannerCarousel from '@/components/home/BannerCarousel';
import { useHomeEvents } from '@/hooks/useHomeEvents';
import { Skeleton } from '@/components/ui/skeleton';

const Home = () => {
  const navigate = useNavigate();
  const { data: events, isLoading } = useHomeEvents();

  // URLs das imagens padrão da igreja no Supabase Storage
  const defaultBannerUrl = 'https://jryifbcsifodvocshvuo.supabase.co/storage/v1/object/public/event-banners/church-banner.jpg';
  const defaultBannerMobileUrl = 'https://jryifbcsifodvocshvuo.supabase.co/storage/v1/object/public/event-banners//banner-default-mobile.png';

  const handleAccessSystem = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Login</h1>
          <Button onClick={handleAccessSystem} className="flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Acessar Sistema
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Banner Carousel */}
          <div className="mb-8">
            {isLoading ? (
              <Skeleton className="w-full h-96 md:h-[600px] rounded-lg" />
            ) : (
              <BannerCarousel 
                events={events || []} 
                defaultBannerUrl={defaultBannerUrl}
                defaultBannerMobileUrl={defaultBannerMobileUrl}
              />
            )}
          </div>

          {/* Informações adicionais */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Bem-vindos à nossa Igreja
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Acompanhe nossos eventos e atividades. Clique nos banners para ver mais detalhes 
              e compartilhar com seus amigos e familiares.
            </p>
            
            {!events?.length && !isLoading && (
              <div className="mt-8 p-6 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  Nenhum evento programado no momento. Acompanhe nossas redes sociais 
                  para ficar por dentro das próximas atividades!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Sistema de Gestão Eclesiástica. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;