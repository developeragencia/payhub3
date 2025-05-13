import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { insertUserSchema } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, CreditCard, Mail, User, Lock, CheckCircle2, ArrowRight, Shield, LayoutDashboard, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

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
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoggedIn) {
    return null; // Redirecionará via useEffect
  }
  
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
      
      {/* Container principal */}
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        {/* Lado esquerdo - ilustração e texto */}
        <div className="w-full md:w-1/2 space-y-8 animate-fade-in rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 py-10 px-8 text-white shadow-xl">
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start mb-6">
              <div className="bg-white p-3 rounded-2xl shadow-lg">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="ml-4 text-3xl md:text-4xl font-extrabold text-white">
                PAY<span className="text-blue-200">HUB</span>
              </h1>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              A plataforma completa para <span className="text-blue-200">pagamentos online</span>
            </h2>
            
            <p className="text-lg text-blue-100 max-w-lg">
              Aceite pagamentos, gerencie vendas e acompanhe o crescimento do seu negócio em um único lugar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 staggered-fade-in">
            <FeatureCard 
              icon={<CreditCard className="h-6 w-6 text-white" />}
              title="Pagamentos Seguros"
              description="Processe transações com segurança e facilidade."
            />
            
            <FeatureCard 
              icon={<Wallet className="h-6 w-6 text-white" />}
              title="Múltiplos Métodos"
              description="Cartões, boletos, Pix e muito mais."
            />
            
            <FeatureCard 
              icon={<LayoutDashboard className="h-6 w-6 text-white" />}
              title="Dashboard Completo"
              description="Visualize e gerencie todos os dados em um só lugar."
            />
            
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-white" />}
              title="Proteção Antifraude"
              description="Tecnologia avançada contra fraudes."
            />
          </div>
          
          <div className="pt-6 hidden md:block">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-medium border-2 border-blue-400">JD</div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-medium border-2 border-blue-400">ML</div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-medium border-2 border-blue-400">TS</div>
              </div>
              <div className="text-sm text-blue-100">
                Junte-se a mais de <span className="font-semibold">2,500+</span> empresas
              </div>
            </div>
          </div>
        </div>
        
        {/* Lado direito - formulário */}
        <div className="w-full md:w-1/2 max-w-md mx-auto animate-fade-in">
          <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <Tabs 
                defaultValue="login" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-6 pt-6">
                  <TabsList className="grid grid-cols-2 w-full h-12 bg-gray-100/80 p-1 rounded-lg">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-md py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="rounded-md py-2.5 font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      Cadastro
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="login" className="p-6 pt-8 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Bem-vindo de volta!</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Acesse sua conta para continuar gerenciando seu negócio
                    </p>
                  </div>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-700">Nome de usuário</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input 
                                  placeholder="Digite seu usuário" 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-medium text-gray-700">Senha</FormLabel>
                              <a href="#" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                Esqueceu a senha?
                              </a>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <Lock className="h-5 w-5" />
                                </div>
                                <Input 
                                  type="password" 
                                  placeholder="Digite sua senha" 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
                          Lembrar-me
                        </label>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 relative overflow-hidden group"
                          disabled={isPending}
                        >
                          {/* Efeito de brilho */}
                          <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></span>
                          
                          <span className="relative flex items-center justify-center">
                            {isPending ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Entrando...
                              </>
                            ) : (
                              <>
                                Entrar
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                      
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                          Não tem uma conta?{" "}
                          <button 
                            onClick={() => setActiveTab("register")}
                            className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                            type="button"
                          >
                            Cadastre-se
                          </button>
                        </p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="register" className="p-6 pt-8 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Crie sua conta</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Comece a aceitar pagamentos em minutos
                    </p>
                  </div>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-700">Nome completo</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input 
                                  placeholder="Digite seu nome completo" 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-700">E-mail</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <Input 
                                  type="email" 
                                  placeholder="Digite seu e-mail" 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-700">Nome de usuário</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input 
                                  placeholder="Digite um nome de usuário" 
                                  {...field} 
                                  className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-500 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-sm font-medium text-gray-700">Senha</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    type="password" 
                                    placeholder="Digite uma senha" 
                                    {...field} 
                                    className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs font-medium" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-sm font-medium text-gray-700">Confirmar senha</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    type="password" 
                                    placeholder="Confirme sua senha" 
                                    {...field} 
                                    className="bg-gray-50 border-gray-200 pl-10 rounded-lg h-11 focus:border-blue-500 focus:ring-blue-500"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs font-medium" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          Concordo com os <a href="#" className="text-blue-600 hover:underline">Termos de Uso</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
                        </label>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 relative overflow-hidden group"
                          disabled={isPending}
                        >
                          {/* Efeito de brilho */}
                          <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-out"></span>
                          
                          <span className="relative flex items-center justify-center">
                            {isPending ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Cadastrando...
                              </>
                            ) : (
                              <>
                                Criar conta
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                      
                      <div className="text-center pt-4">
                        <p className="text-sm text-gray-600">
                          Já tem uma conta?{" "}
                          <button 
                            onClick={() => setActiveTab("login")}
                            className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                            type="button"
                          >
                            Faça login
                          </button>
                        </p>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Empresas parceiras */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-3">EMPRESAS QUE CONFIAM NO PAYHUB</p>
            <div className="flex justify-center items-center space-x-6 opacity-70">
              <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center">Logo</div>
              <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center">Logo</div>
              <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center">Logo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de card de recursos
function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-5 bg-blue-500/20 backdrop-blur-sm rounded-xl shadow-sm border border-blue-300/30 hover:bg-blue-500/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-blue-100 mt-1">{description}</p>
      </div>
    </div>
  );
}