import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Edit, Plus, List, Link as LinkIcon, LayoutGrid } from "lucide-react";
import { Checkout, InsertCheckout, Produto } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

// Esquema de validação para o formulário
const checkoutFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  produtoId: z.coerce.number().min(1, "Selecione um produto"),
  layout: z.string().default("padrao"),
  url: z.string().default(""),
  config: z.any().default({}),
  ativo: z.boolean().default(true)
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("novo");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [checkoutToDelete, setCheckoutToDelete] = useState<Checkout | null>(null);
  const { toast } = useToast();

  // Buscar todos os checkouts
  const { data: checkouts = [], isLoading: isLoadingCheckouts, refetch: refetchCheckouts } = useQuery<Checkout[]>({
    queryKey: ["/api/checkouts"],
    refetchInterval: false,
  });

  // Buscar todos os produtos
  const { data: produtos = [], isLoading: isLoadingProdutos } = useQuery<Produto[]>({
    queryKey: ["/api/produtos"],
    refetchInterval: false,
  });

  // Formulário de criação
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      nome: "",
      produtoId: 0,
      layout: "padrao",
      url: "",
      config: {},
      ativo: true
    }
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const response = await apiRequest("POST", "/api/checkouts", data);
      const checkout = await response.json();
      
      toast({
        title: "Checkout criado com sucesso",
        description: `O checkout "${checkout.nome}" foi criado.`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      toast({
        title: "Erro ao criar checkout",
        description: "Ocorreu um erro ao criar o checkout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (checkout: Checkout) => {
    setCheckoutToDelete(checkout);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!checkoutToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/checkouts/${checkoutToDelete.id}`);
      
      toast({
        title: "Checkout excluído",
        description: `O checkout "${checkoutToDelete.nome}" foi excluído com sucesso.`
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsDeleteDialogOpen(false);
      setCheckoutToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir checkout:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o checkout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (checkout: Checkout) => {
    // Implementar lógica de edição
    toast({
      title: "Editar checkout",
      description: `Editando checkout "${checkout.nome}"`
    });
  };

  const getProdutoNome = (id: number) => {
    const produto = produtos.find(p => p.id === id);
    return produto ? produto.nome : "Produto não encontrado";
  };

  return (
    <MainLayout pageTitle="Checkout">
      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="novo" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Novo</span>
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>Checkout Link</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>Checkout List</span>
                </TabsTrigger>
                <TabsTrigger value="layout" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Lista de Layout</span>
                </TabsTrigger>
              </TabsList>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Checkout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="novo" className="mt-0">
              <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                <Plus className="h-16 w-16 text-neutral-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Criar Novo Checkout</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Configure um novo checkout para seus produtos. 
                  Você pode personalizar o nome, descrição e produto associado.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Checkout
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="link" className="mt-0">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {checkouts.map((checkout) => (
                  <Card key={checkout.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{checkout.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Layout: {checkout.layout}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(checkout)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(checkout)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="mb-1 flex justify-between">
                          <span className="text-muted-foreground">Produto:</span>
                          <span>{getProdutoNome(checkout.produtoId)}</span>
                        </div>
                        <div className="mb-1 flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={checkout.ativo ? "default" : "outline"}>
                            {checkout.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Copy className="h-3.5 w-3.5" />
                          Copiar Link
                        </Button>
                        <Button size="sm">Visualizar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {checkouts.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Nenhum checkout encontrado. Crie seu primeiro checkout.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Checkout
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <div className="space-y-4">
                <div className="grid gap-4">
                  {checkouts.map((checkout) => (
                    <Card key={checkout.id}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{checkout.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            Layout: {checkout.layout}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={checkout.ativo ? "default" : "outline"}>
                            {checkout.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Copy className="h-3.5 w-3.5" />
                            Copiar
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(checkout)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(checkout)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {checkouts.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Nenhum checkout encontrado. Crie seu primeiro checkout.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Checkout
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Layout Padrão</h3>
                    <p className="text-muted-foreground mb-6">
                      Layout padrão com formulário simples à direita e detalhes do produto à esquerda.
                    </p>
                    <div className="flex justify-between">
                      <Badge variant="outline">Básico</Badge>
                      <Button variant="outline" size="sm">Selecionar</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Layout Premium</h3>
                    <p className="text-muted-foreground mb-6">
                      Layout premium com formulário em etapas, galeria de imagens e depoimentos.
                    </p>
                    <div className="flex justify-between">
                      <Badge variant="outline">Premium</Badge>
                      <Button variant="outline" size="sm">Selecionar</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Dialog de Criar Checkout */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Checkout</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo checkout.
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um layout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="padrao">Padrão</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="basico">Básico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id.toString()}>
                            {produto.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>Criando...</>
                  ) : (
                    <>Criar Checkout</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o checkout "{checkoutToDelete?.nome}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              {checkoutToDelete ? (
                <>Excluir</>
              ) : (
                <>Carregando...</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

// Interface for FormDescription that wasn't imported
interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormDescription({ className, ...props }: FormDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}