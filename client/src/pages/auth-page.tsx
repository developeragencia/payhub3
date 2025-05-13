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
import { Loader2, CreditCard, CheckCircle2, Mail, User, Lock, ArrowRight, Building } from "lucide-react";
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#020024] via-[#090979] to-[#0099cc]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-blue-500 animate-spin"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent border-cyan-500 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoggedIn) {
    return null; // Redirecionará via useEffect
  }
  
  return (
    <div className="min-h-screen bg-[#f8fbff] dark:bg-[#0b101b] relative flex flex-col overflow-hidden">
      {/* Formas decorativas */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-cyan-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gradient-to-br from-cyan-300/10 to-blue-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="container mx-auto py-8 px-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
              <CreditCard className="text-white h-5 w-5" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse-slow"></div>
          </div>
          <h1 className="text-3xl font-extrabold dark:text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">PAY</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">HUB</span>
          </h1>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center md:justify-between gap-12 z-10">
        {/* Lado Esquerdo - Informações */}
        <div className="w-full max-w-lg order-2 md:order-1 animate-slide-right">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
              Plataforma completa de <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500">pagamentos</span> para o seu negócio
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Aceite pagamentos, gerencie suas transações e acompanhe o crescimento do seu negócio em um único lugar.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 staggered-fade-in">
              <div className="bg-white dark:bg-gray-800/40 rounded-xl p-4 shadow-sm hover-lift flex items-start gap-4 border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg p-2 text-white">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pagamentos Integrados</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Integração com múltiplos gateways de pagamento</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800/40 rounded-xl p-4 shadow-sm hover-lift flex items-start gap-4 border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-400 rounded-lg p-2 text-white">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Checkout Personalizado</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Layouts personalizáveis para seus checkouts</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800/40 rounded-xl p-4 shadow-sm hover-lift flex items-start gap-4 border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-500 rounded-lg p-2 text-white">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Gestão Empresarial</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Controle total sobre produtos e transações</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800/40 rounded-xl p-4 shadow-sm hover-lift flex items-start gap-4 border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-400 rounded-lg p-2 text-white">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Segurança Avançada</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Proteção para você e seus clientes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lado Direito - Formulários */}
        <div className="w-full max-w-md order-1 md:order-2 animate-slide-left">
          <div className="bg-white dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm relative">
            {/* Efeito de gradiente animado na borda */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-10"></div>
              <div className="absolute -top-[60%] -left-[10%] w-[500px] h-[200px] bg-blue-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
              <div className="absolute -bottom-[60%] -right-[10%] w-[500px] h-[200px] bg-indigo-500/20 blur-[100px] rounded-full animate-pulse-slow"></div>
            </div>
            
            <div className="relative z-10">
              <Tabs 
                defaultValue="login" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-6 pt-6">
                  <TabsList className="grid grid-cols-2 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-md py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="rounded-md py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      Cadastro
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="login" className="animate-zoom-in p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bem-vindo de volta!</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Acesse sua conta para gerenciar seu negócio
                      </p>
                    </div>
                    
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-gray-700 dark:text-gray-300">Usuário</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    placeholder="Digite seu nome de usuário" 
                                    {...field}
                                    className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
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
                              <div className="flex justify-between items-center">
                                <FormLabel className="text-gray-700 dark:text-gray-300">Senha</FormLabel>
                                <a href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
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
                                    className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 rounded-lg font-medium relative overflow-hidden group"
                            disabled={isPending}
                          >
                            <span className="absolute right-full w-12 h-full bg-white/20 skew-x-[30deg] z-10 group-hover:animate-shine"></span>
                            <span className="relative flex items-center justify-center gap-2">
                              {isPending ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Entrando...
                                </>
                              ) : (
                                <>
                                  Entrar 
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                            </span>
                          </Button>
                        </div>
                        
                        <div className="relative flex items-center gap-3 py-2">
                          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">OU</span>
                          <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                      
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Ainda não tem uma conta?{" "}
                          <button 
                            onClick={() => setActiveTab("register")}
                            className="text-blue-600 dark:text-blue-400 font-medium hover:underline transition-all"
                            type="button"
                          >
                            Cadastre-se agora
                          </button>
                        </p>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="animate-zoom-in p-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crie sua conta</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Comece a aceitar pagamentos em minutos
                      </p>
                    </div>
                    
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-gray-700 dark:text-gray-300">Nome completo</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    placeholder="Digite seu nome completo" 
                                    {...field} 
                                    className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>
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
                              <FormLabel className="text-gray-700 dark:text-gray-300">E-mail</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    type="email" 
                                    placeholder="Digite seu e-mail" 
                                    {...field} 
                                    className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>
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
                              <FormLabel className="text-gray-700 dark:text-gray-300">Nome de usuário</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <User className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    placeholder="Digite um nome de usuário" 
                                    {...field} 
                                    className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem className="space-y-1">
                                <FormLabel className="text-gray-700 dark:text-gray-300">Senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                      <Lock className="h-5 w-5" />
                                    </div>
                                    <Input 
                                      type="password" 
                                      placeholder="Digite uma senha" 
                                      {...field} 
                                      className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                  </div>
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
                                <FormLabel className="text-gray-700 dark:text-gray-300">Confirmar senha</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                      <Lock className="h-5 w-5" />
                                    </div>
                                    <Input 
                                      type="password" 
                                      placeholder="Confirme sua senha" 
                                      {...field} 
                                      className="pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 rounded-lg h-11 transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <input type="checkbox" id="terms" className="rounded text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 h-4 w-4" />
                          <label htmlFor="terms" className="text-xs text-gray-600 dark:text-gray-400">
                            Concordo com os <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Termos de Uso</a> e <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Política de Privacidade</a>
                          </label>
                        </div>
                        
                        <div className="pt-2">
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600 transition-all duration-300 rounded-lg font-medium relative overflow-hidden group"
                            disabled={isPending}
                          >
                            <span className="absolute right-full w-12 h-full bg-white/20 skew-x-[30deg] z-10 group-hover:animate-shine"></span>
                            <span className="relative flex items-center justify-center gap-2">
                              {isPending ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Cadastrando...
                                </>
                              ) : (
                                <>
                                  Criar conta
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                            </span>
                          </Button>
                        </div>
                        
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Já tem uma conta?{" "}
                          <button 
                            onClick={() => setActiveTab("login")}
                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline transition-all"
                            type="button"
                          >
                            Faça login
                          </button>
                        </p>
                      </form>
                    </Form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm z-10">
        <div className="container mx-auto px-4">
          <p>© 2025 PAYHUB. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Termos</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
      
      {/* Efeito de brilho animado no canto */}
      <div className="fixed -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full animate-pulse-slow"></div>
    </div>
  );
}