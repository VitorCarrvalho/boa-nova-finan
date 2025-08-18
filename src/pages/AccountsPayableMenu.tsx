import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { DollarSign, Plus, Upload, Clock, CheckCircle, CheckCircle2, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

export default function AccountsPayableMenu() {
  const { 
    canViewNewAccount, 
    canViewPendingApproval, 
    canViewAuthorizeAccounts, 
    canViewApprovedAccounts, 
    canViewPaidAccounts 
  } = usePermissions();

  const menuItems = [
    {
      title: "Nova Conta",
      description: "Cadastrar nova conta a pagar",
      icon: Plus,
      link: "/contas-pagar/nova",
      color: "text-blue-600",
      permission: canViewNewAccount
    },
    {
      title: "Importar Contas",
      description: "Importar múltiplas contas via planilha",
      icon: Upload,
      link: "/contas-pagar/importar",
      color: "text-indigo-600",
      permission: canViewNewAccount
    },
    {
      title: "Pendente Aprovação", 
      description: "Contas aguardando aprovação",
      icon: Clock,
      link: "/contas-pagar/pendente-aprovacao",
      color: "text-yellow-600",
      permission: canViewPendingApproval
    },
    {
      title: "Autorizar Contas",
      description: "Autorizar contas para pagamento",
      icon: CheckCircle,
      link: "/contas-pagar/autorizar",
      color: "text-orange-600",
      permission: canViewAuthorizeAccounts
    },
    {
      title: "Contas Aprovadas",
      description: "Contas aprovadas para pagamento",
      icon: CheckCircle2,
      link: "/contas-pagar/aprovadas",
      color: "text-green-600", 
      permission: canViewApprovedAccounts
    },
    {
      title: "Contas Pagas",
      description: "Histórico de contas pagas",
      icon: CreditCard,
      link: "/contas-pagar/pagas",
      color: "text-purple-600",
      permission: canViewPaidAccounts
    }
  ];

  const visibleItems = menuItems.filter(item => item.permission());

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Contas a Pagar</h1>
            <p className="text-muted-foreground">Sistema de gestão de contas a pagar</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recursos Disponíveis</CardTitle>
            <CardDescription>
              Gerencie todo o fluxo de contas a pagar, desde o cadastro até o pagamento, 
              incluindo aprovações e autorizações conforme sua hierarquia de acesso.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <Card key={item.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={item.link}>
                    Acessar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}