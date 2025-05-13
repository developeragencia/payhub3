import { Produto } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/mercadopago/checkout-button";
import { formatCurrency } from "@/lib/utils";

interface ProdutoCardProps {
  produto: Produto;
  onCheckoutSuccess?: (data: any) => void;
  onCheckoutError?: (error: any) => void;
}

export function ProdutoCard({ produto, onCheckoutSuccess, onCheckoutError }: ProdutoCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{produto.nome}</CardTitle>
          {produto.ativo ? (
            <Badge variant="secondary" className="ml-2">
              Ativo
            </Badge>
          ) : (
            <Badge variant="destructive" className="ml-2">
              Inativo
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2 text-sm">
          {produto.descricao}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-0">
        {produto.imagem && (
          <div className="aspect-video w-full mb-4 rounded-md overflow-hidden">
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Preço:</span>
            <span className="font-bold text-primary">
              {formatCurrency(produto.preco)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Categoria:</span>
            <span className="text-sm">
              {produto.categoria || "Não categorizado"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 mt-auto">
        <CheckoutButton
          produtoId={produto.id}
          nome={produto.nome}
          preco={produto.preco}
          descricao={produto.descricao || ""}
          className="w-full"
          onSuccess={onCheckoutSuccess}
          onError={onCheckoutError}
        />
      </CardFooter>
    </Card>
  );
}