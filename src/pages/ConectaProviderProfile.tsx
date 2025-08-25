import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar,
  Eye,
  EyeOff,
  MessageCircle,
  Instagram,
  Linkedin,
  Globe,
  Mail,
  Phone,
  Flag,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ConectaProviderProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [contactRevealed, setContactRevealed] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Fetch provider data
  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['conecta-provider', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug not provided');
      
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          category:service_categories(name),
          congregation:congregations(name)
        `)
        .eq('slug', slug)
        .eq('status', 'approved')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  // Fetch reviews for this provider
  const { data: reviews } = useQuery({
    queryKey: ['provider-reviews', provider?.id],
    queryFn: async () => {
      if (!provider?.id) return [];
      
      const { data, error } = await supabase
        .from('service_reviews')
        .select('*')
        .eq('provider_id', provider.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!provider?.id
  });

  const handleRevealContact = async () => {
    if (!provider || contactRevealed) return;

    try {
      // Log contact reveal click
      await supabase
        .from('service_contact_clicks')
        .insert({
          provider_id: provider.id,
          channel: 'reveal_contact'
        });

      setContactRevealed(true);
    } catch (error) {
      console.error('Error logging contact click:', error);
      setContactRevealed(true); // Still reveal on error
    }
  };

  const handleContactClick = async (channel: string, url?: string) => {
    if (!provider) return;

    try {
      // Log the contact click
      await supabase
        .from('service_contact_clicks')
        .insert({
          provider_id: provider.id,
          channel: channel as any
        });

      // Open link if provided
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error logging contact click:', error);
      // Still open link on error
      if (url) {
        window.open(url, '_blank');
      }
    }
  };

  const handleWhatsAppClick = () => {
    if (!provider) return;
    
    const phoneNumber = provider.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá! Vi seu perfil no Conecta IPTM e gostaria de saber mais sobre seus serviços.`);
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${message}`;
    
    handleContactClick('whatsapp', whatsappUrl);
  };

  const handleSubmitReport = async () => {
    if (!provider || !reportReason.trim()) return;

    try {
      setIsSubmittingReport(true);
      
      await supabase
        .from('service_reports')
        .insert({
          provider_id: provider.id,
          reason: reportReason,
          reporter_email: reporterEmail || null
        });

      toast({
        title: "Denúncia Enviada",
        description: "Sua denúncia foi enviada e será analisada pela nossa equipe.",
      });

      setShowReportDialog(false);
      setReportReason('');
      setReporterEmail('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua denúncia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: provider?.name,
          text: provider?.description,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copiado",
          description: "O link do perfil foi copiado para a área de transferência.",
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copiado",
        description: "O link do perfil foi copiado para a área de transferência.",
      });
    }
  };

  const formatExperience = (years: number) => {
    if (years === 1) return '1 ano';
    if (years < 1) return 'Menos de 1 ano';
    return `${years} anos`;
  };

  const obfuscateContact = (contact: string, type: 'phone' | 'email') => {
    if (type === 'phone') {
      return contact.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-••••');
    } else {
      const [local, domain] = contact.split('@');
      return `${local.substring(0, 2)}••••@${domain}`;
    }
  };

  const getCongregationName = () => {
    return provider?.congregation?.name || provider?.congregation_name;
  };

  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return null;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Prestador não encontrado
            </h2>
            <p className="text-slate-600 mb-4">
              O prestador que você está procurando não foi encontrado ou não está mais disponível.
            </p>
            <Button onClick={() => navigate('/conecta')}>
              Voltar para Conecta IPTM
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <>
      <Helmet>
        <title>{provider.name} - Conecta IPTM</title>
        <meta name="description" content={provider.description.substring(0, 160)} />
        <meta property="og:title" content={`${provider.name} - Conecta IPTM`} />
        <meta property="og:description" content={provider.description.substring(0, 160)} />
        <meta property="og:image" content={provider.photo_url} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/conecta')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowReportDialog(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Main Profile Card */}
            <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="md:flex">
                  {/* Photo */}
                  <div className="md:w-80 h-64 md:h-auto">
                    <img
                      src={provider.photo_url}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                          {provider.name}
                        </h1>
                        <div className="flex items-center gap-4 text-slate-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{provider.city}, {provider.state}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatExperience(provider.experience_years)} de experiência</span>
                          </div>
                        </div>
                        
                        {/* Rating */}
                        {averageRating && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{averageRating}</span>
                            </div>
                            <span className="text-sm text-slate-500">
                              ({reviews?.length} {reviews?.length === 1 ? 'avaliação' : 'avaliações'})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Category Badge */}
                      {provider.category && (
                        <Badge variant="secondary" className="text-sm">
                          {provider.category.name}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-slate-700 mb-2">Sobre</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {provider.description}
                      </p>
                    </div>

                    {/* Congregation */}
                    {getCongregationName() && (
                      <div>
                        <h3 className="font-semibold text-slate-700 mb-2">Igreja</h3>
                        <p className="text-slate-600">{getCongregationName()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact and Social Media */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Contato
                  </h3>
                  
                  <div className="space-y-4">
                    {!contactRevealed ? (
                      <div className="text-center py-6">
                        <div className="mb-4">
                          <EyeOff className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600 mb-2">
                            Clique para revelar os dados de contato
                          </p>
                          <div className="space-y-1 text-sm text-slate-500">
                            <p>WhatsApp: {obfuscateContact(provider.whatsapp, 'phone')}</p>
                            <p>Email: {obfuscateContact(provider.email, 'email')}</p>
                          </div>
                        </div>
                        <Button onClick={handleRevealContact} className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Contato
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button
                          onClick={handleWhatsAppClick}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp: {provider.whatsapp}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => handleContactClick('email', `mailto:${provider.email}`)}
                          className="w-full"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {provider.email}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-700 mb-4">Redes Sociais</h3>
                  
                  <div className="space-y-3">
                    {provider.instagram && (
                      <Button
                        variant="outline"
                        onClick={() => handleContactClick('instagram', `https://instagram.com/${provider.instagram.replace('@', '')}`)}
                        className="w-full justify-start"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        {provider.instagram}
                      </Button>
                    )}
                    
                    {provider.linkedin && (
                      <Button
                        variant="outline"
                        onClick={() => handleContactClick('linkedin', provider.linkedin)}
                        className="w-full justify-start"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    
                    {provider.website && (
                      <Button
                        variant="outline"
                        onClick={() => handleContactClick('website', provider.website)}
                        className="w-full justify-start"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Site
                      </Button>
                    )}
                    
                    {!provider.instagram && !provider.linkedin && !provider.website && (
                      <p className="text-slate-500 text-center py-4">
                        Nenhuma rede social cadastrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews Section */}
            {reviews && reviews.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Avaliações ({reviews.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-slate-200 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-500">
                            {new Date(review.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-slate-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar Perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo da denúncia *</Label>
              <Textarea
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Descreva o motivo da denúncia..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Seu email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitReport} 
              disabled={!reportReason.trim() || isSubmittingReport}
              variant="destructive"
            >
              {isSubmittingReport ? 'Enviando...' : 'Enviar Denúncia'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConectaProviderProfile;