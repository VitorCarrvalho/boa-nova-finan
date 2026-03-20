import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Church, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const availableMinistries = [
  'Louvor e Adoração', 'Ministério Infantil', 'Juventude', 'Mulheres',
  'Homens', 'Evangelismo', 'Intercessão', 'Mídia', 'Recepção', 'Limpeza', 'Segurança'
];

const MemberRegistration = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState('');
  const [congregations, setCongregations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    name: '', cpf: '', rg: '', email: '', phone: '',
    address: '', education: '', instagram: '',
    congregation_id: '', ministries: [] as string[],
    date_of_baptism: '', date_of_joining: '',
  });

  useEffect(() => {
    const loadTenant = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !tenant) { setNotFound(true); setLoading(false); return; }

      setTenantId(tenant.id);
      setTenantName(tenant.name);

      const { data: congs } = await supabase
        .from('congregations')
        .select('id, name')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('name');

      setCongregations(congs || []);
      setLoading(false);
    };
    loadTenant();
  }, [slug]);

  const handleMinistryToggle = (ministry: string) => {
    setFormData(prev => ({
      ...prev,
      ministries: prev.ministries.includes(ministry)
        ? prev.ministries.filter(m => m !== ministry)
        : [...prev.ministries, ministry]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !formData.name.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('members').insert({
        name: formData.name.trim(),
        cpf: formData.cpf || null,
        rg: formData.rg || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        education: formData.education || null,
        instagram: formData.instagram || null,
        congregation_id: formData.congregation_id || null,
        ministries: formData.ministries.length > 0 ? formData.ministries : null,
        date_of_baptism: formData.date_of_baptism || null,
        date_of_joining: formData.date_of_joining || null,
        tenant_id: tenantId,
        is_active: false,
        approval_status: 'pending',
        role: 'member' as const,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: 'Erro ao enviar cadastro', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Organização não encontrada</CardTitle>
            <CardDescription>O link de cadastro é inválido ou a organização não está ativa.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">Cadastro Recebido!</CardTitle>
            <CardDescription className="text-base mt-2">
              Seu cadastro foi enviado com sucesso e está em análise.
              A administração da {tenantName} avaliará suas informações em breve.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Church className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{tenantName}</h1>
          <p className="text-muted-foreground mt-1">Formulário de Cadastro de Membro</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Preencha suas informações para se cadastrar como membro</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required maxLength={200} />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={formData.cpf} onChange={e => setFormData(p => ({ ...p, cpf: e.target.value }))} maxLength={14} />
                </div>
                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input id="rg" value={formData.rg} onChange={e => setFormData(p => ({ ...p, rg: e.target.value }))} maxLength={20} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} maxLength={20} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} maxLength={300} />
                </div>
                <div>
                  <Label htmlFor="education">Escolaridade</Label>
                  <Select value={formData.education} onValueChange={v => setFormData(p => ({ ...p, education: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" value={formData.instagram} onChange={e => setFormData(p => ({ ...p, instagram: e.target.value }))} placeholder="@usuario" maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="date_of_baptism">Data de Batismo</Label>
                  <Input id="date_of_baptism" type="date" value={formData.date_of_baptism} onChange={e => setFormData(p => ({ ...p, date_of_baptism: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="date_of_joining">Data de Ingresso</Label>
                  <Input id="date_of_joining" type="date" value={formData.date_of_joining} onChange={e => setFormData(p => ({ ...p, date_of_joining: e.target.value }))} />
                </div>

                {congregations.length > 0 && (
                  <div className="md:col-span-2">
                    <Label>Congregação</Label>
                    <Select value={formData.congregation_id} onValueChange={v => setFormData(p => ({ ...p, congregation_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione uma congregação" /></SelectTrigger>
                      <SelectContent>
                        {congregations.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Ministérios de Interesse</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableMinistries.map(ministry => (
                    <div key={ministry} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ministry-${ministry}`}
                        checked={formData.ministries.includes(ministry)}
                        onCheckedChange={() => handleMinistryToggle(ministry)}
                      />
                      <label htmlFor={`ministry-${ministry}`} className="text-sm cursor-pointer">{ministry}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting || !formData.name.trim()}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : 'Enviar Cadastro'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Após o envio, seu cadastro será analisado pela administração da igreja.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberRegistration;
