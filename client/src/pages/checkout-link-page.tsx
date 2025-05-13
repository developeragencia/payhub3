import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Copy, Link, Plus, Settings, Share2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkout } from "@shared/schema";

// Schema para criação de checkout link
const checkoutLinkSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter no mínimo 3 caracteres" }),
  url: z.string().min(3, { message: "A URL deve ter no mínimo 3 caracteres" }),
  produtoId: z.number().optional(),
  layout: z.string().default("default"),
  config: z.string().default("{}"),
  ativo: z.boolean().default(true),
});

type CheckoutLinkFormValues = z.infer<typeof checkoutLinkSchema>;

interface CheckoutLinkCardProps {
  checkout: Checkout;
  onEdit: (checkout: Checkout) => void;
  onDelete: (checkout: Checkout) => void;
}

function CheckoutLinkCard({ checkout, onEdit, onDelete }: CheckoutLinkCardProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copiado!",
      description: "O link de checkout foi copiado para a área de transferência.",
    });
  };

  const getFullUrl = (path: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}`;
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{checkout.nome}</CardTitle>
          <div className={`h-3 w-3 rounded-full ${checkout.ativo ? "bg-green-500" : "bg-gray-300"}`}></div>
        </div>
        <CardDescription>{getFullUrl(checkout.url)}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Produto ID: {checkout.produtoId || "Não especificado"}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={() => copyToClipboard(getFullUrl(checkout.url))}
          >
            <Copy className="mr-2 h-4 w-4" />
            <span>Copiar</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            asChild
          >
            <a href={checkout.url} target="_blank" rel="noopener noreferrer">
              <Share2 className="mr-2 h-4 w-4" />
              <span>Abrir</span>
            </a>
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-blue-500"
            onClick={() => onEdit(checkout)}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center text-red-500"
            onClick={() => onDelete(checkout)}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Excluir</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function CheckoutLinkPage() {
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [editingCheckout, setEditingCheckout] = useState<Checkout | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar checkouts
  const { data: checkouts = [], isLoading } = useQuery<Checkout[]>({
    queryKey: ["/api/checkouts"],
  });

  // Form para criar/editar checkout
  const form = useForm<CheckoutLinkFormValues>({
    resolver: zodResolver(checkoutLinkSchema),
    defaultValues: {
      nome: "",
      url: "/checkout/",
      produtoId: undefined,
      layout: "default",
      config: "{}",
      ativo: true,
    },
  });

  // Reset form quando abrir o dialog
  useEffect(() => {
    if (isDialogOpen) {
      if (editingCheckout) {
        form.reset({
          nome: editingCheckout.nome,
          url: editingCheckout.url,
          produtoId: editingCheckout.produtoId || undefined,
          layout: editingCheckout.layout || "default",
          config: typeof editingCheckout.config === 'string' 
            ? editingCheckout.config 
            : JSON.stringify(editingCheckout.config || {}),
          ativo: editingCheckout.ativo,
        });
      } else {
        form.reset({
          nome: "",
          url: "/checkout/",
          produtoId: undefined,
          layout: "default",
          config: "{}",
          ativo: true,
        });
      }
    }
  }, [isDialogOpen, editingCheckout, form]);

  // Mutation para criar checkouts
  const createCheckoutMutation = useMutation({
    mutationFn: async (checkout: CheckoutLinkFormValues) => {
      const res = await apiRequest("POST", "/api/checkouts", checkout);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao criar checkout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsDialogOpen(false);
      toast({
        title: "Checkout criado",
        description: "O link de checkout foi criado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar checkouts
  const updateCheckoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CheckoutLinkFormValues> }) => {
      const res = await apiRequest("PUT", `/api/checkouts/${id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar checkout");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsDialogOpen(false);
      setEditingCheckout(null);
      toast({
        title: "Checkout atualizado",
        description: "O link de checkout foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir checkouts
  const deleteCheckoutMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/checkouts/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao excluir checkout");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      toast({
        title: "Checkout excluído",
        description: "O link de checkout foi excluído com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCheckout = (checkout: Checkout) => {
    setEditingCheckout(checkout);
    setIsDialogOpen(true);
  };

  const handleDeleteCheckout = (checkout: Checkout) => {
    if (window.confirm(`Tem certeza que deseja excluir o checkout "${checkout.nome}"?`)) {
      deleteCheckoutMutation.mutate(checkout.id);
    }
  };

  const onSubmit = (data: CheckoutLinkFormValues) => {
    if (editingCheckout) {
      updateCheckoutMutation.mutate({ id: editingCheckout.id, data });
    } else {
      createCheckoutMutation.mutate(data);
    }
  };

  const filteredCheckouts = activeTab === "todos" 
    ? checkouts 
    : activeTab === "ativos" 
      ? checkouts.filter(checkout => checkout.ativo)
      : checkouts.filter(checkout => !checkout.ativo);

  return (
    <MainLayout pageTitle="Checkout Link">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Checkout Links</h1>
          <p className="text-muted-foreground">
            Gerencie links de checkout personalizados para seus produtos.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Checkout Link
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCheckout ? "Editar Checkout Link" : "Criar Checkout Link"}</DialogTitle>
              <DialogDescription>
                {editingCheckout 
                  ? "Edite as informações do link de checkout existente." 
                  : "Preencha os campos para criar um novo link de checkout."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do checkout" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome para identificação do link (apenas interno).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <div className="bg-muted px-3 py-2 rounded-l-md border border-r-0 border-input">
                            {window.location.origin}
                          </div>
                          <Input 
                            className="rounded-l-none" 
                            placeholder="/checkout/meu-produto" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        URL amigável para acessar o checkout.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="produtoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID do Produto (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="ID do produto" 
                          {...field}
                          value={field.value || ''}
                          onChange={event => {
                            const value = event.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        ID do produto associado a este checkout.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="config"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Configuração (JSON)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='{"theme": "dark", "redirect": true}'
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Configurações em formato JSON.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status</FormLabel>
                        <FormDescription>
                          Ativar ou desativar este link de checkout.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="gradient-primary"
                    disabled={createCheckoutMutation.isPending || updateCheckoutMutation.isPending}
                  >
                    {(createCheckoutMutation.isPending || updateCheckoutMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingCheckout ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
        </TabsList>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <Card className="h-44 animate-pulse bg-muted/40"></Card>
              <Card className="h-44 animate-pulse bg-muted/40"></Card>
              <Card className="h-44 animate-pulse bg-muted/40"></Card>
            </>
          ) : filteredCheckouts.length === 0 ? (
            <div className="col-span-3 flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center">Nenhum checkout encontrado</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Link className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === "todos" 
                      ? "Você ainda não criou nenhum checkout link."
                      : activeTab === "ativos"
                        ? "Não há checkouts ativos."
                        : "Não há checkouts inativos."}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Checkout Link
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            filteredCheckouts.map((checkout) => (
              <CheckoutLinkCard
                key={checkout.id}
                checkout={checkout}
                onEdit={handleEditCheckout}
                onDelete={handleDeleteCheckout}
              />
            ))
          )}
        </div>
      </Tabs>
    </MainLayout>
  );
}