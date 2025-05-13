import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { insertUserSchema } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ShoppingCart, CreditCard, BarChart3, Zap, Lock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const { toast } = useToast();
  
  // Verificar se o usuário já está autenticado
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          setIsLoggedIn(true);
          setLocation("/");
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [setLocation]);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsPending(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const user = await response.json();
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${user.nome || user.username}!`,
        });
        setLocation("/");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Credenciais inválidas");
      }
    } catch (error) {
      toast({
        title: "Falha no login",
        description: error instanceof Error ? error.message : "Erro ao fazer login",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsPending(true);
    try {
      const { confirmPassword, ...formData } = data;
      // Adicionar campos obrigatórios que não foram capturados pelo formulário
      const registerData = {
        ...formData,
        role: "user",
        avatar: null
      };
      
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      if (response.ok) {
        const user = await response.json();
        toast({
          title: "Conta criada com sucesso",
          description: `Bem-vindo, ${user.nome}!`,
        });
        setLocation("/");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar conta");
      }
    } catch (error) {
      toast({
        title: "Falha no cadastro",
        description: error instanceof Error ? error.message : "Erro ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isLoggedIn) {
    return null; // Redirecionará via useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      {/* Header com logo */}
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative w-10 h-10 overflow-hidden bg-gradient-to-br from-primary/80 to-secondary/80 rounded-lg shadow-lg p-2 mr-3">
            <ShoppingCart className="text-white" />
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 animate-pulse-slow rounded-lg"></div>
          </div>
          <h1 className="text-xl font-bold text-foreground">E-Commerce<span className="text-gradient-accent font-bold">Admin</span></h1>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Formulário (lado esquerdo) */}
        <div className="w-full max-w-md animate-fade-in">
          <Tabs 
            defaultValue="login" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6 border-gradient-animated p-1 rounded-lg bg-background">
              <TabsTrigger value="login" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white transition-all duration-500">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-500">
                Cadastro
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-zoom-in">
              <Card className="border-0 shadow-xl card-gradient overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-lg"></div>
                <CardHeader className="space-y-1 relative">
                  <CardTitle className="text-2xl font-bold">
                    <span className="text-gradient-shimmer">Bem-vindo de volta</span>
                  </CardTitle>
                  <CardDescription>
                    Faça login para acessar o painel administrativo
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Usuário</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Digite seu nome de usuário" 
                                {...field} 
                                className="border-primary/20 hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Digite sua senha" 
                                {...field} 
                                className="border-primary/20 hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <div className="flex items-center">
                          <input type="checkbox" id="remember" className="rounded text-primary focus:ring-primary mr-2" />
                          <label htmlFor="remember" className="text-muted-foreground hover:text-foreground cursor-pointer">Lembrar-me</label>
                        </div>
                        <a href="#" className="text-primary hover:text-primary/80 transition-colors">Esqueceu a senha?</a>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-2 hover-lift border-gradient-animated hover:shadow-primary/20 relative overflow-hidden group"
                        disabled={isPending}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                        <span className="relative text-white flex items-center justify-center">
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Entrando...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Entrar
                            </>
                          )}
                        </span>
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-6 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-card px-3 text-xs text-muted-foreground">
                          OU
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-4 text-sm text-muted-foreground">
                      Não tem uma conta?{" "}
                      <button 
                        onClick={() => setActiveTab("register")}
                        className="text-gradient-accent font-medium hover:opacity-80 transition-opacity"
                      >
                        Cadastre-se agora
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register" className="animate-zoom-in">
              <Card className="border-0 shadow-xl card-gradient overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-accent/5 to-secondary/5 rounded-lg"></div>
                <CardHeader className="space-y-1 relative">
                  <CardTitle className="text-2xl font-bold">
                    <span className="text-gradient-shimmer">Crie sua conta</span>
                  </CardTitle>
                  <CardDescription>
                    Preencha os campos abaixo para se cadastrar
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3">
                      <FormField
                        control={registerForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Digite seu nome completo" 
                                {...field} 
                                className="border-secondary/20 hover:border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Digite seu e-mail" 
                                {...field} 
                                className="border-secondary/20 hover:border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Digite um nome de usuário" 
                                {...field} 
                                className="border-secondary/20 hover:border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Digite uma senha" 
                                  {...field} 
                                  className="border-secondary/20 hover:border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel>Confirmar senha</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Confirme sua senha" 
                                  {...field} 
                                  className="border-secondary/20 hover:border-secondary focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center mt-1">
                        <input type="checkbox" id="terms" className="rounded text-secondary focus:ring-secondary mr-2" />
                        <label htmlFor="terms" className="text-sm text-muted-foreground">
                          Concordo com os <a href="#" className="text-secondary hover:underline">Termos de Uso</a> e <a href="#" className="text-secondary hover:underline">Política de Privacidade</a>
                        </label>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-2 hover-lift border-gradient-animated hover:shadow-secondary/20 relative overflow-hidden group"
                        disabled={isPending}
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-90 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></span>
                        <span className="relative text-white flex items-center justify-center">
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cadastrando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Criar conta
                            </>
                          )}
                        </span>
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Já tem uma conta?{" "}
                      <button 
                        onClick={() => setActiveTab("login")}
                        className="text-gradient-accent font-medium hover:opacity-80 transition-opacity"
                      >
                        Faça login
                      </button>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Parte direita - recursos */}
        <div className="hidden lg:flex w-full max-w-lg flex-col gap-6 staggered-fade-in">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2 text-gradient">Painel Administrativo Completo</h2>
            <p className="text-muted-foreground">
              Gerencie seu negócio online com nossa plataforma completa e integrada
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<ShoppingCart className="h-8 w-8 text-primary mb-2" />}
              title="Gestão de Produtos"
              description="Cadastre e gerencie produtos com facilidade."
              delay={0.1}
            />
            
            <FeatureCard 
              icon={<CreditCard className="h-8 w-8 text-secondary mb-2" />}
              title="Checkout Personalizado"
              description="Crie layouts de checkout personalizados."
              delay={0.2}
            />
            
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-accent mb-2" />}
              title="Controle de Transações"
              description="Acompanhe pagamentos e status de pedidos."
              delay={0.3}
            />
            
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-warning mb-2" />}
              title="Webhooks Integrados"
              description="Receba notificações em tempo real."
              delay={0.4}
            />
          </div>
          
          {/* Círculos decorativos */}
          <div className="hidden lg:block absolute top-1/4 right-12 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
          <div className="hidden lg:block absolute bottom-1/4 right-24 w-40 h-40 bg-gradient-to-br from-secondary/10 to-accent/5 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="container mx-auto p-4 text-center text-sm text-muted-foreground mt-auto">
        <p>© 2025 E-CommerceAdmin. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

// Componente de card de recursos
function FeatureCard({ icon, title, description, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <div 
      className="p-4 rounded-lg border border-muted card-gradient hover-lift" 
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex flex-col items-center text-center">
        {icon}
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}