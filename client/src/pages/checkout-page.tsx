import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import { Checkout, Produto, insertCheckoutSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Loader2,
  Check,
  Copy,
  ExternalLink,
  LayoutGrid,
  Link as LinkIcon,
  List,
  FileText
} from "lucide-react";

// Definir valores padrão para a configuração do checkout
const defaultConfig = {
  metodosPagamento: {
    cartaoCredito: true,
    pix: true,
    boleto: false
  },
  campos: {
    endereco: true,
    telefone: true,
    documento: true
  },
  aparencia: {
    corPrimaria: "#3B82F6",
    corSecundaria: "#60A5FA",
    logotipo: ""
  }
};

// Estender o schema para garantir o formato correto de URL
const formSchema = insertCheckoutSchema.extend({
  config: z.any().default(defaultConfig)
});

export default function CheckoutPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<Checkout | null>(null);
  const { toast } = useToast();
  
  const { data: checkouts = [], isLoading: isLoadingCheckouts } = useQuery<Checkout[]>({
    queryKey: ["/api/checkouts"],
  });

  const { data: produtos = [], isLoading: isLoadingProdutos } = useQuery<Produto[]>({
    queryKey: ["/api/produtos"],
  });

  const filteredCheckouts = searchQuery
    ? checkouts.filter(c => 
        c.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : checkouts;

  // Form para criar checkout
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      url: "",
      produtoId: 0,
      layout: "padrao",
      config: defaultConfig,
      ativo: true
    },
  });

  // Form para editar checkout
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      url: "",
      produtoId: 0,
      layout: "padrao",
      config: defaultConfig,
      ativo: true
    },
  });

  // Mutation para criar checkout
  const createCheckoutMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/checkouts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Checkout criado",
        description: "O checkout foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar checkout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para editar checkout
  const updateCheckoutMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof formSchema> }) => {
      const res = await apiRequest("PUT", `/api/checkouts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsEditDialogOpen(false);
      setSelectedCheckout(null);
      toast({
        title: "Checkout atualizado",
        description: "O checkout foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar checkout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir checkout
  const deleteCheckoutMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/checkouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checkouts"] });
      setIsDeleteDialogOpen(false);
      setSelectedCheckout(null);
      toast({
        title: "Checkout excluído",
        description: "O checkout foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir checkout",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createCheckoutMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedCheckout) {
      updateCheckoutMutation.mutate({ id: selectedCheckout.id, data });
    }
  };

  const handleEdit = (checkout: Checkout) => {
    setSelectedCheckout(checkout);
    editForm.reset({
      nome: checkout.nome,
      url: checkout.url,
      produtoId: checkout.produtoId,
      layout: checkout.layout,
      config: checkout.config,
      ativo: checkout.ativo
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (checkout: Checkout) => {
    setSelectedCheckout(checkout);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCheckout) {
      deleteCheckoutMutation.mutate(selectedCheckout.id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copiado",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  // Função para obter o nome do produto pelo ID
  const getProdutoNome = (id: number) => {
    const produto = produtos.find(p => p.id === id);
    return produto ? produto.nome : "Produto não encontrado";
  };

  return (
    <MainLayout title="Checkout" description="Gerencie links e configurações de checkout">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="novo" className="mt-0">
            <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
              <Plus className="h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Criar Novo Checkout</h3>
              <p className="text-neutral-500 max-w-md mb-4">
                Crie um novo checkout para seus produtos ou serviços. Escolha o layout, configure os métodos de pagamento e personalize a aparência.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>Criar Checkout</Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="mt-0">
            <div className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
              <LinkIcon className="h-16 w-16 text-neutral-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gerenciar Links de Checkout</h3>
              <p className="text-neutral-500 max-w-md mb-4">
                Crie e gerencie links de checkout que podem ser compartilhados com seus clientes via e-mail, mensagens ou redes sociais.
              </p>
              <Button onClick={() => setActiveTab("list")}>Ver Links Existentes</Button>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mb-4">
              <div className="relative rounded-md w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-neutral-400 h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar checkouts"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="mr-1 h-4 w-4" /> Filtros
                </Button>
              </div>
            </div>

            {isLoadingCheckouts ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Layout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCheckouts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhum checkout encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCheckouts.map((checkout) => (
                        <TableRow key={checkout.id}>
                          <TableCell>{checkout.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{checkout.nome}</div>
                            <div className="text-xs text-neutral-500">
                              Criado em {new Date(checkout.dataCriacao).toLocaleDateString('pt-BR')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isLoadingProdutos ? (
                              <span className="text-neutral-400">Carregando...</span>
                            ) : (
                              getProdutoNome(checkout.produtoId)
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 max-w-xs truncate">
                              <span className="truncate text-xs">{checkout.url}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(checkout.url)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                asChild
                              >
                                <a href={checkout.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {checkout.layout}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {checkout.ativo ? (
                              <div className="flex items-center text-sm">
                                <div className="h-2 w-2 rounded-full bg-success mr-2"></div>
                                <span>Ativo</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm">
                                <div className="h-2 w-2 rounded-full bg-neutral-300 mr-2"></div>
                                <span>Inativo</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(checkout)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyToClipboard(checkout.url)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar URL
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(checkout)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="layout" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="overflow-hidden">
                <div className="p-2 bg-primary-50">
                  <img 
                    src="https://via.placeholder.com/400x250/f3f4f6/333?text=Layout+Padrão" 
                    alt="Layout Padrão" 
                    className="w-full h-40 object-cover rounded-md" 
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Layout Padrão</h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Layout básico com formulário de dados e opções de pagamento.
                  </p>
                  <div className="flex justify-between">
                    <Badge variant="outline">Padrão</Badge>
                    <Button variant="outline" size="sm">Selecionar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="p-2 bg-primary-50">
                  <img 
                    src="https://via.placeholder.com/400x250/f3f4f6/333?text=Layout+Moderno" 
                    alt="Layout Moderno" 
                    className="w-full h-40 object-cover rounded-md" 
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Layout Moderno</h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Design moderno com detalhes do produto e formulário lateral.
                  </p>
                  <div className="flex justify-between">
                    <Badge variant="outline">Premium</Badge>
                    <Button variant="outline" size="sm">Selecionar</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="p-2 bg-primary-50">
                  <img 
                    src="https://via.placeholder.com/400x250/f3f4f6/333?text=Layout+Minimalista" 
                    alt="Layout Minimalista"  
                    className="w-full h-40 object-cover rounded-md" 
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Layout Minimalista</h3>
                  <p className="text-sm text-neutral-500 mb-3">
                    Design clean e minimalista focado em conversão.
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
                    <FormLabel>Nome do Checkout *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do checkout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://seusite.com.br/checkout/nome-do-checkout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingProdutos ? (
                          <SelectItem value="carregando" disabled>Carregando produtos...</SelectItem>
                        ) : produtos.length === 0 ? (
                          <SelectItem value="nenhum" disabled>Nenhum produto cadastrado</SelectItem>
                        ) : (
                          produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id.toString()}>
                              {produto.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout *</FormLabel>
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
                        <SelectItem value="padrao">Layout Padrão</SelectItem>
                        <SelectItem value="moderno">Layout Moderno</SelectItem>
                        <SelectItem value="minimalista">Layout Minimalista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Checkout Ativo</FormLabel>
                      <FormDescription className="text-xs">
                        Quando ativo, o checkout estará disponível para uso.
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
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Criar Checkout
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Checkout */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Checkout</DialogTitle>
            <DialogDescription>
              Atualize as informações do checkout.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Checkout *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do checkout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://seusite.com.br/checkout/nome-do-checkout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="produtoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produto *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingProdutos ? (
                          <SelectItem value="carregando" disabled>Carregando produtos...</SelectItem>
                        ) : produtos.length === 0 ? (
                          <SelectItem value="nenhum" disabled>Nenhum produto cadastrado</SelectItem>
                        ) : (
                          produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id.toString()}>
                              {produto.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout *</FormLabel>
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
                        <SelectItem value="padrao">Layout Padrão</SelectItem>
                        <SelectItem value="moderno">Layout Moderno</SelectItem>
                        <SelectItem value="minimalista">Layout Minimalista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Checkout Ativo</FormLabel>
                      <FormDescription className="text-xs">
                        Quando ativo, o checkout estará disponível para uso.
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
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={updateCheckoutMutation.isPending}
                >
                  {updateCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Excluir Checkout */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o checkout{" "}
              <span className="font-medium">{selectedCheckout?.nome}</span>?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCheckoutMutation.isPending}
            >
              {deleteCheckoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Checkout
                </>
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
      className="text-sm text-muted-foreground"
      {...props}
    />
  );
}
