
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import MemberForm from '@/components/members/MemberForm';
import MemberTable from '@/components/members/MemberTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCheck, UserX, Crown } from 'lucide-react';
import { useMemberStats } from '@/hooks/useMemberData';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/integrations/supabase/types';

type Member = Database['public']['Tables']['members']['Row'];

const Members = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { data: stats, isLoading: statsLoading } = useMemberStats();
  const { userAccessProfile } = useAuth();

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleNewMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const canManageMembers = userAccessProfile === 'Admin' || userAccessProfile === 'Pastor';

  const statsCards = [
    {
      title: 'Total de Membros',
      value: stats?.totalMembers || 0,
      icon: Users,
      color: 'text-blue-600',
      description: 'Membros cadastrados'
    },
    {
      title: 'Membros Ativos',
      value: stats?.activeMembers || 0,
      icon: UserCheck,
      color: 'text-green-600',
      description: 'Membros ativos'
    },
    {
      title: 'Pastores',
      value: stats?.pastors || 0,
      icon: Crown,
      color: 'text-purple-600',
      description: 'Líderes pastorais'
    },
    {
      title: 'Membros Inativos',
      value: stats?.inactiveMembers || 0,
      icon: UserX,
      color: 'text-red-600',
      description: 'Membros inativos'
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
            <p className="text-gray-600 mt-2">
              Gerencie os membros da igreja
            </p>
          </div>
          {canManageMembers && (
            <Button
              onClick={handleNewMember}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {showForm ? 'Cancelar' : 'Novo Membro'}
            </Button>
          )}
        </div>

        {statsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando estatísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {showForm && canManageMembers && (
          <MemberForm 
            onSuccess={handleFormSuccess} 
            member={editingMember}
          />
        )}

        <MemberTable onEditMember={handleEditMember} />
      </div>
    </Layout>
  );
};

export default Members;
