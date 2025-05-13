import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreHorizontal,
  CreditCard
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface Transaction {
  id: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
  };
  date: string;
  amount: string;
  status: "Concluído" | "Pendente" | "Cancelado" | "Rejeitado";
  method: string;
}

const transactions: Transaction[] = [
  {
    id: "TRX-78945",
    customer: {
      name: "Maria Oliveira",
      email: "maria@exemplo.com",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    date: "15/05/2023 14:32",
    amount: "R$ 1.458,90",
    status: "Concluído",
    method: "Cartão de Crédito"
  }
];

const statusStyles = {
  Concluído: "bg-success bg-opacity-10 text-success",
  Pendente: "bg-warning bg-opacity-10 text-warning",
  Cancelado: "bg-neutral-500 bg-opacity-10 text-neutral-500",
  Rejeitado: "bg-destructive bg-opacity-10 text-destructive",
};

export function TransactionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="p-5 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-neutral-900">Transações Recentes</CardTitle>
          <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-700 p-0">
            Ver Todas <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mb-4">
          <div className="relative rounded-md w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-neutral-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Buscar transações"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        
        <div className="overflow-x-auto -mx-5">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Cliente</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Data</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Valor</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">Método</TableHead>
                <TableHead className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-neutral-50">
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900">
                    #{transaction.id}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                    <div className="flex items-center">
                      <Avatar className="h-7 w-7 mr-2">
                        <AvatarImage src={transaction.customer.avatar} alt={transaction.customer.name} />
                        <AvatarFallback>{transaction.customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div>{transaction.customer.name}</div>
                        <div className="text-xs text-neutral-500">{transaction.customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {transaction.amount}
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                    <Badge variant="outline" className={cn("px-2 py-1 text-xs font-medium rounded-full", statusStyles[transaction.status])}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-neutral-700">
                    <div className="flex items-center">
                      <CreditCard className="mr-1.5 h-4 w-4 text-neutral-500" />
                      {transaction.method}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-primary">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-primary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Imprimir recibo</DropdownMenuItem>
                        <DropdownMenuItem>Notificar cliente</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200 mt-4">
          <div className="text-sm text-neutral-700">
            Mostrando <span className="font-medium">1</span> de <span className="font-medium">24.508</span> transações
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              variant={currentPage === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(1)}
            >
              1
            </Button>
            <Button
              variant={currentPage === 2 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(2)}
            >
              2
            </Button>
            <Button
              variant={currentPage === 3 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(3)}
            >
              3
            </Button>
            <Button
              variant={currentPage === 4 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(4)}
            >
              4
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
