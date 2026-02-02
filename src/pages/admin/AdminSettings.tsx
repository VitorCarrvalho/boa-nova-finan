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
  Bell, 
  Shield, 
  Globe,
  Mail,
  Palette
} from 'lucide-react';

const AdminSettings = () => {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Configurações Globais
          </h1>
          <p className="text-slate-400 mt-1">Configure as opções da plataforma</p>
        </div>

        {/* Stripe Configuration */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Integração Stripe
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure as chaves de API do Stripe para processamento de pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-pk" className="text-slate-300">Chave Pública (Publishable Key)</Label>
                <Input 
                  id="stripe-pk"
                  type="password"
                  placeholder="pk_live_..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-sk" className="text-slate-300">Chave Secreta (Secret Key)</Label>
                <Input 
                  id="stripe-sk"
                  type="password"
                  placeholder="sk_live_..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-webhook" className="text-slate-300">Webhook Secret</Label>
              <Input 
                id="stripe-webhook"
                type="password"
                placeholder="whsec_..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Modo de Teste</Label>
                <p className="text-xs text-slate-500">Usar chaves de teste do Stripe</p>
              </div>
              <Switch />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configurações de E-mail
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure o provedor de e-mail para notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">E-mail de Origem</Label>
                <Input 
                  type="email"
                  placeholder="noreply@seudominio.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Nome de Exibição</Label>
                <Input 
                  placeholder="Sistema IPTM"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">E-mails Transacionais</Label>
                <p className="text-xs text-slate-500">Enviar e-mails de boas-vindas e notificações</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Platform Defaults */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Padrões da Plataforma
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure os valores padrão para novos tenants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Dias de Trial</Label>
                <Input 
                  type="number"
                  defaultValue={14}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Plano Padrão</Label>
                <Input 
                  defaultValue="free"
                  disabled
                  className="bg-slate-800 border-slate-700 text-slate-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Auto-aprovação de Tenants</Label>
                <p className="text-xs text-slate-500">Aprovar automaticamente novos cadastros</p>
              </div>
              <Switch />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configurações de segurança da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Autenticação de Dois Fatores</Label>
                <p className="text-xs text-slate-500">Exigir 2FA para Super Admins</p>
              </div>
              <Switch />
            </div>
            <Separator className="bg-slate-800" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Logs de Auditoria</Label>
                <p className="text-xs text-slate-500">Registrar todas as ações administrativas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-slate-800" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-300">Notificações de Segurança</Label>
                <p className="text-xs text-slate-500">Alertar sobre atividades suspeitas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              Salvar Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AdminSettings;
