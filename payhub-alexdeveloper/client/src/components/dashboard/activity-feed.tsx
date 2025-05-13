import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atividade } from "@shared/schema";
import { 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  ShoppingBag, 
  ShoppingCart, 
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  "user-add-line": <UserPlus className="h-4 w-4" />,
  "checkbox-circle-line": <CheckCircle className="h-4 w-4" />,
  "error-warning-line": <AlertTriangle className="h-4 w-4" />,
  "user-line": <User className="h-4 w-4" />,
  "shopping-bag-3-line": <ShoppingBag className="h-4 w-4" />,
  "shopping-cart-line": <ShoppingCart className="h-4 w-4" />,
};

const colorMap = {
  primary: "bg-primary-100 text-primary-600",
  success: "bg-success-100 text-success",
  warning: "bg-warning-100 text-warning",
  danger: "bg-destructive-100 text-destructive",
  secondary: "bg-secondary-100 text-secondary-600",
  accent: "bg-accent-100 text-accent-600",
};

function getIcon(icone: string) {
  // @ts-ignore - We're handling fallback case
  return iconMap[icone] || <ExternalLink className="h-4 w-4" />;
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return "agora mesmo";
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? "minuto" : "minutos"} atrás`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hora" : "horas"} atrás`;
  } else {
    return `${diffDays} ${diffDays === 1 ? "dia" : "dias"} atrás`;
  }
}

export function ActivityFeed() {
  const { data: atividades, isLoading } = useQuery<Atividade[]>({
    queryKey: ["/api/atividades"],
  });
  
  return (
    <Card>
      <CardHeader className="p-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-900">Atividades Recentes</CardTitle>
          <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-700 p-0">
            Ver Todas <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-neutral-500">Carregando atividades...</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {atividades?.slice(0, 3).map((atividade) => (
              <li key={atividade.id} className="py-3 flex">
                <div className="flex-shrink-0 mr-3">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    colorMap[atividade.cor as keyof typeof colorMap] || "bg-neutral-100 text-neutral-600"
                  )}>
                    {getIcon(atividade.icone || "")}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    {atividade.descricao.split(' - ')[0]}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {atividade.descricao.split(' - ')[1]}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {formatTimeAgo(new Date(atividade.data))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
