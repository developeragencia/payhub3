import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, Search, LayoutGrid, Filter, Settings, Plus, MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { Produto, InsertProduto, insertProdutoSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatCurrency } from "@/lib/utils";

// Esquema com validação adicional
const produtoSchema = insertProdutoSchema.extend({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres"),
  preco: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
});

type ProdutoFormValues = z.infer<typeof produtoSchema>;

export default function ProdutosPage() {
  const [activeTab, setActiveTab] = useState("produtos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const { toast } = useToast();

  // Buscar produtos
  const { data: produtos = [], isLoading } = useQuery<Produto[]>({
    queryKey: ["/api/produtos"],
    refetchInterval: false,
  });

  // Formulário para criar produto
  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco: 0,
      imagem: "",
      categoria: "curso", // valor padrão
      ativo: true,
    },
  });

  // Formulário para editar produto
  const editForm = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco: 0,
      imagem: "",
      categoria: "curso",
      ativo: true,
    },
  });

  // Mutation para criar produto
  const createProdutoMutation = useMutation({
    mutationFn: async (data: ProdutoFormValues) => {
      const response = await apiRequest("POST", "/api/produtos", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para editar produto
  const updateProdutoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProdutoFormValues }) => {
      const response = await apiRequest("PATCH", `/api/produtos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedProduto(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir produto
  const deleteProdutoMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/produtos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/produtos"] });
      setIsDeleteDialogOpen(false);
      setSelectedProduto(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (produto: Produto) => {
    setSelectedProduto(produto);
    editForm.reset({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      imagem: produto.imagem,
      categoria: produto.categoria,
      ativo: produto.ativo,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = (data: ProdutoFormValues) => {
    createProdutoMutation.mutate(data);
  };

  const onEditSubmit = (data: ProdutoFormValues) => {
    if (selectedProduto) {
      updateProdutoMutation.mutate({ id: selectedProduto.id, data });
    }
  };

  const onDeleteConfirm = () => {
    if (selectedProduto) {
      deleteProdutoMutation.mutate(selectedProduto.id);
    }
  };

  return (
    <MainLayout pageTitle="Produtos">
      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="produtos" className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Produtos</span>
                </TabsTrigger>
                <TabsTrigger value="checkout-builder" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Checkout Builder</span>
                </TabsTrigger>
                <TabsTrigger value="configs" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Configs de Checkout</span>
                </TabsTrigger>
              </TabsList>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="produtos" className="mt-0">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mb-4">
                <div className="relative rounded-md w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-neutral-400 h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Buscar produtos"
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

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtos
                        .filter(p => 
                          p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.categoria.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((produto) => (
                          <TableRow key={produto.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-sm">
                                  {produto.imagem ? (
                                    <AvatarImage src={produto.imagem} alt={produto.nome} />
                                  ) : (
                                    <AvatarFallback className="rounded-sm bg-primary/10 text-primary">
                                      {produto.nome.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <div className="font-medium">{produto.nome}</div>
                                  <div className="text-xs text-muted-foreground line-clamp-1">
                                    {produto.descricao}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{produto.categoria}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(produto.preco)}
                            </TableCell>
                            <TableCell>
                              {produto.ativo ? (
                                <Badge className="bg-success/10 text-success border-success">Ativo</Badge>
                              ) : (
                                <Badge variant="outline">Inativo</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(produto)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(produto)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checkout-builder">
              <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
                <LayoutGrid className="h-16 w-16 text-neutral-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Checkout Builder</h3>
                <p className="text-neutral-500 max-w-md mb-4">
                  Crie e personalize layouts de checkout para seus produtos e serviços.
                </p>
                <Button variant="outline">Começar</Button>
              </div>
            </TabsContent>

            <TabsContent value="configs">
              <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
                <Settings className="h-16 w-16 text-neutral-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Configurações de Checkout</h3>
                <p className="text-neutral-500 max-w-md mb-4">
                  Configure opções globais para todos os seus checkouts, incluindo métodos de pagamento e campos de formulário.
                </p>
                <Button variant="outline">Configurar</Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Dialog de Criar Produto */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Produto</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo produto.
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
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="URL da imagem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="curso">Curso</SelectItem>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="assinatura">Assinatura</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createProdutoMutation.isPending}>
                  {createProdutoMutation.isPending ? "Criando..." : "Criar Produto"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="URL da imagem" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="curso">Curso</SelectItem>
                        <SelectItem value="ebook">E-book</SelectItem>
                        <SelectItem value="assinatura">Assinatura</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
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
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Select
                        value={field.value ? "true" : "false"}
                        onValueChange={(value) => field.onChange(value === "true")}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Ativo</SelectItem>
                          <SelectItem value="false">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Ativar ou desativar este produto
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateProdutoMutation.isPending}>
                  {updateProdutoMutation.isPending ? "Atualizando..." : "Atualizar Produto"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Excluir Produto */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o produto "{selectedProduto?.nome}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteConfirm}
              disabled={deleteProdutoMutation.isPending}
            >
              {deleteProdutoMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}