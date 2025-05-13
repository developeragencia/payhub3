import { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

type MainLayoutProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  loading?: boolean;
};

export function MainLayout({ children, title, description, loading = false }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <main 
          className="flex-1 overflow-y-auto pb-10 transition-all duration-300"
          style={{ 
            marginLeft: sidebarOpen && !isMobile ? '16rem' : '0' 
          }}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {(title || description) && (
              <div className="mb-6">
                {title && <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>}
                {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
              </div>
            )}
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
