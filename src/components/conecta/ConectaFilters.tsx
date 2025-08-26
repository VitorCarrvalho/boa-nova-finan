import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useConectaCategories, useConectaCongregations } from '@/hooks/useConectaProviders';

interface ConectaFilters {
  category: string;
  city: string;
  state: string;
  congregation: string;
  experience: string;
  sortBy: string;
}

interface ConectaFiltersProps {
  filters: ConectaFilters;
  onFiltersChange: (filters: ConectaFilters) => void;
}

const ConectaFilters: React.FC<ConectaFiltersProps> = ({ filters, onFiltersChange }) => {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useConectaCategories();
  const { data: congregations, isLoading: congregationsLoading, error: congregationsError } = useConectaCongregations();

  const updateFilter = (key: keyof ConectaFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      city: '',
      state: '',
      congregation: '',
      experience: '',
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'relevance');

  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-700">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Categoria
          </label>
          {categoriesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : categoriesError ? (
            <div className="h-10 px-3 py-2 border rounded-md bg-red-50 border-red-200 text-red-600 text-sm">
              Erro ao carregar categorias
            </div>
          ) : (
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {(categories || []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Cidade
          </label>
          <Select
            value={filters.city}
            onValueChange={(value) => updateFilter('city', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as cidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as cidades</SelectItem>
              <SelectItem value="São Paulo">São Paulo</SelectItem>
              <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
              <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
              <SelectItem value="Brasília">Brasília</SelectItem>
              <SelectItem value="Salvador">Salvador</SelectItem>
              <SelectItem value="Fortaleza">Fortaleza</SelectItem>
              <SelectItem value="Recife">Recife</SelectItem>
              <SelectItem value="Porto Alegre">Porto Alegre</SelectItem>
              <SelectItem value="Curitiba">Curitiba</SelectItem>
              <SelectItem value="Goiânia">Goiânia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Congregation Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Congregação
          </label>
          {congregationsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : congregationsError ? (
            <div className="h-10 px-3 py-2 border rounded-md bg-red-50 border-red-200 text-red-600 text-sm">
              Erro ao carregar congregações
            </div>
          ) : (
            <Select
              value={filters.congregation}
              onValueChange={(value) => updateFilter('congregation', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as congregações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as congregações</SelectItem>
                {(congregations || []).map((congregation) => (
                  <SelectItem key={congregation.id} value={congregation.id}>
                    {congregation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Experience Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Experiência
          </label>
          <Select
            value={filters.experience}
            onValueChange={(value) => updateFilter('experience', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qualquer experiência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Qualquer experiência</SelectItem>
              <SelectItem value="0-1">0-1 anos</SelectItem>
              <SelectItem value="2-5">2-5 anos</SelectItem>
              <SelectItem value="6-10">6-10 anos</SelectItem>
              <SelectItem value="10">10+ anos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Ordenar por
          </label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="best_rated">Melhor avaliados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ConectaFilters;