import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema de validação
const paymentFormSchema = z.object({
  transaction_amount: z.number().min(1, "O valor deve ser maior que zero"),
  description: z.string().min(1, "A descrição é obrigatória"),
  payment_method_id: z.string().min(1, "O método de pagamento é obrigatório"),
  payer_email: z.string().email("Email inválido"),
  payer_name: z.string().min(1, "O nome é obrigatório"),
  identification_type: z.string().optional(),
  identification_number: z.string().optional()
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  produtoId?: number;
  produtoNome?: string;
  produtoPreco?: number;
  produtoDescricao?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function PaymentForm({
  produtoId,
  produtoNome,
  produtoPreco,
  produtoDescricao,
  onSuccess,
  onError
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Inicializar o formulário
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      transaction_amount: produtoPreco || 0,
      description: produtoDescricao || (produtoNome ? `Pagamento de ${produtoNome}` : ""),
      payment_method_id: "pix",
      payer_email: "",
      payer_name: "",
      identification_type: "CPF",
      identification_number: ""
    }
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      setIsSubmitting(true);

      // Formatar os dados conforme esperado pela API
      const paymentData = {
        transaction_amount: data.transaction_amount,
        description: data.description,
        payment_method_id: data.payment_method_id,
        payer: {
          email: data.payer_email,
          name: data.payer_name,
          identification: {
            type: data.identification_type,
            number: data.identification_number
          }
        },
        additional_info: produtoId ? {
          items: [
            {
              id: produtoId.toString(),
              title: produtoNome || "Produto",
              description: produtoDescricao || "Descrição do produto",
              quantity: 1,
              unit_price: produtoPreco || data.transaction_amount
            }
          ]
        } : undefined,
        notification_url: window.location.origin + "/api/mercadopago/webhook"
      };

      // Enviar solicitação para a API
      const response = await fetch('/api/mercadopago/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao processar pagamento');
      }

      const result = await response.json();

      toast({
        title: "Pagamento processado com sucesso",
        description: `O pagamento foi criado com o ID: ${result.id}`,
      });

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);

      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive",
      });

      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pagamento</CardTitle>
        <CardDescription>
          Preencha os dados para efetuar o pagamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="transaction_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                      disabled={!!produtoPreco}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Descrição do pagamento" 
                      {...field} 
                      disabled={!!produtoDescricao}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="bolbradesco">Boleto Bancário</SelectItem>
                      <SelectItem value="master">Cartão Mastercard</SelectItem>
                      <SelectItem value="visa">Cartão Visa</SelectItem>
                      <SelectItem value="elo">Cartão Elo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu Nome Completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identification_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de documento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CPF">CPF</SelectItem>
                      <SelectItem value="CNPJ">CNPJ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="identification_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Documento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apenas números" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Efetuar Pagamento"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between flex-col space-y-2 text-xs text-gray-500">
        <p>Todos os pagamentos são processados pelo MercadoPago</p>
        <p>Seus dados estão seguros e protegidos</p>
      </CardFooter>
    </Card>
  );
}