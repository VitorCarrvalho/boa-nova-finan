import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { BarChart3, DollarSign, Users, Calendar, FileText, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

export default function ReportsMenu() {
  const { canViewModule } = usePermissions();

  const menuItems = [
    {
      title: "Relatórios Financeiros",
      description: "Relatórios de receitas, despesas e análises financeiras",
      icon: DollarSign,
      link: "/relatorios/financeiro",
      color: "text-green-600",
      permission: "relatorios"
    },
    {
      title: "Relatórios de Membros", 
      description: "Relatórios de cadastros e estatísticas de membros",
      icon: Users,
      link: "/relatorios/membros",
      color: "text-blue-600",
      permission: "relatorios"
    },
    {
      title: "Relatórios de Eventos",
      description: "Relatórios de participação e frequência em eventos",
      icon: Calendar,
      link: "/relatorios/eventos", 
      color: "text-purple-600",
      permission: "relatorios"
    },
    {
      title: "Relatórios de Reconciliações",
      description: "Relatórios de reconciliações financeiras",
      icon: FileText,
      link: "/relatorios/conciliacoes",
      color: "text-orange-600", 
      permission: "relatorios"
    },
    {
      title: "Relatórios de Fornecedores",
      description: "Relatórios de pagamentos e análises de fornecedores",
      icon: Truck,
      link: "/relatorios/fornecedores",
      color: "text-red-600",
      permission: "relatorios"
    }
  ];

  const visibleItems = menuItems.filter(item => canViewModule(item.permission));

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Sistema de relatórios e análises</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recursos Disponíveis</CardTitle>
            <CardDescription>
              Acesse diferentes tipos de relatórios para análise de dados, 
              incluindo informações financeiras, estatísticas de membros, 
              eventos e fornecedores.
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