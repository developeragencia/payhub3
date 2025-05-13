import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Bell, MenuIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
};

export function Header({ sidebarOpen, toggleSidebar }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [_, setLocation] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/auth");
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="mr-3 lg:hidden text-neutral-600 hover:text-primary transition-colors"
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            <MenuIcon size={22} />
          </button>
          <h1 className="text-xl font-semibold text-neutral-800 truncate mr-6">
            <span className="lg:hidden">Painel</span>
            <span className="hidden lg:inline">Painel de Controle</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neutral-600 hover:text-primary transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive"></span>
            </Button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.nome || "Usuário"} />
                  <AvatarFallback>{user?.nome ? getInitials(user.nome) : "U"}</AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-neutral-800">
                  {user?.nome || "Usuário"}
                </span>
                <ChevronDown size={16} className="text-neutral-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setLocation("/perfil")}
              >
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer"
                onClick={() => setLocation("/configuracoes")}
              >
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
