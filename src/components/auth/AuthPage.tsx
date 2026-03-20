import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import useSuperAdmin from '@/hooks/useSuperAdmin';
import logoIM from '@/assets/logoIM.png';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, resetPassword, user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const { branding } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();

  const buttonStyle = {
    backgroundColor: `hsl(${branding.primaryColor})`,
  };
  const buttonHoverClass = "hover:opacity-90";

  useEffect(() => {
    if (!authLoading && !superAdminLoading && user) {
      if (isSuperAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, superAdminLoading, isSuperAdmin, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha email e senha.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        let errorMessage = "Erro desconhecido";
        if (error.message.includes('Invalid login credentials')) errorMessage = "Email ou senha incorretos";
        else if (error.message.includes('Email not confirmed')) errorMessage = "Por favor, confirme seu email antes de fazer login";
        else errorMessage = error.message;
        toast({ title: "Erro no login", description: errorMessage, variant: "destructive" });
      } else {
        toast({ title: "Login realizado com sucesso!", description: "Bem-vindo ao sistema" });
      }
    } catch {
      toast({ title: "Erro no login", description: "Ocorreu um erro inesperado. Tente novamente.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Email obrigatório", description: "Por favor, insira seu email.", variant: "destructive" });
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        let errorMessage = "Erro desconhecido";
        if (error.message.includes('request this after')) errorMessage = "Aguarde 60 segundos antes de solicitar novamente";
        else if (error.message.includes('rate limit')) errorMessage = "Muitas tentativas. Aguarde alguns minutos";
        else errorMessage = error.message;
        toast({ title: "Erro ao enviar email", description: errorMessage, variant: "destructive" });
      } else {
        toast({ title: "Email enviado!", description: "Se o email existir, você receberá um link para redefinir sua senha." });
        setResetEmail('');
        const loginTab = document.querySelector('[value="signin"]') as HTMLElement;
        if (loginTab) loginTab.click();
      }
    } catch {
      toast({ title: "Erro ao enviar email", description: "Ocorreu um erro inesperado. Tente novamente.", variant: "destructive" });
    }
    setResetLoading(false);
  };

  const displayLogo = branding.logoUrl || logoIM;
  const displayName = branding.churchName || 'Igreja Moove';
  const displayTagline = branding.tagline || 'Sistema de Gestão da Igreja';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={displayLogo} 
            alt={displayName} 
            className="w-48 h-48 mx-auto mb-2 object-contain"
          />
          {branding.logoUrl && (
            <CardTitle className="text-xl">{displayName}</CardTitle>
          )}
          <CardDescription>{displayTagline}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="reset">Esqueci</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                </div>
                <Button type="submit" className={`w-full ${buttonHoverClass}`} style={buttonStyle} disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input id="reset-email" type="email" placeholder="Digite seu email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required disabled={resetLoading} />
                </div>
                <Button type="submit" className={`w-full ${buttonHoverClass}`} style={buttonStyle} disabled={resetLoading}>
                  {resetLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Você receberá um email com instruções para redefinir sua senha.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Sua igreja ainda não está na plataforma?{' '}
          <Link to="/onboarding" className="text-primary font-semibold hover:underline">
            Cadastre-se agora
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
