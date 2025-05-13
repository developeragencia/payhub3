import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCcw,
  User,
  UserPlus,
  Filter,
  FileText,
  Download,
  UserCheck,
  UserX,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Esquema do formulário de cliente
const clienteFormSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpfCnpj: z
    .string()
    .min(11, "CPF/CNPJ deve ter pelo menos 11 caracteres")
    .max(18, "CPF/CNPJ deve ter no máximo 18 caracteres"),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
});

// Tipo do cliente baseado no schema
type Cliente = z.infer<typeof clienteFormSchema> & {
  id: number;
  dataCriacao: string;
};

// Componente principal da página de clientes
export default function ClientesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(null);
  const [termoBusca, setTermoBusca] = useState("");

  // Busca todos os clientes
  const { data: clientes, isLoading } = useQuery<Cliente[]>({
    queryKey: ["/api/clientes"],
    queryFn: async () => {
      const res = await fetch("/api/clientes");
      if (!res.ok) throw new Error("Falha ao carregar clientes");
      return res.json();
    },
  });

  // Filtra clientes com base nos critérios
  const clientesFiltrados = clientes
    ? clientes
        .filter((cliente) =>
          filtroAtivo !== null ? cliente.ativo === filtroAtivo : true
        )
        .filter((cliente) => {
          if (!termoBusca) return true;
          const termo = termoBusca.toLowerCase();
          return (
            cliente.nome.toLowerCase().includes(termo) ||
            cliente.email.toLowerCase().includes(termo) ||
            cliente.cpfCnpj.toLowerCase().includes(termo) ||
            (cliente.telefone &&
              cliente.telefone.toLowerCase().includes(termo)) ||
            (cliente.cidade && cliente.cidade.toLowerCase().includes(termo))
          );
        })
    : [];

  // Formulário para criação/edição de cliente
  const form = useForm<z.infer<typeof clienteFormSchema>>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpfCnpj: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: "",
      ativo: true,
    },
  });

  // Cria um novo cliente
  const createClienteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof clienteFormSchema>) => {
      const response = await apiRequest("POST", "/api/clientes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      setOpenDialog(false);
      form.reset();
      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso!",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Atualiza um cliente existente
  const updateClienteMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: z.infer<typeof clienteFormSchema>;
    }) => {
      const response = await apiRequest("PUT", `/api/clientes/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      setOpenDialog(false);
      setClienteEditando(null);
      form.reset();
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Exclui um cliente
  const deleteClienteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/clientes/${id}`);
      if (!response.ok) {
        throw new Error("Falha ao excluir cliente");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso!",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Configura o formulário para edição
  function editarCliente(cliente: Cliente) {
    setClienteEditando(cliente);
    form.reset({
      nome: cliente.nome,
      email: cliente.email,
      cpfCnpj: cliente.cpfCnpj,
      telefone: cliente.telefone || "",
      endereco: cliente.endereco || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      cep: cliente.cep || "",
      observacoes: cliente.observacoes || "",
      ativo: cliente.ativo,
    });
    setOpenDialog(true);
  }

  // Limpa o formulário para criar novo cliente
  function novoCliente() {
    setClienteEditando(null);
    form.reset({
      nome: "",
      email: "",
      cpfCnpj: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: "",
      ativo: true,
    });
    setOpenDialog(true);
  }

  // Envia o formulário
  function onSubmit(data: z.infer<typeof clienteFormSchema>) {
    if (clienteEditando) {
      updateClienteMutation.mutate({ id: clienteEditando.id, data });
    } else {
      createClienteMutation.mutate(data);
    }
  }

  // Formatação de data
  function formatarData(dataString: string) {
    const data = new Date(dataString);
    return format(data, "dd/MM/yyyy", { locale: ptBR });
  }

  // Render da página
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gerenciamento de Clientes
            </h1>
            <p className="text-muted-foreground">
              Cadastre e gerencie os clientes da sua empresa
            </p>
          </div>
          <Button
            onClick={novoCliente}
            className="bg-gradient-to-r from-primary to-primary-accent hover:opacity-90 transition-all"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        <Tabs defaultValue="lista" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lista">Lista de Clientes</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, e-mail, CPF/CNPJ..."
                  className="pl-8"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    if (value === "todos") setFiltroAtivo(null);
                    else if (value === "ativos") setFiltroAtivo(true);
                    else setFiltroAtivo(false);
                  }}
                  defaultValue="todos"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Clientes</SelectItem>
                    <SelectItem value="ativos">Clientes Ativos</SelectItem>
                    <SelectItem value="inativos">Clientes Inativos</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["/api/clientes"],
                    });
                    setTermoBusca("");
                    setFiltroAtivo(null);
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Clientes</CardTitle>
                <CardDescription>
                  {isLoading
                    ? "Carregando clientes..."
                    : `Total: ${clientesFiltrados.length} ${
                        filtroAtivo !== null
                          ? filtroAtivo
                            ? "(ativos)"
                            : "(inativos)"
                          : ""
                      }`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          E-mail
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          CPF/CNPJ
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Telefone
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">
                          Cadastro
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Carregando clientes...
                          </TableCell>
                        </TableRow>
                      ) : clientesFiltrados.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center h-24 text-muted-foreground"
                          >
                            Nenhum cliente encontrado
                          </TableCell>
                        </TableRow>
                      ) : (
                        clientesFiltrados.map((cliente) => (
                          <TableRow key={cliente.id}>
                            <TableCell className="font-medium">
                              #{cliente.id}
                            </TableCell>
                            <TableCell>{cliente.nome}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {cliente.email}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {cliente.cpfCnpj}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {cliente.telefone || "-"}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              {formatarData(cliente.dataCriacao)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  cliente.ativo
                                    ? "bg-green-500 hover:bg-green-600"
                                    : "bg-red-500 hover:bg-red-600"
                                }
                              >
                                {cliente.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => editarCliente(cliente)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Excluir Cliente
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja excluir o cliente{" "}
                                        <strong>{cliente.nome}</strong>? Esta
                                        ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancelar
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          deleteClienteMutation.mutate(cliente.id)
                                        }
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Última atualização:{" "}
                  {format(new Date(), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="estatisticas">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Total de Clientes</CardTitle>
                  <CardDescription>Todos os clientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {clientes ? clientes.length : "..."}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Clientes Ativos</CardTitle>
                  <CardDescription>Cadastros ativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-green-500">
                    {clientes
                      ? clientes.filter((c) => c.ativo).length
                      : "..."}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">Clientes Inativos</CardTitle>
                  <CardDescription>Cadastros inativos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-500">
                    {clientes
                      ? clientes.filter((c) => !c.ativo).length
                      : "..."}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Diálogo para criação/edição de cliente */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {clienteEditando ? "Editar Cliente" : "Novo Cliente"}
              </DialogTitle>
              <DialogDescription>
                {clienteEditando
                  ? "Atualize os dados do cliente"
                  : "Preencha os dados para cadastrar um novo cliente"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome completo"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="exemplo@email.com"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpfCnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="000.000.000-00"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Rua, número, bairro"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cidade"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AC">Acre</SelectItem>
                              <SelectItem value="AL">Alagoas</SelectItem>
                              <SelectItem value="AP">Amapá</SelectItem>
                              <SelectItem value="AM">Amazonas</SelectItem>
                              <SelectItem value="BA">Bahia</SelectItem>
                              <SelectItem value="CE">Ceará</SelectItem>
                              <SelectItem value="DF">Distrito Federal</SelectItem>
                              <SelectItem value="ES">Espírito Santo</SelectItem>
                              <SelectItem value="GO">Goiás</SelectItem>
                              <SelectItem value="MA">Maranhão</SelectItem>
                              <SelectItem value="MT">Mato Grosso</SelectItem>
                              <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                              <SelectItem value="MG">Minas Gerais</SelectItem>
                              <SelectItem value="PA">Pará</SelectItem>
                              <SelectItem value="PB">Paraíba</SelectItem>
                              <SelectItem value="PR">Paraná</SelectItem>
                              <SelectItem value="PE">Pernambuco</SelectItem>
                              <SelectItem value="PI">Piauí</SelectItem>
                              <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                              <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                              <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                              <SelectItem value="RO">Rondônia</SelectItem>
                              <SelectItem value="RR">Roraima</SelectItem>
                              <SelectItem value="SC">Santa Catarina</SelectItem>
                              <SelectItem value="SP">São Paulo</SelectItem>
                              <SelectItem value="SE">Sergipe</SelectItem>
                              <SelectItem value="TO">Tocantins</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações sobre o cliente"
                            {...field}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Cliente ativo
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-primary to-primary-accent hover:opacity-90 transition-all"
                    disabled={
                      createClienteMutation.isPending ||
                      updateClienteMutation.isPending
                    }
                  >
                    {createClienteMutation.isPending ||
                    updateClienteMutation.isPending
                      ? "Salvando..."
                      : clienteEditando
                      ? "Atualizar Cliente"
                      : "Criar Cliente"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}