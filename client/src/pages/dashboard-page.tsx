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
  const getTrendClass = () => {
    if (trend === "up") return "text-emerald-500 dark:text-emerald-400";
    if (trend === "down") return "text-rose-500 dark:text-rose-400";
    return "text-amber-500 dark:text-amber-400";
  };

  const getGradientClass = () => {
    if (trend === "up") return "from-emerald-500/20 to-teal-500/20 dark:from-emerald-800/30 dark:to-teal-800/30";
    if (trend === "down") return "from-rose-500/20 to-red-500/20 dark:from-rose-800/30 dark:to-red-800/30";
    return "from-amber-500/20 to-yellow-500/20 dark:from-amber-800/30 dark:to-yellow-800/30";
  };

  return (
    <Card className="overflow-hidden hover-scale hover-shadow transition-all duration-300 border-t-4" 
          style={{ borderTopColor: trend === "up" ? "hsl(142 76% 45%)" : trend === "down" ? "hsl(0 84.2% 65.2%)" : "hsl(38 92% 55%)" }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-9 w-9 rounded-full p-2 bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r opacity-10 -z-10 rounded-lg transition-opacity duration-500 hover:opacity-20 
                      ${getGradientClass()}`}></div>
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {description}
          {trend && percentage && (
            <span className={`ml-2 flex items-center font-semibold ${getTrendClass()}`}>
              {trend === "up" ? 
                <ArrowUpRight className="mr-1 h-3 w-3 animate-pulse" /> : 
                <ArrowDownRight className="mr-1 h-3 w-3 animate-pulse" />
              }
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
        return "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:from-emerald-500/30 dark:to-teal-500/30 dark:text-emerald-400";
      case "warning":
        return "bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-700 dark:from-amber-500/30 dark:to-yellow-500/30 dark:text-amber-400";
      case "danger":
        return "bg-gradient-to-br from-rose-500/20 to-red-500/20 text-rose-700 dark:from-rose-500/30 dark:to-red-500/30 dark:text-rose-400";
      case "primary":
      default:
        return "bg-gradient-to-br from-primary/20 to-secondary/20 text-primary dark:from-primary/30 dark:to-secondary/30 dark:text-primary-foreground";
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
    <Card className="col-span-full md:col-span-2 hover-shadow transition-all duration-300 border-l-4 border-l-primary/70">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Atividades Recentes
              </span>
            </CardTitle>
            <CardDescription>Últimas atividades do sistema</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 relative">
          {/* Linha de timeline conectando os ícones */}
          <div className="absolute left-[22px] top-1 bottom-1 w-[2px] bg-gradient-to-b from-primary/20 via-secondary/20 to-transparent"></div>
          
          {atividades.map((atividade, index) => (
            <div 
              key={atividade.id} 
              className="flex items-start relative animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className={`mr-4 rounded-full p-2 shadow-md z-10 ${getColorClass(atividade.cor)}`}>
                {getIcon(atividade.tipo)}
              </div>
              <div className="flex-1 bg-muted/30 dark:bg-muted/10 rounded-lg p-3 transition-all duration-300 hover:bg-muted/50 dark:hover:bg-muted/20">
                <div className="font-medium">{atividade.descricao}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary/60 animate-pulse-slow"></span>
                  {formatTimeAgo(atividade.data)}
                </div>
              </div>
            </div>
          ))}
          
          {atividades.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-10 w-10 text-muted-foreground/60" />
                <span>Nenhuma atividade recente encontrada</span>
              </div>
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