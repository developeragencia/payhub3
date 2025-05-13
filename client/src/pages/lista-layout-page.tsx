import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Download, LayoutTemplate, Monitor, Pencil, Plus, Smartphone, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Layout {
  id: string;
  nome: string;
  tipo: "desktop" | "mobile" | "responsivo";
  categoria: string;
  previewUrl: string;
  dataCriacao: string;
}

// Dados de exemplo que seriam carregados do banco de dados
const layoutsMock: Layout[] = [
  {
    id: "1",
    nome: "Layout Minimalista",
    tipo: "responsivo",
    categoria: "loja",
    previewUrl: "",
    dataCriacao: "2023-10-15",
  },
  {
    id: "2",
    nome: "Layout Colorido",
    tipo: "desktop",
    categoria: "institucional",
    previewUrl: "",
    dataCriacao: "2023-11-02",
  },
  {
    id: "3",
    nome: "Layout Mobile First",
    tipo: "mobile",
    categoria: "blog",
    previewUrl: "",
    dataCriacao: "2023-11-10",
  },
  {
    id: "4",
    nome: "E-commerce Premium",
    tipo: "responsivo",
    categoria: "loja",
    previewUrl: "",
    dataCriacao: "2023-11-18",
  },
];

function LayoutCard({ layout }: { layout: Layout }) {
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDownload = () => {
    toast({
      title: "Download iniciado",
      description: `O download do layout ${layout.nome} foi iniciado.`,
    });
  };

  const copyToClipboard = () => {
    toast({
      title: "Layout copiado",
      description: "O código do layout foi copiado para a área de transferência.",
    });
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md group border border-muted">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <LayoutTemplate className="h-16 w-16 opacity-20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <Button variant="secondary" size="sm" className="mx-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button variant="secondary" size="sm" className="mx-1" onClick={copyToClipboard}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
        {layout.tipo === "desktop" && (
          <div className="absolute top-2 right-2 bg-primary/10 text-primary rounded-full p-1">
            <Monitor className="h-4 w-4" />
          </div>
        )}
        {layout.tipo === "mobile" && (
          <div className="absolute top-2 right-2 bg-secondary/10 text-secondary rounded-full p-1">
            <Smartphone className="h-4 w-4" />
          </div>
        )}
        {layout.tipo === "responsivo" && (
          <div className="absolute top-2 right-2 bg-accent/10 text-accent rounded-full p-1 flex">
            <Monitor className="h-4 w-4" />
            <Smartphone className="h-4 w-4" />
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{layout.nome}</CardTitle>
        <CardDescription>
          Categoria: {layout.categoria.charAt(0).toUpperCase() + layout.categoria.slice(1)}
        </CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-2 flex justify-between">
        <span className="text-xs text-muted-foreground">
          Criado em {new Date(layout.dataCriacao).toLocaleDateString('pt-BR')}
        </span>
        <div className="flex">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleDownload}>
            <span className="sr-only">Download</span>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ListaLayoutPage() {
  const [activeTab, setActiveTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filtrar layouts conforme a aba ativa e o termo de busca
  const filteredLayouts = layoutsMock.filter(layout => {
    const matchesSearch = layout.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         layout.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "todos") return matchesSearch;
    if (activeTab === "desktop") return layout.tipo === "desktop" && matchesSearch;
    if (activeTab === "mobile") return layout.tipo === "mobile" && matchesSearch;
    if (activeTab === "responsivo") return layout.tipo === "responsivo" && matchesSearch;
    
    return false;
  });

  const handleCreateLayout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDialogOpen(false);
    toast({
      title: "Layout criado",
      description: "O novo layout foi criado com sucesso.",
    });
  };

  return (
    <MainLayout pageTitle="Lista de Layout">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Lista de Layouts</h1>
          <p className="text-muted-foreground">
            Gerencie e organize todos os layouts disponíveis para seus checkouts.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Layout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Layout</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar um novo layout personalizado.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateLayout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Layout</Label>
                <Input id="nome" placeholder="Ex: Layout Minimalista" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select defaultValue="responsivo">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="responsivo">Responsivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select defaultValue="loja">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loja">Loja</SelectItem>
                    <SelectItem value="institucional">Institucional</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="html">Código HTML (opcional)</Label>
                <textarea 
                  className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm" 
                  placeholder="Cole o código HTML do layout aqui..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gradient-primary">
                  <Check className="mr-2 h-4 w-4" />
                  Criar Layout
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Pesquisar layouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="desktop">Desktop</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="responsivo">Responsivo</TabsTrigger>
        </TabsList>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLayouts.length > 0 ? (
            filteredLayouts.map((layout) => (
              <LayoutCard key={layout.id} layout={layout} />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center p-8">
                <CardContent className="pt-6 flex flex-col items-center">
                  <LayoutTemplate className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum layout encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? `Não encontramos layouts com o termo "${searchTerm}"`
                      : `Não há layouts ${activeTab !== "todos" ? `do tipo ${activeTab}` : ""} disponíveis.`}
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar novo layout
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Tabs>
    </MainLayout>
  );
}