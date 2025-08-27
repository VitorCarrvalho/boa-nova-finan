import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Briefcase, Heart } from 'lucide-react';
import WidgetContainer from './WidgetContainer';

const ConectaWidget = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/conecta');
  };

  return (
    <WidgetContainer 
      variant="glass" 
      className="p-6 min-h-[200px] cursor-pointer group hover:scale-105 transition-all duration-300"
      onClick={handleClick}
    >
      <div className="relative h-full">
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="widget-title text-slate-700 text-xl font-bold">
                  Conecta IPTM
                </h3>
                <p className="text-sm text-slate-600">
                  Rede de Serviços da Comunidade
                </p>
              </div>
            </div>
            
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
          </div>

          {/* Features */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Encontre prestadores de serviços</span>
            </div>
            
            <div className="flex items-center gap-3 text-slate-600">
              <Heart className="w-4 h-4 text-purple-500" />
              <span className="text-sm">Conecte-se com a comunidade</span>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-4 pt-4 border-t border-slate-200/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Explorar serviços
              </span>
              <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform duration-300" />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-slate-200/30 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-slate-300/40 rounded-full blur-lg" />
      </div>
    </WidgetContainer>
  );
};

export default ConectaWidget;