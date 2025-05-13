import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Webhook } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Settings, Link, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebhooksStatus() {
  const { data: webhooks, isLoading } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
  });
  
  return (
    <Card>
      <CardHeader className="p-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-900">Status de Webhooks</CardTitle>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary-600 hover:text-primary-700 p-0 flex items-center"
          >
            Configurar <Settings className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-sm text-neutral-500">Carregando webhooks...</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {webhooks?.map((webhook) => (
              <li key={webhook.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 mr-3">
                    <Link className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {webhook.evento}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {webhook.url}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", 
                      webhook.ativo 
                        ? "bg-success bg-opacity-10 text-success" 
                        : "bg-warning bg-opacity-10 text-warning"
                    )}
                  >
                    {webhook.ativo ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertTriangle className="mr-1 h-3 w-3" />
                    )}
                    {webhook.ativo ? "Ativo" : "Falha"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
