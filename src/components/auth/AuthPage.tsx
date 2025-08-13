import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCongregations } from '@/hooks/useCongregationData';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [congregation, setCongregation] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { data: congregations } = useCongregations();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('Usuário autenticado, redirecionando...');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Tentando fazer login...');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.log('Erro no login:', error);
        let errorMessage = "Erro desconhecido";
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Por favor, confirme seu email antes de fazer login";
        } else {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        console.log('Login bem-sucedido, redirecionando imediatamente...');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema",
        });
        
        // Redirecionar imediatamente após login bem-sucedido
        navigate('/dashboard');
      }
    } catch (err) {
      console.log('Erro inesperado:', err);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || !congregation) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Tentando fazer cadastro...');

    try {
      const { error } = await signUp(email, password, name, congregation);

      if (error) {
        console.log('Erro no cadastro:', error);
        let errorMessage = "Erro desconhecido";
        
        if (error.message.includes('User already registered')) {
          errorMessage = "Este email já está cadastrado";
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        } else if (error.message.includes('Invalid email')) {
          errorMessage = "Email inválido";
        } else {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro no cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Seu cadastro foi recebido e está em análise.",
          description: "Aguarde aprovação de um administrador.",
        });
        
        // Limpar campos e ir para a aba de login
        setName('');
        setEmail('');
        setPassword('');
        setCongregation('');
        
        // Mudar para a aba de login
        const loginTab = document.querySelector('[value="signin"]') as HTMLElement;
        if (loginTab) {
          loginTab.click();
        }
      }
    } catch (err) {
      console.log('Erro inesperado:', err);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    console.log('Enviando email de recuperação...');

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        console.log('Erro no reset:', error);
        let errorMessage = "Erro desconhecido";
        
        if (error.message.includes('request this after')) {
          errorMessage = "Aguarde 60 segundos antes de solicitar novamente";
        } else if (error.message.includes('rate limit')) {
          errorMessage = "Muitas tentativas. Aguarde alguns minutos";
        } else {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro ao enviar email",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Se o email existir, você receberá um link para redefinir sua senha.",
        });
        setResetEmail('');
        
        // Voltar para aba de login
        const loginTab = document.querySelector('[value="signin"]') as HTMLElement;
        if (loginTab) {
          loginTab.click();
        }
      }
    } catch (err) {
      console.log('Erro inesperado:', err);
      toast({
        title: "Erro ao enviar email",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }

    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Gestor iptm
          </CardTitle>
          <CardDescription>
            Sistema de Gestão da Igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              <TabsTrigger value="reset">Esqueci</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="congregation">Congregação</Label>
                  <Select value={congregation} onValueChange={setCongregation} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua congregação" />
                    </SelectTrigger>
                    <SelectContent>
                      {congregations?.map((cong) => (
                        <SelectItem key={cong.id} value={cong.id}>
                          {cong.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Sua senha (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Digite seu email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={resetLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Button>
                <p className="text-sm text-gray-600 text-center">
                  Você receberá um email com instruções para redefinir sua senha.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
