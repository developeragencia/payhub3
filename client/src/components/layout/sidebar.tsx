import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  UserCircle,
  Home,
  Package,
  ShoppingCart,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  XIcon,
  ChevronRight,
  Users
} from "lucide-react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  user: User | null | undefined;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  badge?: number;
  active: boolean;
}

function NavItem({ href, icon, text, badge, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "mb-1 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer",
          active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {icon}
        <span className="ml-3 flex-1">{text}</span>
        {badge !== undefined && (
          <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
}

export function Sidebar({ sidebarOpen, toggleSidebar, user }: SidebarProps) {
  const [location] = useLocation();
  const { toast } = useToast();

  const isActive = (path: string) => location === path;

  async function handleLogout() {
    try {
      const res = await apiRequest("POST", "/api/logout");
      
      if (res.ok) {
        window.location.href = "/auth";
      } else {
        throw new Error("Falha ao realizar logout");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao realizar logout",
        variant: "destructive"
      });
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <>
      {/* Overlay para mobile - aparece quando o sidebar está aberto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header do Sidebar */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-primary">MercadoPago Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Perfil do Usuário */}
        <div className="border-b px-4 py-4">
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatar || undefined} alt={user?.nome} />
              <AvatarFallback>{user?.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-foreground">{user?.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 overflow-y-auto p-2">
          <NavItem
            href="/"
            icon={<Home className="h-5 w-5" />}
            text="Dashboard Admin"
            active={isActive("/")}
          />
          <NavItem
            href="/dashboard-padrao"
            icon={<Home className="h-5 w-5" />}
            text="Dashboard Padrão"
            active={isActive("/dashboard-padrao")}
          />
          <NavItem
            href="/produtos"
            icon={<Package className="h-5 w-5" />}
            text="Produtos"
            active={isActive("/produtos")}
          />
          <NavItem
            href="/checkouts"
            icon={<ShoppingCart className="h-5 w-5" />}
            text="Checkout Builder"
            active={isActive("/checkouts")}
          />
          <NavItem
            href="/checkout-link"
            icon={<ShoppingCart className="h-5 w-5" />}
            text="Checkout Link"
            active={isActive("/checkout-link")}
          />
          <NavItem
            href="/lista-layout"
            icon={<Settings className="h-5 w-5" />}
            text="Lista de Layout"
            active={isActive("/lista-layout")}
          />
          <NavItem
            href="/transacoes"
            icon={<CreditCard className="h-5 w-5" />}
            text="Transações"
            active={isActive("/transacoes")}
          />
          <NavItem
            href="/clientes"
            icon={<Users className="h-5 w-5" />}
            text="Clientes"
            active={isActive("/clientes")}
          />
          <NavItem
            href="/perfil"
            icon={<UserCircle className="h-5 w-5" />}
            text="Meu Perfil"
            active={isActive("/perfil")}
          />
          <div className="py-4">
            <div className="mx-3 h-px bg-border" />
          </div>
          <button
            onClick={handleLogout}
            className="mb-1 flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3 flex-1">Sair</span>
          </button>
        </nav>
      </div>

      {/* Mobile toggle button que aparece quando o sidebar está fechado */}
      {!sidebarOpen && (
        <div className="fixed bottom-4 left-4 z-20 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="rounded-full shadow-md"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}