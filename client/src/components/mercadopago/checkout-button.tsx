import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutButtonProps {
  produtoId: number;
  nome: string;
  preco: number;
  descricao?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function CheckoutButton({
  produtoId,
  nome,
  preco,
  descricao = "",
  onSuccess,
  onError,
  className,
  variant = "default"
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      // Obtem a URL do site atual para o retorno
      const baseUrl = window.location.origin;
      
      // Prepara os dados para criar uma preferência de pagamento
      const preferenceData = {
        items: [
          {
            id: produtoId.toString(),
            title: nome,
            description: descricao,
            quantity: 1,
            unit_price: preco,
            currency_id: "BRL"
          }
        ],
        backUrls: {
          success: `${baseUrl}/transacao/sucesso`,
          failure: `${baseUrl}/transacao/falha`,
          pending: `${baseUrl}/transacao/pendente`
        },
        notificationUrl: `${baseUrl}/api/mercadopago/webhook`
      };
      
      // Envia a solicitação para criar a preferência
      const response = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferenceData)
      });
      
      if (!response.ok) {
        throw new Error('Falha ao criar preferência de pagamento');
      }
      
      const data = await response.json();
      
      // Abre a URL do checkout
      if (data.init_point) {
        window.open(data.init_point, '_blank');
        
        if (onSuccess) {
          onSuccess(data);
        }
        
        toast({
          title: "Checkout iniciado",
          description: "Você foi redirecionado para a página de pagamento",
        });
      } else {
        throw new Error('URL de pagamento não encontrada na resposta');
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      
      toast({
        title: "Erro ao iniciar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });
      
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        "Pagar com MercadoPago"
      )}
    </Button>
  );
}