import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Church, User, CreditCard, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import logoIM from '@/assets/logoIM.png';

const BRAZILIAN_STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

const PLANS = [
  { id: 'free', name: 'Free', price: 'Grátis', description: 'Ideal para começar', features: ['Até 50 membros', 'Módulos básicos', 'Suporte por email'] },
  { id: 'basic', name: 'Basic', price: 'R$ 99/mês', description: 'Para igrejas em crescimento', features: ['Até 500 membros', 'Todos os módulos', 'Suporte prioritário'] },
  { id: 'pro', name: 'Pro', price: 'R$ 199/mês', description: 'Gestão completa', features: ['Membros ilimitados', 'Todos os módulos', 'Suporte dedicado', 'Relatórios avançados'] },
] as const;

type PlanType = 'free' | 'basic' | 'pro';

const generateSlug = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1
  const [churchName, setChurchName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [slug, setSlug] = useState('');

  // Step 2
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3
  const [planType, setPlanType] = useState<PlanType>('free');

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleChurchNameChange = (value: string) => {
    setChurchName(value);
    setSlug(generateSlug(value));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return churchName.trim() && city.trim() && state && slug.trim();
      case 2: return adminName.trim() && adminEmail.trim() && adminPassword.length >= 6 && adminPassword === confirmPassword;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('onboard-tenant', {
        body: { churchName, slug, city, state, adminName, adminEmail, adminPassword, planType },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro ao criar organização');

      toast({
        title: '🎉 Igreja criada com sucesso!',
        description: `${churchName} está pronta. Faça login com seu email e senha.`,
      });
      navigate('/auth');
    } catch (err: any) {
      toast({
        title: 'Erro ao criar organização',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [Church, User, CreditCard, CheckCircle];
  const stepLabels = ['Igreja', 'Admin', 'Plano', 'Resumo'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logoIM} alt="Igreja Moove" className="w-20 h-20 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">Cadastre sua Igreja</h1>
          <p className="text-muted-foreground mt-1">Em poucos minutos sua organização estará pronta</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {stepLabels.map((label, i) => {
            const Icon = stepIcons[i];
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : isDone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div className={`w-6 h-0.5 ${isDone ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            );
          })}
        </div>

        <Progress value={progress} className="mb-6 h-2" />

        <Card className="border-2">
          <CardHeader>
            <CardTitle>{
              step === 1 ? 'Dados da Igreja' :
              step === 2 ? 'Conta do Administrador' :
              step === 3 ? 'Escolha seu Plano' :
              'Resumo'
            }</CardTitle>
            <CardDescription>{
              step === 1 ? 'Informações básicas da sua igreja' :
              step === 2 ? 'Crie a conta do primeiro administrador' :
              step === 3 ? 'Todos os planos incluem 14 dias de teste gratuito' :
              'Revise os dados antes de finalizar'
            }</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da Igreja *</Label>
                  <Input placeholder="Ex: Igreja Comunidade Viva" value={churchName} onChange={e => handleChurchNameChange(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input placeholder="São Paulo" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={state} onChange={e => setState(e.target.value)}>
                      <option value="">Selecione</option>
                      {BRAZILIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Identificador (slug)</Label>
                  <Input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                  <p className="text-xs text-muted-foreground">Seu endereço: <strong>{slug || '...'}.igrejamoove.com.br</strong></p>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome completo *</Label>
                  <Input placeholder="Seu nome" value={adminName} onChange={e => setAdminName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="seu@email.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar senha *</Label>
                  <Input type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  {confirmPassword && adminPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">As senhas não coincidem</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {PLANS.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setPlanType(plan.id as PlanType)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      planType === plan.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-foreground">{plan.name}</div>
                    <div className="text-lg font-bold text-primary mt-1">{plan.price}</div>
                    <div className="text-xs text-muted-foreground mt-1">{plan.description}</div>
                    <ul className="mt-3 space-y-1">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4 - Summary */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Igreja</span>
                    <p className="font-medium">{churchName}</p>
                    <p className="text-sm text-muted-foreground">{city} - {state}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Endereço</span>
                    <p className="font-medium">{slug}.igrejamoove.com.br</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Administrador</span>
                    <p className="font-medium">{adminName}</p>
                    <p className="text-sm text-muted-foreground">{adminEmail}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Plano</span>
                    <p className="font-medium">{PLANS.find(p => p.id === planType)?.name} — {PLANS.find(p => p.id === planType)?.price}</p>
                    <p className="text-xs text-muted-foreground">14 dias de teste grátis</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => step === 1 ? navigate('/auth') : setStep(s => s - 1)} disabled={loading}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {step === 1 ? 'Voltar ao Login' : 'Anterior'}
              </Button>
              {step < totalSteps ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                  Próximo <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !canProceed()}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando...</> : '🚀 Criar Minha Igreja'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
