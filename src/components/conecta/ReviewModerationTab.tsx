import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Star, Calendar, Mail } from 'lucide-react';
import RatingComponent from './RatingComponent';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewer_email?: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  provider_id: string;
  service_providers: {
    name: string;
    service_categories: {
      name: string;
    };
  };
}

const ReviewModerationTab = () => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews-moderation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_reviews')
        .select(`
          *,
          service_providers(
            name,
            service_categories(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    }
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('service_reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews-moderation'] });
      toast({
        title: "Avaliação aprovada",
        description: "A avaliação foi aprovada com sucesso!",
      });
      setSelectedReview(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao aprovar avaliação: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Reject review mutation
  const rejectMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('service_reviews')
        .update({ status: 'rejected' })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews-moderation'] });
      toast({
        title: "Avaliação rejeitada",
        description: "A avaliação foi rejeitada com sucesso!",
      });
      setSelectedReview(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar avaliação: " + error.message,
        variant: "destructive",
      });
    }
  });

  const pendingReviews = reviews?.filter(r => r.status === 'pending') || [];
  const approvedReviews = reviews?.filter(r => r.status === 'approved') || [];
  const rejectedReviews = reviews?.filter(r => r.status === 'rejected') || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card key={review.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {review.service_providers.name}
            </CardTitle>
            <Badge variant="outline" className="mt-1">
              {review.service_providers.service_categories.name}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <RatingComponent rating={review.rating} onRatingChange={() => {}} readonly />
            <Badge 
              variant={
                review.status === 'pending' ? 'secondary' :
                review.status === 'approved' ? 'default' : 'destructive'
              }
            >
              {review.status === 'pending' ? 'Pendente' :
               review.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {review.comment && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Comentário:</p>
            <p className="text-sm">{review.comment}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(review.created_at)}
            </div>
            {review.reviewer_email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {review.reviewer_email}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedReview(review)}
            >
              Ver Detalhes
            </Button>
            {review.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => approveMutation.mutate(review.id)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => rejectMutation.mutate(review.id)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Moderação de Avaliações</h3>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>Pendentes: {pendingReviews.length}</span>
          <span>•</span>
          <span>Aprovadas: {approvedReviews.length}</span>
          <span>•</span>
          <span>Rejeitadas: {rejectedReviews.length}</span>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendentes ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovadas ({approvedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejeitadas ({rejectedReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma avaliação pendente no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map(review => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {approvedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhuma avaliação aprovada ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            approvedReviews.map(review => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  Nenhuma avaliação rejeitada ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            rejectedReviews.map(review => <ReviewCard key={review.id} review={review} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Review Details Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes da Avaliação</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Prestador</p>
                    <p>{selectedReview.service_providers.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Categoria</p>
                    <p>{selectedReview.service_providers.service_categories.name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Avaliação</p>
                  <RatingComponent rating={selectedReview.rating} onRatingChange={() => {}} readonly />
                </div>

                {selectedReview.comment && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Comentário</p>
                    <p className="text-sm bg-muted p-3 rounded-md">{selectedReview.comment}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Data</p>
                    <p>{formatDate(selectedReview.created_at)}</p>
                  </div>
                  {selectedReview.reviewer_email && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email do Avaliador</p>
                      <p>{selectedReview.reviewer_email}</p>
                    </div>
                  )}
                </div>

                {selectedReview.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => approveMutation.mutate(selectedReview.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(selectedReview.id)}
                      disabled={rejectMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewModerationTab;