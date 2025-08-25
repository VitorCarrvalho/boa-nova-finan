import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ServiceProvider {
  id: string;
  slug: string;
  name: string;
  description: string;
  experience_years: number;
  category?: {
    name: string;
  };
  city: string;
  state: string;
  congregation_name?: string;
  congregation?: {
    name: string;
  };
  photo_url: string;
  rating_average?: number;
  rating_count?: number;
}

interface ConectaProviderCardProps {
  provider: ServiceProvider;
}

const ConectaProviderCard: React.FC<ConectaProviderCardProps> = ({ provider }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/conecta/perfil/${provider.slug}`);
  };

  const getCongregationName = () => {
    return provider.congregation?.name || provider.congregation_name;
  };

  const formatExperience = (years: number) => {
    if (years === 1) return '1 ano';
    if (years < 1) return 'Menos de 1 ano';
    return `${years} anos`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white/80 backdrop-blur-sm border-0 shadow-md">
      <CardContent className="p-0">
        <div onClick={handleViewProfile}>
          {/* Photo */}
          <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            <img
              src={provider.photo_url}
              alt={provider.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Category Badge */}
            {provider.category && (
              <Badge 
                variant="secondary" 
                className="absolute top-3 left-3 bg-white/90 text-slate-700 font-medium"
              >
                {provider.category.name}
              </Badge>
            )}

            {/* Rating */}
            {provider.rating_average && (
              <div className="absolute top-3 right-3 bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-slate-700">
                  {provider.rating_average.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Name and Location */}
            <div>
              <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                {provider.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{provider.city}, {provider.state}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 line-clamp-2">
              {provider.description}
            </p>

            {/* Congregation */}
            {getCongregationName() && (
              <div className="text-xs text-slate-500 bg-slate-50 rounded-full px-2 py-1 text-center">
                {getCongregationName()}
              </div>
            )}

            {/* Experience and Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                <span>{formatExperience(provider.experience_years)} de experiência</span>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs px-3 hover:bg-primary hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProfile();
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver Perfil
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConectaProviderCard;