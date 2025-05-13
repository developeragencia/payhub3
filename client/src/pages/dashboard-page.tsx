import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { ChartsSection } from "@/components/dashboard/charts";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { WebhooksStatus } from "@/components/dashboard/webhooks-status";

export default function DashboardPage() {
  return (
    <MainLayout
      title="Dashboard Admin"
      description="Visão geral e métricas do sistema"
    >
      {/* Métricas */}
      <MetricsGrid />
      
      {/* Gráficos */}
      <ChartsSection />
      
      {/* Tabela de Transações */}
      <TransactionsTable />
      
      {/* Atividades e Webhooks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <WebhooksStatus />
      </div>
    </MainLayout>
  );
}
