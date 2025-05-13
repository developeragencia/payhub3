import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";

interface HeaderProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  pageTitle?: string;
  user: User;
}

export function Header({ sidebarOpen, toggleSidebar, pageTitle, user }: HeaderProps) {
  const isMobile = useIsMobile();

  async function handleLogout() {
    try {
      const res = await apiRequest("POST", "/api/logout");
      
      if (res.ok) {
        window.location.href = "/auth";
      } else {
        throw new Error("Falha ao realizar logout");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center">
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {pageTitle && (
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Barra de pesquisa - esconder em dispositivos móveis */}
        <div className="hidden md:block md:w-64">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pesquisar..."
              className="w-full rounded-full bg-background pl-8 md:w-[300px] lg:w-[360px]"
            />
          </div>
        </div>

        {/* Ícone de notificações */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || undefined} alt={user?.nome} />
                <AvatarFallback>{user?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.nome}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}