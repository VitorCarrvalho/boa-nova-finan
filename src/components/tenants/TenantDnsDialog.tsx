import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Globe, Server, AlertTriangle } from 'lucide-react';

interface TenantDnsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantName: string;
  subdomain: string;
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-mono font-medium">{value}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

const TenantDnsDialog: React.FC<TenantDnsDialogProps> = ({
  open,
  onOpenChange,
  tenantName,
  subdomain,
}) => {
  const fullDomain = `${subdomain}.igrejamoove.com.br`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuração DNS — {tenantName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Domain info */}
          <div className="rounded-lg border p-4 bg-primary/5">
            <p className="text-sm font-medium mb-1">Domínio da Organização</p>
            <p className="text-lg font-mono font-bold">{fullDomain}</p>
          </div>

          {/* DNS Records */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium text-sm">Registros DNS Necessários</h4>
            </div>

            <p className="text-sm text-muted-foreground">
              Adicione os seguintes registros no painel de DNS do domínio <code className="bg-muted px-1 rounded">igrejamoove.com.br</code>:
            </p>

            <div className="space-y-2">
              <CopyableField label="Tipo" value="CNAME" />
              <CopyableField label="Nome / Host" value={subdomain} />
              <CopyableField label="Valor / Destino" value="boa-nova-finan.lovable.app" />
              <CopyableField label="TTL" value="3600" />
            </div>
          </div>

          {/* Alternative: A Record */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Alternativa: Registro A (se CNAME não for possível)
            </h4>
            <div className="space-y-2">
              <CopyableField label="Tipo" value="A" />
              <CopyableField label="Nome / Host" value={subdomain} />
              <CopyableField label="Valor / IP" value="185.158.133.1" />
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-yellow-600">Observações importantes:</p>
                <ul className="text-muted-foreground space-y-1 list-disc pl-4">
                  <li>A propagação DNS pode levar até 72 horas</li>
                  <li>O SSL será provisionado automaticamente após a propagação</li>
                  <li>Use <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="underline">dnschecker.org</a> para verificar o status</li>
                  <li>Certifique-se de não ter registros conflitantes para o mesmo subdomínio</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick access URLs */}
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-medium">Links de Acesso</h4>
            <div className="space-y-1">
              <CopyableField label="URL de Produção" value={`https://${fullDomain}`} />
              <CopyableField
                label="URL de Teste (Preview)"
                value={`${window.location.origin}/dashboard?tenant=${subdomain}`}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDnsDialog;