import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import ConectaProviderCard from '@/components/conecta/ConectaProviderCard';
import ConectaFilters from '@/components/conecta/ConectaFilters';
import ConectaSubmitForm from '@/components/conecta/ConectaSubmitForm';
import ConectaFeatured from '@/components/conecta/ConectaFeatured';
import { useConectaProviders } from '@/hooks/useConectaProviders';

const ConectaIPTM = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('categoria') || '',
    city: searchParams.get('cidade') || '',
    state: searchParams.get('estado') || '',
    congregation: searchParams.get('congregacao') || '',
    experience: searchParams.get('experiencia') || '',
    sortBy: searchParams.get('ordenar') || 'relevance'
  });

  const { data: providers, isLoading, error } = useConectaProviders({
    search: searchTerm,
    filters,
    page: 1,
    limit: 15
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (filters.category) params.set('categoria', filters.category);
    if (filters.city) params.set('cidade', filters.city);
    if (filters.state) params.set('estado', filters.state);
    if (filters.congregation) params.set('congregacao', filters.congregation);
    if (filters.experience) params.set('experiencia', filters.experience);
    if (filters.sortBy !== 'relevance') params.set('ordenar', filters.sortBy);
    
    navigate(`/conecta?${params.toString()}`, { replace: true });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Conecta IPTM - Rede de Serviços da Comunidade</title>
        <meta name="description" content="Encontre prestadores de serviços da comunidade IPTM Global. Conecte-se com profissionais qualificados da nossa igreja." />
        <meta property="og:title" content="Conecta IPTM - Rede de Serviços da Comunidade" />
        <meta property="og:description" content="Encontre prestadores de serviços da comunidade IPTM Global. Conecte-se com profissionais qualificados da nossa igreja." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jryifbcsifodvocshvuo.supabase.co/conecta" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToHome}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Voltar</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Conecta IPTM</h1>
                  <p className="text-sm text-slate-600">Rede de Serviços da Comunidade</p>
                </div>
              </div>
              
              <Button 
                onClick={() => setShowSubmitForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Cadastrar Serviço</span>
                <span className="sm:hidden">Cadastrar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
                <Button type="submit">Buscar</Button>
              </div>
              
              {showFilters && (
                <ConectaFilters 
                  filters={filters} 
                  onFiltersChange={setFilters}
                />
              )}
            </form>
          </div>

          {/* Featured Providers */}
          <ConectaFeatured />

          {/* Results */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-slate-600 mt-4">Carregando prestadores...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Erro ao carregar prestadores. Tente novamente.</p>
              </div>
            ) : !providers?.data?.length ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Nenhum prestador encontrado com os filtros aplicados.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      category: '',
                      city: '',
                      state: '',
                      congregation: '',
                      experience: '',
                      sortBy: 'relevance'
                    });
                  }}
                  className="mt-4"
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Prestadores Encontrados ({providers.count})
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {providers.data.map((provider) => (
                    <ConectaProviderCard 
                      key={provider.id} 
                      provider={provider}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {providers.hasMore && (
                  <div className="text-center py-6">
                    <Button variant="outline" className="px-8">
                      Carregar Mais
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <ConectaSubmitForm 
          isOpen={showSubmitForm}
          onClose={() => setShowSubmitForm(false)}
        />
      )}
    </>
  );
};

export default ConectaIPTM;