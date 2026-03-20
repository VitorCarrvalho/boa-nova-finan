
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MemberForm from '@/components/members/MemberForm';
import MemberTable from '@/components/members/MemberTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, UserCheck, UserX, Crown, Check, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemberStats } from '@/hooks/useMemberData';
import { usePendingMembers, useApproveMember, useRejectMember } from '@/hooks/usePendingMembers';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Member = Database['public']['Tables']['members']['Row'];

const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { data: stats, isLoading: statsLoading } = useMemberStats();
  const { data: pendingMembers, isLoading: pendingLoading } = usePendingMembers();
  const approveMember = useApproveMember();
  const rejectMember = useRejectMember();
  const { userAccessProfile } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleNewMember = () => {
    if (showForm) {
      setShowForm(false);
      setEditingMember(null);
    } else {
      setEditingMember(null);
      setShowForm(true);
    }
  };

  const canManageMembers = userAccessProfile === 'Admin' || userAccessProfile === 'Pastor';
  const pendingCount = pendingMembers?.length || 0;

  const copyRegistrationLink = () => {
    if (tenant?.slug) {
      const url = `${window.location.origin}/cadastro-membro/${tenant.slug}`;
      navigator.clipboard.writeText(url);
      toast({ title: 'Link copiado!', description: 'O link de cadastro foi copiado para a área de transferência.' });
    }
  };

  const statsCards = [
    { title: 'Total de Membros', value: stats?.totalMembers || 0, icon: Users, color: 'text-blue-600', description: 'Membros cadastrados' },
    { title: 'Membros Ativos', value: stats?.activeMembers || 0, icon: UserCheck, color: 'text-green-600', description: 'Membros ativos' },
    { title: 'Pastores', value: stats?.pastors || 0, icon: Crown, color: 'text-purple-600', description: 'Líderes pastorais' },
    { title: 'Membros Inativos', value: stats?.inactiveMembers || 0, icon: UserX, color: 'text-red-600', description: 'Membros inativos' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
            <p className="text-gray-600 mt-2">Gerencie os membros da igreja</p>
          </div>
          <div className="flex gap-2">
            {canManageMembers && tenant?.slug && (
              <Button variant="outline" onClick={copyRegistrationLink}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Copiar Link de Cadastro
              </Button>
            )}
            {canManageMembers && (
              <Button onClick={handleNewMember} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                {showForm ? 'Cancelar' : 'Novo Membro'}
              </Button>
            )}
          </div>
        </div>

        {statsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {showForm && canManageMembers && (
          <MemberForm member={editingMember} onSuccess={handleFormSuccess} />
        )}

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pendentes de Aprovação
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5 text-xs">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MemberTable onEditMember={handleEditMember} />
          </TabsContent>

          <TabsContent value="pending">
            {pendingLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              </div>
            ) : !pendingMembers?.length ? (
              <Card>
                <CardContent className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cadastro pendente de aprovação.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map(member => (
                  <Card key={member.id}>
                    <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          {member.email && <span>{member.email}</span>}
                          {member.phone && <span>{member.phone}</span>}
                          {member.cpf && <span>CPF: {member.cpf}</span>}
                        </div>
                        {member.ministries && member.ministries.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.ministries.map(m => (
                              <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Cadastrado em {new Date(member.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {canManageMembers && (
                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            onClick={() => approveMember.mutate(member.id)}
                            disabled={approveMember.isPending}
                          >
                            <Check className="mr-1 h-4 w-4" /> Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMember.mutate(member.id)}
                            disabled={rejectMember.isPending}
                          >
                            <X className="mr-1 h-4 w-4" /> Rejeitar
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Members;
