import { useState, useEffect, type ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface MainLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  loading?: boolean;
  user?: User | null;
}

export function MainLayout({ children, pageTitle, loading = false, user }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  // Ajuste para fechamento automático do sidebar em mobile ao navegar
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {user && <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} user={user} />}

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