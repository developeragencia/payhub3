import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { BarChart3, Users, ShoppingCart, BarChart, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Componente para estatísticas
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  percentage?: string;
}

function StatCard({ title, value, description, icon, trend, percentage }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {description}
          {trend && percentage && (
            <span className={`ml-2 flex items-center ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}`}>
              {trend === "up" ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
              {percentage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para atividades recentes
interface Atividade {
  id: number;
  data: string;
  descricao: string;
  tipo: string;
  icone: string | null;
  cor: string | null;
}

function AtividadesRecentes({ atividades }: { atividades: Atividade[] }) {
  function getIcon(tipo: string) {
    switch (tipo) {
      case "transacao":
        return <CreditCard className="h-5 w-5" />;
      case "usuario":
        return <Users className="h-5 w-5" />;
      case "sistema":
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  }

  function getColorClass(cor: string | null) {
    switch (cor) {
      case "success":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "danger":
        return "bg-red-100 text-red-700";
      case "primary":
      default:
        return "bg-blue-100 text-blue-700";
    }
  }

  function formatTimeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`;
    } else if (diffHours > 0) {
      return `${diffHours} hora${diffHours > 1 ? "s" : ""} atrás`;
    } else if (diffMins > 0) {
      return `${diffMins} minuto${diffMins > 1 ? "s" : ""} atrás`;
    } else {
      return "Agora mesmo";
    }
  }

  return (
    <Card className="col-span-full md:col-span-2">
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
        <CardDescription>Últimas atividades do sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {atividades.map((atividade) => (
            <div key={atividade.id} className="flex items-start">
              <div className={`mr-4 rounded-full p-2 ${getColorClass(atividade.cor)}`}>
                {getIcon(atividade.tipo)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{atividade.descricao}</div>
                <div className="text-sm text-muted-foreground">{formatTimeAgo(atividade.data)}</div>
              </div>
            </div>
          ))}
          {atividades.length === 0 && (
            <div className="text-center text-muted-foreground">
              Nenhuma atividade recente encontrada
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [stats, setStats] = useState({
    totalTransacoes: 0,
    receitaTotal: 0,
    mediaMensal: 0,
    conversao: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Buscar atividades
        const atividadesRes = await apiRequest("GET", "/api/atividades");
        
        if (!atividadesRes.ok) {
          throw new Error("Falha ao carregar atividades");
        }
        
        const atividadesData = await atividadesRes.json();
        setAtividades(atividadesData);
        
        // Buscar estatísticas (simuladas por enquanto)
        // Em um sistema real, teríamos um endpoint dedicado para estatísticas
        // ou calcularíamos com base nos dados de transações reais
        const transacoesRes = await apiRequest("GET", "/api/transacoes");
        
        if (!transacoesRes.ok) {
          throw new Error("Falha ao carregar transações");
        }
        
        const transacoesData = await transacoesRes.json();
        
        // Calcular estatísticas baseado nas transações
        const total = transacoesData.length;
        const receitaTotal = transacoesData.reduce(
          (acc: number, transacao: any) => acc + transacao.valor, 
          0
        );
        
        setStats({
          totalTransacoes: total,
          receitaTotal: receitaTotal,
          mediaMensal: receitaTotal > 0 ? receitaTotal / 3 : 0, // Simulação de média mensal
          conversao: 68.5, // Valor simulado para exemplo
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <MainLayout pageTitle="Dashboard" loading={loading}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Transações Totais"
          value={stats.totalTransacoes.toString()}
          description="Transações realizadas"
          icon={<CreditCard className="h-4 w-4" />}
          trend="up"
          percentage="12%"
        />
        <StatCard
          title="Receita Total"
          value={formatCurrency(stats.receitaTotal)}
          description="Receita acumulada"
          icon={<Wallet className="h-4 w-4" />}
          trend="up"
          percentage="8.2%"
        />
        <StatCard
          title="Média Mensal"
          value={formatCurrency(stats.mediaMensal)}
          description="Últimos 3 meses"
          icon={<BarChart className="h-4 w-4" />}
          trend="neutral"
          percentage="0.5%"
        />
        <StatCard
          title="Taxa de Conversão"
          value={`${stats.conversao}%`}
          description="Do checkout"
          icon={<ShoppingCart className="h-4 w-4" />}
          trend="down"
          percentage="4.1%"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AtividadesRecentes atividades={atividades} />
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top produtos por receita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium">Curso de Marketing Digital</div>
                    <div className="text-sm text-muted-foreground">R$ 1.458,90</div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full w-[80%] bg-primary"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium">Consultoria de Marketing</div>
                    <div className="text-sm text-muted-foreground">R$ 895,00</div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full w-[60%] bg-primary"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm font-medium">E-book de SEO</div>
                    <div className="text-sm text-muted-foreground">R$ 159,90</div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full w-[45%] bg-primary"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}