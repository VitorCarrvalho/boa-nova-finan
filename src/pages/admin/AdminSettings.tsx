import React from 'react';
import SuperAdminLayout from '@/components/layout/SuperAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  CreditCard, 
  Shield,
  Mail,
  Palette
} from 'lucide-react';

const AdminSettings = () => {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Configurações Globais
          </h1>
          <p className="text-muted-foreground mt-1">Configure as opções da plataforma</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Integração Stripe
            </CardTitle>
            <CardDescription>
              Configure as chaves de API do Stripe para processamento de pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-pk">Chave Pública (Publishable Key)</Label>
                <Input id="stripe-pk" type="password" placeholder="pk_live_..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-sk">Chave Secreta (Secret Key)</Label>
                <Input id="stripe-sk" type="password" placeholder="sk_live_..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-webhook">Webhook Secret</Label>
              <Input id="stripe-webhook" type="password" placeholder="whsec_..." />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo de Teste</Label>
                <p className="text-xs text-muted-foreground">Usar chaves de teste do Stripe</p>
              </div>
              <Switch />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de E-mail
            </CardTitle>
            <CardDescription>
              Configure o provedor de e-mail para notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail de Origem</Label>
                <Input type="email" placeholder="noreply@seudominio.com" />
              </div>
              <div className="space-y-2">
                <Label>Nome de Exibição</Label>
                <Input placeholder="Igreja Moove" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>E-mails Transacionais</Label>
                <p className="text-xs text-muted-foreground">Enviar e-mails de boas-vindas e notificações</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Padrões da Plataforma
            </CardTitle>
            <CardDescription>
              Configure os valores padrão para novas organizações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dias de Trial</Label>
                <Input type="number" defaultValue={14} />
              </div>
              <div className="space-y-2">
                <Label>Plano Padrão</Label>
                <Input defaultValue="free" disabled />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-aprovação de Organizações</Label>
                <p className="text-xs text-muted-foreground">Aprovar automaticamente novos cadastros</p>
              </div>
              <Switch />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de Dois Fatores</Label>
                <p className="text-xs text-muted-foreground">Exigir 2FA para Super Admins</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Logs de Auditoria</Label>
                <p className="text-xs text-muted-foreground">Registrar todas as ações administrativas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações de Segurança</Label>
                <p className="text-xs text-muted-foreground">Alertar sobre atividades suspeitas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AdminSettings;
