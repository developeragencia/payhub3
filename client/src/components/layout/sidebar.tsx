import { useState } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, 
  LayoutGrid, 
  ShoppingBag, 
  ShoppingCart, 
  FileInput, 
  ArrowRight, 
  ListChecks, 
  LayoutList, 
  CircleDollarSign, 
  Webhook, 
  ChevronDown, 
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

function NavItem({ href, icon, children, active, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
          active
            ? "bg-primary-50 text-primary-700"
            : "text-neutral-700 hover:bg-neutral-100"
        )}
        onClick={onClick}
      >
        <span className="mr-3 text-lg">{icon}</span>
        <span>{children}</span>
      </a>
    </Link>
  );
}

type NavGroupProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function NavGroup({ title, icon, children, defaultOpen = false }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <div className="pb-2">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center">
          <span className="mr-3 text-lg">{icon}</span>
          <span>{title}</span>
        </div>
        {open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      <div
        className={cn(
          "space-y-1 ml-8 mt-1 overflow-hidden transition-all",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Sidebar({ sidebarOpen }: { sidebarOpen: boolean }) {
  const [location] = useLocation();
  
  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 fixed inset-y-0 top-[56px] pt-2 bg-white border-r border-neutral-200 transition-all duration-300 z-30 lg:ml-0",
          sidebarOpen ? "ml-0" : "-ml-64"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="px-3 py-2 flex-1 overflow-y-auto">
            <nav className="space-y-1">
              <div className="pb-2">
                <span className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Dashboards</span>
                <NavItem 
                  href="/" 
                  icon={<LayoutDashboard />} 
                  active={location === "/" || location === "/dashboard"}
                >
                  Dashboard Admin
                </NavItem>
                <NavItem 
                  href="/dashboard-padrao" 
                  icon={<LayoutGrid />} 
                  active={location === "/dashboard-padrao"}
                >
                  Dashboard Padrão
                </NavItem>
              </div>
              
              <NavGroup 
                title="Produtos" 
                icon={<ShoppingBag />}
                defaultOpen={location.startsWith("/produtos")}
              >
                <NavItem 
                  href="/produtos/checkout-builder" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/produtos/checkout-builder"}
                >
                  Checkout Builder
                </NavItem>
                <NavItem 
                  href="/produtos/configs-checkout" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/produtos/configs-checkout"}
                >
                  Configs de Checkout
                </NavItem>
              </NavGroup>
              
              <NavGroup 
                title="Checkout" 
                icon={<ShoppingCart />}
                defaultOpen={location.startsWith("/checkout")}
              >
                <NavItem 
                  href="/checkout/novo" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/checkout/novo"}
                >
                  Novo
                </NavItem>
                <NavItem 
                  href="/checkout/link" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/checkout/link"}
                >
                  Checkout Link
                </NavItem>
                <NavItem 
                  href="/checkout/list" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/checkout/list"}
                >
                  Checkout List
                </NavItem>
                <NavItem 
                  href="/checkout/layout" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/checkout/layout"}
                >
                  Lista de Layout
                </NavItem>
              </NavGroup>
              
              <NavGroup 
                title="Operações" 
                icon={<CircleDollarSign />}
                defaultOpen={location.startsWith("/operacoes")}
              >
                <NavItem 
                  href="/operacoes/transacoes" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/operacoes/transacoes"}
                >
                  Transações
                </NavItem>
                <NavItem 
                  href="/operacoes/webhooks" 
                  icon={<ArrowRight size={18} />} 
                  active={location === "/operacoes/webhooks"}
                >
                  Webhooks
                </NavItem>
              </NavGroup>
            </nav>
          </div>
          
          <div className="p-4 border-t border-neutral-200">
            <div className="bg-primary-50 rounded-lg p-3">
              <p className="text-xs font-medium text-primary-800">Precisa de ajuda?</p>
              <p className="text-xs text-primary-700 mt-1">Nosso suporte está disponível 24/7.</p>
              <Button
                size="sm"
                className="mt-2 w-full py-1.5 text-xs font-medium"
              >
                Contatar Suporte
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile backdrop */}
      <div
        onClick={() => sidebarOpen}
        className={cn(
          "fixed inset-0 bg-black transition-opacity duration-300 lg:hidden z-20",
          sidebarOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
    </>
  );
}
