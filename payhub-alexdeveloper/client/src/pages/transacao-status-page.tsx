import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft, Home } from "lucide-react";

type TransactionStatus = "success" | "failure" | "pending" | "unknown";

export default function TransacaoStatusPage() {
  const [status, setStatus] = useState<TransactionStatus>("unknown");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Determinar o status com base na URL
    const pathname = window.location.pathname;
    
    if (pathname.includes("sucesso")) {
      setStatus("success");
    } else if (pathname.includes("falha")) {
      setStatus("failure");
    } else if (pathname.includes("pendente")) {
      setStatus("pending");
    }

    // Obter o ID do pagamento da query string
    const params = new URLSearchParams(window.location.search);
    const id = params.get('payment_id') || params.get('id');
    if (id) {
      setPaymentId(id);
    }

    setIsLoading(false);
  }, []);

  // Mapear status para detalhes da UI
  const statusDetails = {
    success: {
      title: "Pagamento Confirmado!",
      description: "Seu pagamento foi processado com sucesso.",
      icon: <CheckCircle className="h-16 w-16 text-success" />,
      color: "bg-success/10 border-success/20",
    },
    failure: {
      title: "Falha no Pagamento",
      description: "Houve um problema ao processar seu pagamento.",
      icon: <XCircle className="h-16 w-16 text-destructive" />,
      color: "bg-destructive/10 border-destructive/20",
    },
    pending: {
      title: "Pagamento Pendente",
      description: "Seu pagamento está sendo processado.",
      icon: <AlertCircle className="h-16 w-16 text-warning" />,
      color: "bg-warning/10 border-warning/20",
    },
    unknown: {
      title: "Status Desconhecido",
      description: "Não foi possível determinar o status do pagamento.",
      icon: <AlertCircle className="h-16 w-16 text-muted-foreground" />,
      color: "bg-muted border-muted-foreground/20",
    },
  };

  const details = statusDetails[status];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => window.history.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Status da Transação</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className={`border-2 ${details.color}`}>
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                {details.icon}
              </div>
              <CardTitle className="text-2xl">{details.title}</CardTitle>
              <CardDescription className="text-base">
                {details.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              {paymentId && (
                <p className="text-sm text-muted-foreground mb-4">
                  ID da transação: <span className="font-mono">{paymentId}</span>
                </p>
              )}
              
              <div className="mt-4 space-y-2">
                {status === "success" && (
                  <p>
                    Agradecemos a sua compra! Você receberá mais detalhes por e-mail em breve.
                  </p>
                )}
                
                {status === "failure" && (
                  <p>
                    Por favor, verifique suas informações de pagamento e tente novamente.
                    Se o problema persistir, entre em contato com nosso suporte.
                  </p>
                )}
                
                {status === "pending" && (
                  <p>
                    Seu pagamento está sendo processado. Isso pode levar alguns minutos.
                    Você receberá uma notificação assim que for concluído.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center space-x-4 pt-2">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button 
                onClick={() => setLocation("/")}
                className="flex items-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Página Inicial
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
      
      <footer className="bg-white border-t py-6">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-neutral-500">
              Pagamento processado de forma segura pelo MercadoPago
            </p>
            <div className="flex items-center mt-2">
              <img 
                src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/badge.svg" 
                alt="MercadoPago" 
                className="h-8" 
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}