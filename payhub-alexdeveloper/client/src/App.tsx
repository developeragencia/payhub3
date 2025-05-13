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
import { useAuth } from "@/hooks/use-auth";
import React from "react";

// Componente para rotas protegidas
// PrivateRoute com uso de useAuth + props para o MainLayout
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Passa o usuário para os componentes filhos através de React.cloneElement se for um único filho
  // ou React.Children.map se forem múltiplos filhos
  if (React.isValidElement(children)) {
    // Caso seja um único elemento
    return React.cloneElement(children, { user });
  } else if (Array.isArray(children)) {
    // Caso seja um array de elementos
    return <>{React.Children.map(children, child => 
      React.isValidElement(child) ? React.cloneElement(child, { user }) : child
    )}</>;
  }
  
  // Se estiver autenticado, renderiza o conteúdo protegido normalmente
  return <>{children}</>;
}

// Importações das novas páginas
import DashboardPadraoPage from "@/pages/dashboard-padrao-page";
import CheckoutLinkPage from "@/pages/checkout-link-page";
import ListaLayoutPage from "@/pages/lista-layout-page";
import ClientesPage from "@/pages/clientes-page";
import PerfilPage from "@/pages/perfil-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/pagamento" component={PagamentoPage} />
      <Route path="/transacao/sucesso" component={TransacaoStatusPage} />
      <Route path="/transacao/falha" component={TransacaoStatusPage} />
      <Route path="/transacao/pendente" component={TransacaoStatusPage} />
      
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
      <Route path="/clientes">
        <PrivateRoute>
          <ClientesPage />
        </PrivateRoute>
      </Route>
      <Route path="/perfil">
        <PrivateRoute>
          <PerfilPage />
        </PrivateRoute>
      </Route>
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
