import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Produto } from "@shared/schema";
import { PaymentForm } from "@/components/mercadopago/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default function PagamentoPage() {
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  // Obter o produtoId da query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const produtoId = params.get('produtoId');
    if (produtoId) {
      setSelectedProdutoId(parseInt(produtoId));
    }
  }, []);

  // Buscar detalhes do produto
  const { data: produto, isLoading } = useQuery<Produto>({
    queryKey: ["/api/produtos", selectedProdutoId],
    queryFn: async () => {
      if (!selectedProdutoId) throw new Error("ID do produto não especificado");
      const res = await fetch(`/api/produtos/${selectedProdutoId}`);
      if (!res.ok) throw new Error("Produto não encontrado");
      return res.json();
    },
    enabled: !!selectedProdutoId,
  });

  const handlePaymentSuccess = (data: any) => {
    toast({
      title: "Pagamento criado com sucesso",
      description: `Pagamento ID: ${data.id}`,
    });
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Erro ao processar pagamento",
      description: error.message || "Ocorreu um erro ao processar o pagamento.",
      variant: "destructive",
    });
  };

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
            <h1 className="text-lg font-semibold">Pagamento Seguro</h1>
          </div>
        </div>
      </header>

      <main className="flex-grow container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !produto ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Produto não encontrado</CardTitle>
                <CardDescription>
                  O produto selecionado não foi encontrado ou não existe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => setLocation("/")}>
                  Voltar para a página inicial
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{produto.nome}</CardTitle>
                  <CardDescription>
                    {produto.descricao}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {produto.imagem && (
                      <div className="aspect-video w-full rounded-md overflow-hidden">
                        <img
                          src={produto.imagem}
                          alt={produto.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-md">
                      <span className="font-medium">Preço:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(produto.preco)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <PaymentForm
                produtoId={produto.id}
                produtoNome={produto.nome}
                produtoPreco={produto.preco}
                produtoDescricao={produto.descricao || undefined}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>
          </div>
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