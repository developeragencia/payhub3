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
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
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
          description: `Bem-vindo, ${user.nome}!`,
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
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-md animate-fade-in">
            <Tabs 
              defaultValue="login" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-1">
                <TabsTrigger value="login" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white transition-all duration-300">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-white transition-all duration-300">
                  Cadastro
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="animate-slide-up">
                <Card className="hover-shadow border border-primary/10">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-gradient">Entre na sua conta</CardTitle>
                    <CardDescription>
                      Informe seu nome de usuário e senha para acessar o painel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de usuário</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite seu nome de usuário" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Digite sua senha" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full gradient-primary hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg" 
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Entrando...
                            </>
                          ) : (
                            "Entrar"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 text-center">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-muted"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <div className="bg-background px-2 text-xs text-muted-foreground">
                            OU
                          </div>
                        </div>
                      </div>
                      
                      <p className="mt-4 text-sm text-muted-foreground">
                        Não tem uma conta?{" "}
                        <button 
                          onClick={() => setActiveTab("register")}
                          className="text-gradient-accent font-semibold hover:opacity-80 transition-opacity"
                        >
                          Cadastre-se agora
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register" className="animate-slide-up">
                <Card className="hover-shadow border border-secondary/10">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                      Crie sua conta
                    </CardTitle>
                    <CardDescription>
                      Preencha os campos abaixo para criar uma nova conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite seu nome completo" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Digite seu e-mail" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome de usuário</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite um nome de usuário" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Digite uma senha" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar senha</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirme sua senha" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isPending}
                        >
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Cadastrando...
                            </>
                          ) : (
                            "Cadastrar"
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-neutral-600">
                        Já tem uma conta?{" "}
                        <button 
                          onClick={() => setActiveTab("login")}
                          className="text-primary hover:underline font-medium"
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
        </div>
        
        <div className="hidden lg:flex flex-col justify-center">
          <div className="max-w-lg">
            <h1 className="text-3xl font-bold text-primary">Painel Administrativo de E-Commerce</h1>
            <p className="mt-4 text-neutral-600">
              Bem-vindo ao seu painel administrativo completo para gerenciar seu negócio online. 
              Gerencie produtos, checkouts, transações e acompanhe o desempenho do seu negócio em tempo real.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <ShoppingBagIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium text-neutral-900">Gestão de Produtos</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Organize seu catálogo de produtos com facilidade
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <ShoppingCartIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium text-neutral-900">Checkout Builder</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Crie páginas de checkout personalizadas
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <ActivityIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium text-neutral-900">Análise de Vendas</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Acompanhe suas métricas em tempo real
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <WebhookIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium text-neutral-900">Webhooks</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Integre com outros serviços e aplicações
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function WebhookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.43-2.22-.26-3.12a4 4 0 1 1 6.5-4.8" />
      <path d="m18 17 1.25-2.75a4 4 0 1 0-7.5-3.5" />
    </svg>
  );
}
