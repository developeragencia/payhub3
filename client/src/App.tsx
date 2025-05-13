import { Switch, Route, Redirect, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import ProdutosPage from "@/pages/produtos-page";
import CheckoutPage from "@/pages/checkout-page";
import OperacoesPage from "@/pages/operacoes-page";
import MercadoPagoCheckoutPage from "@/pages/mercadopago-checkout";
import PagamentoPage from "@/pages/pagamento-page";
import TransacaoStatusPage from "@/pages/transacao-status-page";
import { Loader2 } from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType | null>(null);

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}

// Provider para o contexto de autenticação
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Verificar autenticação ao montar o componente
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiRequest("GET", "/api/user");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          setError("Não autenticado");
          setUser(null);
        }
      } catch (error) {
        setError("Erro ao verificar autenticação");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  // Função para fazer logout
  const logout = async () => {
    try {
      const res = await apiRequest("POST", "/api/logout");
      if (res.ok) {
        setUser(null);
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
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Componente para rotas protegidas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/auth");
    }
  }, [isLoading, user, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return <>{children}</>;
}

// Importações das novas páginas
import DashboardPadraoPage from "@/pages/dashboard-padrao-page";
import CheckoutLinkPage from "@/pages/checkout-link-page";
import ListaLayoutPage from "@/pages/lista-layout-page";
import PerfilPage from "@/pages/perfil-page";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      </Route>
      <Route path="/dashboard-padrao">
        <PrivateRoute>
          <DashboardPadraoPage />
        </PrivateRoute>
      </Route>
      <Route path="/produtos">
        <PrivateRoute>
          <ProdutosPage />
        </PrivateRoute>
      </Route>
      <Route path="/checkouts">
        <PrivateRoute>
          <CheckoutPage />
        </PrivateRoute>
      </Route>
      <Route path="/checkout-link">
        <PrivateRoute>
          <CheckoutLinkPage />
        </PrivateRoute>
      </Route>
      <Route path="/lista-layout">
        <PrivateRoute>
          <ListaLayoutPage />
        </PrivateRoute>
      </Route>
      <Route path="/webhooks">
        <PrivateRoute>
          <OperacoesPage />
        </PrivateRoute>
      </Route>
      <Route path="/transacoes">
        <PrivateRoute>
          <MercadoPagoCheckoutPage />
        </PrivateRoute>
      </Route>
      <Route path="/perfil">
        <PrivateRoute>
          <PerfilPage />
        </PrivateRoute>
      </Route>
      <Route path="/pagamento" component={PagamentoPage} />
      <Route path="/transacao/sucesso" component={TransacaoStatusPage} />
      <Route path="/transacao/falha" component={TransacaoStatusPage} />
      <Route path="/transacao/pendente" component={TransacaoStatusPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
