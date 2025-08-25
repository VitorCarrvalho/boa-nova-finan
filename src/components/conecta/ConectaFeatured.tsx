import React from 'react';
import { Star, Trophy } from 'lucide-react';
import ConectaProviderCard from './ConectaProviderCard';

const ConectaFeatured: React.FC = () => {
  // For now, we'll show an empty featured section since we don't have ratings yet
  // This will be populated when we have actual rating data
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-slate-800">Prestadores em Destaque</h2>
        <Star className="h-5 w-5 text-yellow-400 fill-current" />
      </div>
      
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-8 text-center border border-yellow-200">
        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          Destaques em Breve
        </h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Os prestadores melhor avaliados pela comunidade aparecerão aqui. 
          Seja um dos primeiros a avaliar nossos profissionais!
        </p>
      </div>
    </div>
  );
};

export default ConectaFeatured;