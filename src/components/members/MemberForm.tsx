import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateMember, useUpdateMember } from '@/hooks/useMemberData';
import { useCongregations } from '@/hooks/useCongregationData';
import { Database } from '@/integrations/supabase/types';

type MemberRole = Database['public']['Enums']['member_role'];
type Member = Database['public']['Tables']['members']['Row'];

interface MemberFormProps {
  onSuccess: () => void;
  member?: Member | null;
}

const MemberForm: React.FC<MemberFormProps> = ({ onSuccess, member }) => {
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const { data: congregations, isLoading: congregationsLoading } = useCongregations();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: member?.name || '',
    rg: member?.rg || '',
    cpf: member?.cpf || '',
    date_of_baptism: member?.date_of_baptism || '',
    date_of_joining: member?.date_of_joining || '',
    role: (member?.role || 'member') as MemberRole,
    ministries: member?.ministries || [],
    phone: member?.phone || '',
    email: member?.email || '',
    address: member?.address || '',
    education: member?.education || '',
    instagram: member?.instagram || '',
    congregation_id: member?.congregation_id || '',
    is_active: member?.is_active !== false
  });

  const availableMinistries = [
    'Louvor e Adoração',
    'Ministério Infantil',
    'Juventude',
    'Mulheres',
    'Homens',
    'Evangelismo',
    'Intercessão',
    'Mídia',
    'Recepção',
    'Limpeza',
    'Segurança'
  ];

  const memberRoleDisplayNames = {
    'member': 'Membro',
    'worker': 'Obreiro',
    'pastor': 'Pastor'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.congregation_id) {
      alert('Por favor, selecione uma congregação.');
      return;
    }
    
    setLoading(true);

    try {
      const memberData = {
        ...formData,
        date_of_baptism: formData.date_of_baptism || null,
        date_of_joining: formData.date_of_joining || null,
        rg: formData.rg || null,
        cpf: formData.cpf || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        education: formData.education || null,
        instagram: formData.instagram || null,
      };

      if (member) {
        await updateMember.mutateAsync({ id: member.id, ...memberData });
      } else {
        await createMember.mutateAsync(memberData);
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMinistryChange = (ministry: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      ministries: checked
        ? [...prev.ministries, ministry]
        : prev.ministries.filter(m => m !== ministry)
    }));
  };

  if (congregationsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando congregações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{member ? 'Editar Membro' : 'Novo Membro'}</CardTitle>
        <CardDescription>
          {member ? 'Atualize os dados do membro' : 'Cadastre um novo membro da igreja'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="congregation_id">Congregação *</Label>
              <Select 
                value={formData.congregation_id} 
                onValueChange={(value) => setFormData({ ...formData, congregation_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a congregação" />
                </SelectTrigger>
                <SelectContent>
                  {congregations?.map((congregation) => (
                    <SelectItem key={congregation.id} value={congregation.id}>
                      {congregation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função *</Label>
              <Select value={formData.role} onValueChange={(value) => 
                setFormData({ ...formData, role: value as MemberRole })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(memberRoleDisplayNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_baptism">Data do Batismo</Label>
              <Input
                id="date_of_baptism"
                type="date"
                value={formData.date_of_baptism}
                onChange={(e) => setFormData({ ...formData, date_of_baptism: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_joining">Data de Ingresso</Label>
              <Input
                id="date_of_joining"
                type="date"
                value={formData.date_of_joining}
                onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Escolaridade</Label>
              <Select value={formData.education || ''} onValueChange={(value) => 
                setFormData({ ...formData, education: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a escolaridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fundamental_incompleto">Fundamental Incompleto</SelectItem>
                  <SelectItem value="fundamental_completo">Fundamental Completo</SelectItem>
                  <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                  <SelectItem value="medio_completo">Médio Completo</SelectItem>
                  <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                  <SelectItem value="superior_completo">Superior Completo</SelectItem>
                  <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Endereço completo"
            />
          </div>

          <div className="space-y-3">
            <Label>Ministérios</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableMinistries.map((ministry) => (
                <div key={ministry} className="flex items-center space-x-2">
                  <Checkbox
                    id={ministry}
                    checked={formData.ministries.includes(ministry)}
                    onCheckedChange={(checked) => handleMinistryChange(ministry, !!checked)}
                  />
                  <Label htmlFor={ministry} className="text-sm">
                    {ministry}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
            />
            <Label htmlFor="is_active">Membro ativo</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Salvando...' : member ? 'Atualizar Membro' : 'Cadastrar Membro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MemberForm;
