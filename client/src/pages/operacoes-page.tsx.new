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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Transacao,
  Webhook,
  insertWebhookSchema,
  InsertWebhook,
  updateWebhookSchema
} from "@shared/schema";
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
  AlertCircle,
  Copy
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Definir o schema para criar/editar webhook
const formSchema = insertWebhookSchema;

export default function OperacoesPage() {
  const [activeTab, setActiveTab] = useState("transacoes");
  const [searchTransacao, setSearchTransacao] = useState("");
  const [searchWebhook, setSearchWebhook] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const { toast } = useToast();
  
  // Buscar todas as transações
  const { data: transacoes = [], isLoading: isLoadingTransacoes } = useQuery<Transacao[]>({
    queryKey: ["/api/transacoes"],
    refetchInterval: false,
  });
  
  // Buscar todos os webhooks
  const { data: webhooks = [], isLoading: isLoadingWebhooks } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
    refetchInterval: false,
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
      ativo: true,
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
      const res = await apiRequest("PATCH", `/api/webhooks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      setIsEditDialogOpen(false);
      form.reset();
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

  const onCreateSubmit = (data: z.infer<typeof formSchema>) => {
    createWebhookMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (selectedWebhook) {
      updateWebhookMutation.mutate({ id: selectedWebhook.id, data });
    }
  };

  const onDeleteConfirm = () => {
    if (selectedWebhook) {
      deleteWebhookMutation.mutate(selectedWebhook.id);
    }
  };

  const handleEdit = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    form.reset({
      evento: webhook.evento,
      url: webhook.url,
      ativo: webhook.ativo,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
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
    <MainLayout pageTitle="Operações">
      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-3">
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
              ) : filteredTransacoes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Referência</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransacoes.map((transacao) => (
                        <TableRow key={transacao.id}>
                          <TableCell className="font-medium">{transacao.id}</TableCell>
                          <TableCell>{formatDate(transacao.data)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {transacao.clienteNome.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm">{transacao.clienteNome}</span>
                                <span className="text-xs text-muted-foreground">{transacao.clienteEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(transacao.valor)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span>{transacao.metodo}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(transacao.status)}
                            >
                              {transacao.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-xs font-mono">{transacao.referencia.substring(0, 12)}...</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
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
              ) : filteredWebhooks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum webhook encontrado</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Execução</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWebhooks.map((webhook) => (
                        <TableRow key={webhook.id}>
                          <TableCell className="font-medium">{webhook.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <WebhookIcon className="h-4 w-4 text-primary" />
                              <span>{webhook.evento}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs font-mono max-w-[200px] truncate">{webhook.url}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {webhook.ativo ? (
                                <Badge className="bg-success/10 text-success border-success">Ativo</Badge>
                              ) : (
                                <Badge variant="outline">Inativo</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {webhook.ultimaExecucao ? formatDateTime(webhook.ultimaExecucao) : "Nunca executado"}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => handleView(webhook)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(webhook)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(webhook)}>
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
          </CardContent>
        </Tabs>
      </Card>

      {/* Formulário para criar webhook */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Webhook</DialogTitle>
            <DialogDescription>
              Adicione um novo webhook para receber notificações de eventos.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="evento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="refund">Reembolso</SelectItem>
                        <SelectItem value="subscription">Assinatura</SelectItem>
                        <SelectItem value="dispute">Disputa</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="https://exemplo.com/webhook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {createWebhookMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>Criar Webhook</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Formulário para editar webhook */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Webhook</DialogTitle>
            <DialogDescription>
              Atualize as informações do webhook.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="evento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um evento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="payment">Pagamento</SelectItem>
                        <SelectItem value="refund">Reembolso</SelectItem>
                        <SelectItem value="subscription">Assinatura</SelectItem>
                        <SelectItem value="dispute">Disputa</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="https://exemplo.com/webhook" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Status</FormLabel>
                      <FormDescription>
                        Ativar ou desativar este webhook
                      </FormDescription>
                    </div>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  {updateWebhookMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>Atualizar</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão de webhook */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Webhook</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este webhook? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onDeleteConfirm}>
              {deleteWebhookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>Excluir</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para visualizar webhook */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Webhook</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o webhook.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">ID</div>
              <div className="p-2 bg-muted rounded-md">{selectedWebhook?.id}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Evento</div>
              <div className="p-2 bg-muted rounded-md">{selectedWebhook?.evento}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">URL</div>
              <div className="flex justify-between">
                <div className="p-2 bg-muted rounded-md flex-grow overflow-hidden">
                  <span className="text-xs font-mono break-all">{selectedWebhook?.url}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedWebhook?.url || "");
                    toast({
                      title: "URL copiada",
                      description: "A URL do webhook foi copiada para a área de transferência.",
                      duration: 3000,
                    });
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Última Execução</div>
              <div className="p-2 bg-muted rounded-md">
                {selectedWebhook?.ultimaExecucao ? formatDate(selectedWebhook.ultimaExecucao) : 'Nunca executado'}
              </div>
            </div>

            {selectedWebhook?.dados && (
              <div>
                <div className="text-sm font-medium mb-1">Dados</div>
                <div className="p-2 bg-muted rounded-md overflow-auto max-h-60">
                  <pre className="text-xs whitespace-pre-wrap">
                    {
                      (() => {
                        try {
                          if (typeof selectedWebhook.dados === 'string') {
                            return selectedWebhook.dados;
                          } else {
                            return JSON.stringify(selectedWebhook.dados, null, 2);
                          }
                        } catch (e) {
                          return "Erro ao processar dados";
                        }
                      })()
                    }
                  </pre>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

// TypeScript não estava presente nos imports
interface FormDescription extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormDescription({ className, ...props }: FormDescription) {
  return (
    <p
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    />
  );
}