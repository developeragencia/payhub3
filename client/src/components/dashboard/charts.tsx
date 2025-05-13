import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import { MoreHorizontal, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Dummy data for charts
const revenueData = [
  { name: 'Seg', valor: 12500 },
  { name: 'Ter', valor: 18200 },
  { name: 'Qua', valor: 15800 },
  { name: 'Qui', valor: 22300 },
  { name: 'Sex', valor: 24400 },
  { name: 'Sab', valor: 19800 },
  { name: 'Dom', valor: 15200 },
];

const conversionData = [
  { name: 'Checkout 1', taxa: 12.4 },
  { name: 'Checkout 2', taxa: 8.2 },
  { name: 'Checkout 3', taxa: 15.7 },
  { name: 'Checkout 4', taxa: 6.8 },
  { name: 'Checkout 5', taxa: 9.3 },
];

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
};

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-primary mr-2">
              <Download size={18} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-primary">
                  <MoreHorizontal size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Exportar CSV</DropdownMenuItem>
                <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                <DropdownMenuItem>Compartilhar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="h-64">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueChart() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };
  
  return (
    <ChartCard title="Receita (Últimos 7 dias)">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis 
            tickFormatter={formatCurrency} 
            tickLine={false} 
            axisLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Receita"]}
            labelFormatter={(label) => `Dia: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="valor" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ConversionRateChart() {
  return (
    <ChartCard title="Taxa de Conversão por Checkout">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={conversionData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, "Taxa de Conversão"]}
          />
          <Bar dataKey="taxa" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
      <RevenueChart />
      <ConversionRateChart />
    </div>
  );
}
