import {
  CircleDollarSign,
  ShoppingCart,
  Users,
  LineChart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  change: {
    value: string;
    trend: "up" | "down";
  };
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
};

function MetricCard({ title, value, change, icon, iconColor, iconBgColor }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div 
            className={cn(
              "flex-shrink-0 rounded-md p-3 flex items-center justify-center",
              iconBgColor
            )}
          >
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
            <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
            <p 
              className={cn(
                "text-xs font-medium mt-1 flex items-center",
                change.trend === "up" ? "text-success" : "text-destructive"
              )}
            >
              {change.trend === "up" ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              <span>{change.value}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetricsGrid() {
  const metrics = [
    {
      title: "Transações",
      value: "24.508",
      change: {
        value: "12.5% desde o mês passado",
        trend: "up" as const,
      },
      icon: <ShoppingCart className="h-5 w-5" />,
      iconColor: "text-primary-600",
      iconBgColor: "bg-primary-100",
    },
    {
      title: "Receita",
      value: "R$ 192.458,50",
      change: {
        value: "8.2% desde o mês passado",
        trend: "up" as const,
      },
      icon: <CircleDollarSign className="h-5 w-5" />,
      iconColor: "text-secondary-600",
      iconBgColor: "bg-secondary-100",
    },
    {
      title: "Clientes",
      value: "3.621",
      change: {
        value: "5.3% desde o mês passado",
        trend: "up" as const,
      },
      icon: <Users className="h-5 w-5" />,
      iconColor: "text-accent-600",
      iconBgColor: "bg-accent-100",
    },
    {
      title: "Taxa de Conversão",
      value: "8.42%",
      change: {
        value: "2.1% desde o mês passado",
        trend: "down" as const,
      },
      icon: <LineChart className="h-5 w-5" />,
      iconColor: "text-warning-600",
      iconBgColor: "bg-warning-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
