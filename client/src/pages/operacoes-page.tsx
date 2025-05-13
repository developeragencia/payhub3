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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Transacao, Webhook, insertWebhookSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Loader2,
  Check,
  DollarSign,
  Webhook as WebhookIcon,
  Eye,
  Download,
  Plus,
  Link2,
  ExternalLink,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Definir o schema para criar/editar webhook
const formSchema = insertWebhookSchema;

export default function OperacoesPage() {
  const [activeTab, setActiveTab] = useState("transacoes");
  const [searchTransacao, setSearchTransacao] = useState("");
  const [searchWebhook, setSearchWebhook] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewTransacaoDialogOpen, setIsViewTransacaoDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [selectedTransacao, setSelectedTransacao] = useState<Transacao | null>(null);
  const { toast } = useToast();
  
  const { data: transacoes = [], isLoading: isLoadingTransacoes } = useQuery<Transacao[]>({
    queryKey: ["/api/transacoes"],
  });

  const { data: webhooks = [], isLoading: isLoadingWebhooks } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
  });

  const filteredTransacoes = searchTransacao
    ? transacoes.filter(t => 
        t.clienteNome.toLowerCase().includes(searchTransacao.toLowerCase()) ||
        t.clienteEmail.toLowerCase().includes(searchTransacao.toLowerCase()) ||
        t.referencia.toLowerCase().includes(searchTransacao.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTransacao.toLowerCase()) ||
        t.metodo.toLowerCase().includes(searchTransacao.toLowerCase())
      )
    : transacoes;

  const filteredWebhooks = searchWebhook
    ? webhooks.filter(w => 
        w.evento.toLowerCase().includes(searchWebhook.toLowerCase()) ||
        w.url.toLowerCase().includes(searchWebhook.toLowerCase())
      )
    : webhooks;

  // Form para criar webhook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evento: "",
      url: "",
      ativo: true
    },
  });

  // Form para editar webhook
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      evento: "",
      url: "",
      ativo: true
    },
  });

  // Mutation para criar webhook
  const createWebhookMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/webhooks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Webhook criado",
        description: "O webhook foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para editar webhook
  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof formSchema> }) => {
      const res = await apiRequest("PUT", `/api/webhooks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsEditDialogOpen(false);
      setSelectedWebhook(null);
      toast({
        title: "Webhook atualizado",
        description: "O webhook foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para excluir webhook
  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsDeleteDialogOpen(false);
      setSelectedWebhook(null);
      toast({
        title: "Webhook excluído",
        description: "O webhook foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir webhook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createWebhookMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedWebhook) {
      updateWebhookMutation.mutate({ id: selectedWebhook.id, data });
    }
  };

  const handleEditWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    editForm.reset({
      evento: webhook.evento,
      url: webhook.url,
      ativo: webhook.ativo
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteWebhook = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWebhook) {
      deleteWebhookMutation.mutate(selectedWebhook.id);
    }
  };

  const handleViewTransacao = (transacao: Transacao) => {
    setSelectedTransacao(transacao);
    setIsViewTransacaoDialogOpen(true);
  };

  // Formatação de data
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obter classe de estilo de status para transações
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluído':
      case 'concluido':
      case 'aprovado':
        return "bg-success bg-opacity-10 text-success";
      case 'pendente':
      case 'processando':
        return "bg-warning bg-opacity-10 text-warning";
      case 'cancelado':
        return "bg-neutral-500 bg-opacity-10 text-neutral-500";
      case 'rejeitado':
      case 'falha':
        return "bg-destructive bg-opacity-10 text-destructive";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };

  return (
    <MainLayout title="Operações" description="Gerenciar transações e webhooks">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="transacoes" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Transações</span>
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="flex items-center gap-2">
                  <WebhookIcon className="h-4 w-4" />
                  <span>Webhooks</span>
                </TabsTrigger>
              </TabsList>
              {activeTab === "webhooks" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Webhook
                </Button>
              )}
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <TabsContent value="transacoes" className="mt-0">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mb-4">
              <div className="relative rounded-md w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-neutral-400 h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar transações"
                  className="pl-10"
                  value={searchTransacao}
                  onChange={(e) => setSearchTransacao(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Filter className="mr-1 h-4 w-4" /> Filtros
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Download className="mr-1 h-4 w-4" /> Exportar
                </Button>
              </div>
            </div>

            {isLoadingTransacoes ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransacoes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma transação encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransacoes.map((transacao) => (
                        <TableRow key={transacao.id} className="hover:bg-neutral-50">
                          <TableCell className="font-medium">
                            #{transacao.referencia}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-7 w-7 mr-2">
                                <AvatarFallback>{transacao.clienteNome.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{transacao.clienteNome}</div>
                                <div className="text-xs text-neutral-500">{transacao.clienteEmail}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(transacao.data)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(transacao.valor)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusClass(transacao.status)}>
                              {transacao.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CreditCard className="mr-1.5 h-4 w-4 text-neutral-500" />
                              {transacao.metodo}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleViewTransacao(transacao)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewTransacao(transacao)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar recibo
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                  Reportar problema
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

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-4">
              <div className="text-sm text-neutral-700">
                Mostrando <span className="font-medium">1</span> de <span className="font-medium">{filteredTransacoes.length}</span> transações
              </div>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="default" size="sm">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <Button variant="outline" size="sm">4</Button>
                <Button variant="outline" size="sm">
                  Próximo
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-0">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mb-4">
              <div className="relative rounded-md w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-neutral-400 h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Buscar webhooks"
                  className="pl-10"
                  value={searchWebhook}
                  onChange={(e) => setSearchWebhook(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-1 h-4 w-4" /> Adicionar Webhook
              </Button>
            </div>

            {isLoadingWebhooks ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">ID</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Execução</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWebhooks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Nenhum webhook encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredWebhooks.map((webhook) => (
                        <TableRow key={webhook.id} className="hover:bg-neutral-50">
                          <TableCell className="font-medium">
                            {webhook.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{webhook.evento}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2 max-w-xs truncate">
                              <span className="truncate text-xs">{webhook.url}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                asChild
                              >
                                <a href={webhook.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {webhook.ativo ? (
                              <Badge variant="outline" className="bg-success bg-opacity-10 text-success">
                                <Check className="mr-1 h-3 w-3" /> Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning">
                                <AlertCircle className="mr-1 h-3 w-3" /> Falha
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {webhook.ultimaExecucao ? formatDate(webhook.ultimaExecucao) : 
                              <span className="text-neutral-400">Nunca executado</span>
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditWebhook(webhook)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Link2 className="h-4 w-4 mr-2" />
                                  Testar conexão
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteWebhook(webhook)}
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
        </CardContent>
      </Card>

      {/* Dialog de Criar Webhook */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Webhook</DialogTitle>
            <DialogDescription>
              Configure um webhook para receber notificações de eventos do sistema.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="evento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento *</FormLabel>
                    <FormControl>
                      <Input placeholder="payment.processed" {...field} />
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
                    <FormLabel>URL do Webhook *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://seusite.com.br/api/webhooks/payment" {...field} />
                    </FormControl>
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
                      <FormLabel>Webhook Ativo</FormLabel>
                      <FormDescription className="text-xs">
                        Quando ativo, o webhook receberá as notificações dos eventos.
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
                  disabled={createWebhookMutation.isPending}
                >
                  {createWebhookMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Adicionar Webhook
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Webhook */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Webhook</DialogTitle>
            <DialogDescription>
              Atualize as configurações do webhook.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="evento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento *</FormLabel>
                    <FormControl>
                      <Input placeholder="payment.processed" {...field} />
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
                    <FormLabel>URL do Webhook *</FormLabel>
                    <FormControl>
                      <Input placeholder="https://seusite.com.br/api/webhooks/payment" {...field} />
                    </FormControl>
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
                      <FormLabel>Webhook Ativo</FormLabel>
                      <FormDescription className="text-xs">
                        Quando ativo, o webhook receberá as notificações dos eventos.
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
                  disabled={updateWebhookMutation.isPending}
                >
                  {updateWebhookMutation.isPending ? (
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

      {/* Dialog de Excluir Webhook */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o webhook para o evento{" "}
              <span className="font-medium">{selectedWebhook?.evento}</span>?
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
              disabled={deleteWebhookMutation.isPending}
            >
              {deleteWebhookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualizar Transação */}
      <Dialog open={isViewTransacaoDialogOpen} onOpenChange={setIsViewTransacaoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a transação.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransacao && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">#{selectedTransacao.referencia}</h3>
                  <p className="text-sm text-neutral-500">{formatDate(selectedTransacao.data)}</p>
                </div>
                <Badge variant="outline" className={getStatusClass(selectedTransacao.status)}>
                  {selectedTransacao.status}
                </Badge>
              </div>
              
              <div className="border-t border-b py-3 my-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Valor</p>
                    <p className="text-base font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(selectedTransacao.valor)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Método de Pagamento</p>
                    <p className="text-base font-medium">{selectedTransacao.metodo}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Cliente</h4>
                <div className="flex items-center rounded-lg border p-3">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{selectedTransacao.clienteNome.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedTransacao.clienteNome}</p>
                    <p className="text-sm text-neutral-500">{selectedTransacao.clienteEmail}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Checkout ID</h4>
                <p className="text-sm">#{selectedTransacao.checkoutId}</p>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewTransacaoDialogOpen(false)}>
                  Fechar
                </Button>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Recibo
                </Button>
              </DialogFooter>
            </div>
          )}
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
