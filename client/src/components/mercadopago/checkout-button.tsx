import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutButtonProps {
  produtoId: number;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
  fullWidth?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function CheckoutButton({
  produtoId,
  buttonText = "Pagar com MercadoPago",
  variant = "default",
  fullWidth = false,
  onSuccess,
  onError
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      setIsLoading(true);

      // Vamos buscar o produto com base no ID
      const produtoResponse = await fetch(`/api/produtos/${produtoId}`);
      if (!produtoResponse.ok) {
        throw new Error('Produto não encontrado');
      }
      
      const produto = await produtoResponse.json();
      
      // Criar os itens para a preferência
      const items = [{
        id: produto.id.toString(),
        title: produto.nome,
        quantity: 1,
        unit_price: produto.preco,
        description: produto.descricao,
        picture_url: produto.imagem
      }];

      // URLs de retorno
      const backUrls = {
        success: `${window.location.origin}/transacao/sucesso`,
        failure: `${window.location.origin}/transacao/falha`,
        pending: `${window.location.origin}/transacao/pendente`
      };

      // Fazer a requisição para criar a preferência
      const preferenceResponse = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items,
          backUrls,
          notificationUrl: `${window.location.origin}/api/mercadopago/webhook`
        })
      });

      if (!preferenceResponse.ok) {
        const errorData = await preferenceResponse.json();
        throw new Error(errorData.message || 'Erro ao criar preferência de pagamento');
      }

      // Obter a URL do checkout
      const preference = await preferenceResponse.json();
      
      // Chamar o callback de sucesso, se fornecido
      if (onSuccess) {
        onSuccess(preference);
      }

      // Redirecionar para a URL do checkout do MercadoPago
      if (preference.init_point) {
        window.location.href = preference.init_point;
      } else {
        throw new Error('URL de checkout não encontrada na resposta');
      }
    } catch (error) {
      console.error("Erro ao iniciar checkout:", error);
      
      toast({
        title: "Erro ao iniciar checkout",
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
      variant={variant}
      onClick={handleClick}
      disabled={isLoading}
      className={fullWidth ? "w-full" : ""}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}