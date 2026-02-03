import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Instagram, 
  Linkedin, 
  Globe,
  MessageSquare,
  RotateCcw,
  Pause
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import ReviewModerationTab from '@/components/conecta/ReviewModerationTab';

interface ServiceProvider {
  id: string;
  name: string;
  description: string;
  experience_years: number;
  photo_url: string;
  email: string;
  whatsapp: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
  city: string;
  state: string;
  congregation_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  created_at: string;
  category_id: string;
  congregation_id?: string;
  rejection_reason?: string;
  service_categories: {
    name: string;
  };
}

const ConectaManagement = () => {
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all providers
  const { data: allProviders, isLoading } = useQuery({
    queryKey: ['all-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          service_categories(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ServiceProvider[];
    }
  });

  // Approve provider mutation
  const approveMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .update({ status: 'approved' })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      toast({
        title: "Prestador aprovado",
        description: "O prestador foi aprovado com sucesso!",
      });
      setSelectedProvider(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao aprovar prestador: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Reject provider mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: string; reason: string }) => {
      const { error } = await supabase
        .from('service_providers')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      toast({
        title: "Prestador rejeitado",
        description: "O prestador foi rejeitado com sucesso!",
      });
      setSelectedProvider(null);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar prestador: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Deactivate provider mutation
  const deactivateMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .update({ status: 'inactive' })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      toast({
        title: "Prestador desativado",
        description: "O prestador foi desativado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao desativar prestador: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Reactivate provider mutation
  const reactivateMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('service_providers')
        .update({ status: 'approved' })
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-providers'] });
      toast({
        title: "Prestador reativado",
        description: "O prestador foi reativado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao reativar prestador: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleApprove = (providerId: string) => {
    approveMutation.mutate(providerId);
  };

  const handleReject = () => {
    if (!selectedProvider || !rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe um motivo para a rejeição.",
        variant: "destructive",
      });
      return;
    }

    rejectMutation.mutate({
      providerId: selectedProvider.id,
      reason: rejectionReason.trim()
    });
  };

  const openRejectDialog = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsRejectDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone: string) => {
    // Remove non-digits and format as WhatsApp link
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanPhone}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Gestão Conecta IPTM - Igreja Moove</title>
        <meta name="description" content="Gerencie cadastros de prestadores de serviço pendentes de aprovação" />
      </Helmet>

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Gestão Conecta IPTM
          </h1>
          <p className="text-muted-foreground">
            Gerencie os cadastros de prestadores de serviço e avaliações
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pendentes ({allProviders?.filter(p => p.status === 'pending').length || 0})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Aprovados ({allProviders?.filter(p => p.status === 'approved').length || 0})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              Inativos ({allProviders?.filter(p => p.status === 'inactive').length || 0})
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Avaliações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <ProvidersTab 
              providers={allProviders?.filter(p => p.status === 'pending') || []}
              status="pending"
              onApprove={handleApprove}
              onReject={openRejectDialog}
              onDeactivate={() => {}}
              onReactivate={() => {}}
              setSelectedProvider={setSelectedProvider}
              isLoading={isLoading}
              approveMutation={approveMutation}
              rejectMutation={rejectMutation}
              deactivateMutation={deactivateMutation}
              reactivateMutation={reactivateMutation}
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <ProvidersTab 
              providers={allProviders?.filter(p => p.status === 'approved') || []}
              status="approved"
              onApprove={() => {}}
              onReject={() => {}}
              onDeactivate={(id: string) => deactivateMutation.mutate(id)}
              onReactivate={() => {}}
              setSelectedProvider={setSelectedProvider}
              isLoading={isLoading}
              approveMutation={approveMutation}
              rejectMutation={rejectMutation}
              deactivateMutation={deactivateMutation}
              reactivateMutation={reactivateMutation}
            />
          </TabsContent>

          <TabsContent value="inactive" className="mt-6">
            <ProvidersTab 
              providers={allProviders?.filter(p => p.status === 'inactive') || []}
              status="inactive"
              onApprove={() => {}}
              onReject={() => {}}
              onDeactivate={() => {}}
              onReactivate={(id: string) => reactivateMutation.mutate(id)}
              setSelectedProvider={setSelectedProvider}
              isLoading={isLoading}
              approveMutation={approveMutation}
              rejectMutation={rejectMutation}
              deactivateMutation={deactivateMutation}
              reactivateMutation={reactivateMutation}
            />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewModerationTab />
          </TabsContent>
        </Tabs>
        {/* Provider Details Dialog */}
        <Dialog open={!!selectedProvider && !isRejectDialogOpen} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedProvider && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={selectedProvider.photo_url} alt={selectedProvider.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {getInitials(selectedProvider.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <DialogTitle className="text-2xl mb-2">
                        {selectedProvider.name}
                      </DialogTitle>
                      <Badge variant="outline" className="mb-2">
                        {selectedProvider.service_categories.name}
                      </Badge>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedProvider.city}, {selectedProvider.state}
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Descrição dos Serviços</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedProvider.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Informações de Contato</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <a href={`mailto:${selectedProvider.email}`} className="text-primary hover:underline">
                          {selectedProvider.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-600" />
                        <a 
                          href={formatPhone(selectedProvider.whatsapp)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline"
                        >
                          {selectedProvider.whatsapp}
                        </a>
                      </div>
                      {selectedProvider.instagram && (
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-600" />
                          <a 
                            href={selectedProvider.instagram.startsWith('http') ? selectedProvider.instagram : `https://instagram.com/${selectedProvider.instagram}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline"
                          >
                            Instagram
                          </a>
                        </div>
                      )}
                      {selectedProvider.linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          <a 
                            href={selectedProvider.linkedin.startsWith('http') ? selectedProvider.linkedin : `https://linkedin.com/in/${selectedProvider.linkedin}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedProvider.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          <a 
                            href={selectedProvider.website.startsWith('http') ? selectedProvider.website : `https://${selectedProvider.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Experiência</h3>
                      <p className="text-muted-foreground">
                        {selectedProvider.experience_years} anos
                      </p>
                    </div>
                    {selectedProvider.congregation_name && (
                      <div>
                        <h3 className="font-semibold mb-2">Congregação</h3>
                        <p className="text-muted-foreground">
                          {selectedProvider.congregation_name}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(selectedProvider.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(selectedProvider)}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeitar Cadastro</DialogTitle>
              <DialogDescription>
                Informe o motivo da rejeição do cadastro de {selectedProvider?.name}.
                Esta informação será importante para o prestador entender o que precisa ser corrigido.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  Motivo da rejeição *
                </label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Ex: Informações incompletas, categoria inadequada, documentação faltante..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectionReason.trim()}
                  className="flex-1"
                >
                  {rejectMutation.isPending ? 'Rejeitando...' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

// ProvidersTab component
interface ProvidersTabProps {
  providers: ServiceProvider[];
  status: 'pending' | 'approved' | 'inactive';
  onApprove: (id: string) => void;
  onReject: (provider: ServiceProvider) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
  setSelectedProvider: (provider: ServiceProvider) => void;
  isLoading: boolean;
  approveMutation: any;
  rejectMutation: any;
  deactivateMutation: any;
  reactivateMutation: any;
}

const ProvidersTab = ({ 
  providers, 
  status, 
  onApprove, 
  onReject, 
  onDeactivate, 
  onReactivate,
  setSelectedProvider,
  isLoading,
  approveMutation,
  rejectMutation,
  deactivateMutation,
  reactivateMutation
}: ProvidersTabProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (providerStatus: string) => {
    switch(providerStatus) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'approved':
        return <Badge variant="default">Aprovado</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inativo</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{providerStatus}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    const emptyMessage = {
      pending: "Nenhum cadastro pendente no momento.",
      approved: "Nenhum prestador aprovado ainda.",
      inactive: "Nenhum prestador inativo."
    };

    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {status === 'pending' ? 'Tudo em dia!' : 'Nenhum item encontrado'}
            </h3>
            <p className="text-muted-foreground">
              {emptyMessage[status]}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <Card key={provider.id} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={provider.photo_url} alt={provider.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(provider.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight mb-1">
                  {provider.name}
                </CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    {provider.service_categories.name}
                  </Badge>
                  {getStatusBadge(provider.status)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {provider.city}, {provider.state}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {provider.description}
            </p>

            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-primary" />
              <span>{provider.experience_years} anos de experiência</span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedProvider(provider)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Detalhes
              </Button>
            </div>

            <div className="flex gap-2">
              {status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onApprove(provider.id)}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReject(provider)}
                    disabled={rejectMutation.isPending}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </>
              )}
              
              {status === 'approved' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeactivate(provider.id)}
                  disabled={deactivateMutation.isPending}
                  className="flex-1"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Desativar
                </Button>
              )}
              
              {status === 'inactive' && (
                <Button
                  size="sm"
                  onClick={() => onReactivate(provider.id)}
                  disabled={reactivateMutation.isPending}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reativar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConectaManagement;