import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Produto } from "@shared/schema";
import { ProdutoCard } from "@/components/checkout/produto-card";
import { PaymentForm } from "@/components/mercadopago/payment-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MercadoPagoCheckoutPage() {
  const [activeTab, setActiveTab] = useState("produtos");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Buscar produtos
  const { data: produtos = [], isLoading: isLoadingProdutos } = useQuery<Produto[]>({
    queryKey: ["/api/produtos"],
  });

  useEffect(() => {
    if (produtos.length > 0 && !selectedProduto) {
      setSelectedProduto(produtos[0]);
    }
  }, [produtos, selectedProduto]);

  const handleCheckoutSuccess = (data: any) => {
    toast({
      title: "Redirecionando para pagamento",
      description: "Você será redirecionado para a página de pagamento do MercadoPago.",
    });
  };

  const handleCheckoutError = (error: any) => {
    toast({
      title: "Erro ao iniciar checkout",
      description: error.message || "Ocorreu um erro ao iniciar o processo de checkout.",
      variant: "destructive",
    });
  };

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
    <MainLayout 
      pageTitle="Checkout com MercadoPago" 
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full md:w-auto mb-6">
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="direto" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Pagamento Direto</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis</CardTitle>
              <CardDescription>
                Escolha um produto e clique em "Pagar com MercadoPago" para iniciar o checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProdutos ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : produtos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-neutral-500">Nenhum produto disponível.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produtos.map((produto) => (
                    <ProdutoCard 
                      key={produto.id} 
                      produto={produto} 
                      onCheckoutSuccess={handleCheckoutSuccess}
                      onCheckoutError={handleCheckoutError}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="direto" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento Direto</CardTitle>
              <CardDescription>
                Preencha os dados para realizar um pagamento direto via MercadoPago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md mx-auto">
                {selectedProduto ? (
                  <PaymentForm 
                    produtoId={selectedProduto.id}
                    produtoNome={selectedProduto.nome}
                    produtoPreco={selectedProduto.preco}
                    produtoDescricao={selectedProduto.descricao || undefined}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <PaymentForm 
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}