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
import { useState, useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import { User } from "@shared/schema";

// Interface simplificada para simulação do contexto de autenticação
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Componente para rotas protegidas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null
  });
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const user = await res.json();
          setAuthState({ user, isLoading: false, error: null });
        } else {
          setAuthState({ user: null, isLoading: false, error: 'Não autenticado' });
          setLocation('/auth');
        }
      } catch (error) {
        setAuthState({ user: null, isLoading: false, error: 'Erro ao verificar autenticação' });
        setLocation('/auth');
      }
    }
    
    checkAuth();
  }, [setLocation]);
  
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!authState.user) {
    return <Redirect to="/auth" />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PrivateRoute>
          <DashboardPage />
        </PrivateRoute>
      </Route>
      <Route path="/produtos">
        <PrivateRoute>
          <ProdutosPage />
        </PrivateRoute>
      </Route>
      <Route path="/checkout">
        <PrivateRoute>
          <CheckoutPage />
        </PrivateRoute>
      </Route>
      <Route path="/operacoes">
        <PrivateRoute>
          <OperacoesPage />
        </PrivateRoute>
      </Route>
      <Route path="/mercadopago-checkout">
        <PrivateRoute>
          <MercadoPagoCheckoutPage />
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
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
