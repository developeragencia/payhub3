import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Produto } from "@shared/schema";
import { CheckoutButton } from "@/components/mercadopago/checkout-button";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProdutoCardProps {
  produto: Produto;
  onCheckoutSuccess?: (data: any) => void;
  onCheckoutError?: (error: any) => void;
}

export function ProdutoCard({ produto, onCheckoutSuccess, onCheckoutError }: ProdutoCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {produto.imagem && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={produto.imagem} 
            alt={produto.nome} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{produto.nome}</CardTitle>
          {produto.ativo ? (
            <Badge variant="default" className="bg-success hover:bg-success/80">Ativo</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
          )}
        </div>
        {produto.categoria && (
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {produto.categoria}
            </Badge>
          </div>
        )}
        {produto.descricao && (
          <CardDescription className="line-clamp-2">
            {produto.descricao}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-md">
          <span className="font-medium">Preço:</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(produto.preco)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <CheckoutButton 
          produtoId={produto.id}
          buttonText="Pagar com MercadoPago"
          fullWidth
          onSuccess={onCheckoutSuccess}
          onError={onCheckoutError}
        />
      </CardFooter>
    </Card>
  );
}