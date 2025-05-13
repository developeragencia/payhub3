import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, Wallet, ArrowUpRight, ArrowDownRight, LineChart, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface EstatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  percentage?: string;
  className?: string;
}

function EstatsCard({ title, value, description, icon, trend, percentage, className }: EstatsCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-500";
    if (trend === "down") return "text-rose-500";
    return "text-amber-500";
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="bg-muted p-2 rounded-full">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center">
          {description}
          {trend && percentage && (
            <span className={`ml-2 flex items-center ${getTrendColor()}`}>
              {trend === "up" ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
              {percentage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPadraoPage() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalVendas: 0,
    receitaTotal: 0,
    taxaConversao: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        if (isMounted) setLoading(true);
        
        console.log("Carregando dados do dashboard padrão...");
        
        // Buscando transações para calcular estatísticas
        const transacoesRes = await apiRequest("GET", "/api/transacoes");
        
        if (!transacoesRes.ok) {
          throw new Error("Falha ao carregar transações");
        }
        
        if (!isMounted) return;
        
        const transacoesData = await transacoesRes.json();
        
        // Calculando estatísticas baseadas nas transações reais
        const receitaTotal = transacoesData.reduce(
          (acc: number, transacao: any) => acc + transacao.valor, 
          0
        );
        
        // Contando clientes únicos
        const clientesUnicos = new Set();
        transacoesData.forEach((transacao: any) => {
          if (transacao.clienteEmail) {
            clientesUnicos.add(transacao.clienteEmail);
          }
        });
        
        if (isMounted) {
          setStats({
            totalClientes: clientesUnicos.size,
            totalVendas: transacoesData.length,
            receitaTotal: receitaTotal,
            taxaConversao: 67.8 // Valor padrão para demonstração
          });
          
          setTimeout(() => {
            if (isMounted) setLoading(false);
          }, 300);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard padrão:", error);
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <MainLayout pageTitle="Dashboard Padrão" loading={loading}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient">Dashboard Padrão</h1>
        <p className="text-muted-foreground">
          Visão geral simplificada das métricas de vendas e desempenho.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EstatsCard
          title="Clientes"
          value={stats.totalClientes.toString()}
          description="Total de clientes"
          icon={<Users className="h-4 w-4" />}
          trend="up"
          percentage="8%"
        />
        <EstatsCard
          title="Vendas"
          value={stats.totalVendas.toString()}
          description="Total de vendas"
          icon={<ShoppingBag className="h-4 w-4" />}
          trend="up"
          percentage="12%"
        />
        <EstatsCard
          title="Receita"
          value={formatCurrency(stats.receitaTotal)}
          description="Faturamento total"
          icon={<Wallet className="h-4 w-4" />}
          trend="up"
          percentage="6.5%"
        />
        <EstatsCard
          title="Conversão"
          value={`${stats.taxaConversao}%`}
          description="Taxa de conversão"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="down"
          percentage="2.1%"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-8">
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-gradient-accent">Vendas por Mês</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
              <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <p>O gráfico de vendas por mês seria exibido aqui,<br/>baseado nos dados reais de transações.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-gradient">Top Produtos</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
              <p>O gráfico de top produtos seria exibido aqui,<br/>baseado nos dados reais de transações.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}