import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // DEBUG: Mostrar todos os parâmetros recebidos na URL
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('🔍 Todos os parâmetros da URL:', allParams);
    console.log('🔍 URL completa:', window.location.href);
    
    // Verificar se temos os parâmetros necessários do link de reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('🔍 Parâmetros específicos:', { 
      accessToken: accessToken ? '✅ Presente' : '❌ Ausente',
      refreshToken: refreshToken ? '✅ Presente' : '❌ Ausente', 
      type,
      error,
      errorDescription
    });

    if (type === 'recovery' && accessToken && refreshToken) {
      setValidToken(true);
      
      // Configurar a sessão com os tokens do URL
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ error }) => {
        if (error) {
          console.error('Erro ao configurar sessão de reset:', error);
          toast({
            title: "Link inválido",
            description: "O link de recuperação é inválido ou expirou.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      });
    } else {
      toast({
        title: "Acesso inválido",
        description: "Por favor, acesse esta página através do link enviado por email.",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
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

    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log('Atualizando senha...');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.log('Erro ao atualizar senha:', error);
        let errorMessage = "Erro desconhecido";
        
        if (error.message.includes('session_not_found')) {
          errorMessage = "Sessão expirada. Solicite um novo link de recuperação.";
        } else if (error.message.includes('same password')) {
          errorMessage = "A nova senha deve ser diferente da atual.";
        } else {
          errorMessage = error.message;
        }
        
        toast({
          title: "Erro ao redefinir senha",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Senha redefinida com sucesso!",
          description: "Você será redirecionado para fazer login.",
        });
        
        // Fazer logout para limpar a sessão de reset
        await supabase.auth.signOut();
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (err) {
      console.log('Erro inesperado:', err);
      toast({
        title: "Erro ao redefinir senha",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Link Inválido
            </CardTitle>
            <CardDescription>
              Redirecionando para a página de login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Redefinir Senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/auth')}
                disabled={loading}
                className="text-sm text-gray-600"
              >
                Voltar para o login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;