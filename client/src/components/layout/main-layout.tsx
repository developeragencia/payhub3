import { useState, useEffect, type ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  loading?: boolean;
}

export function MainLayout({ children, pageTitle, loading = false }: MainLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiRequest("GET", "/api/user");
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Redirecionar para página de login se não estiver autenticado
          window.location.href = "/auth";
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao carregar dados do usuário",
          variant: "destructive",
        });
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Ajuste para fechamento automático do sidebar em mobile ao navegar
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} user={user} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          pageTitle={pageTitle}
          user={user} 
        />

        <main className="flex-1 overflow-y-auto px-4 py-8 md:px-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Carregando...</span>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}