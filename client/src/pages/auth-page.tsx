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
import { Loader2, CreditCard, Mail, User, Lock, CheckCircle } from "lucide-react";
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
      <div className="fixed inset-0 flex items-center justify-center bg-[#111] z-50">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoggedIn) {
    return null; // Redirecionará via useEffect
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white">
      {/* Background animado */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(120,_0,_255,_0.15),_rgba(0,_0,_0,_0)_70%)]"></div>
        <div className="absolute h-full w-full opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cg fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath opacity=\'.5\' d=\'M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z\'/%3E%3Cpath d=\'M6 5V0H5v5H0v1h5v94h1V6h94V5H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '30px' }}></div>
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 overflow-hidden -z-5">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-purple-600 to-blue-500 opacity-20 animate-float"
            style={{ 
              width: `${Math.random() * 6 + 2}px`, 
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Círculos de gradiente */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 via-fuchsia-500/20 to-transparent rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/4"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-cyan-500/20 to-transparent rounded-full blur-[100px] translate-y-1/4 translate-x-1/4"></div>
      
      {/* Container principal */}
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center relative z-10">
        {/* Logo */}
        <div className="mb-10 md:mb-16 text-center">
          <div className="inline-flex items-center justify-center">
            <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl animate-pulse-slow"></div>
              <div className="absolute inset-0 bg-black rounded-xl m-0.5"></div>
              <CreditCard className="relative z-10 h-6 w-6 md:h-8 md:w-8 text-white" />
              <div className="absolute -right-1 -top-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full animate-pulse"></div>
            </div>
            <h1 className="ml-4 text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">PAYHUB</span>
            </h1>
          </div>
          <p className="mt-3 text-gray-400 max-w-md mx-auto">A plataforma de pagamentos completa para seu negócio</p>
        </div>
        
        {/* Card principal */}
        <div className="w-full max-w-md relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl blur p-0.5 animate-pulse-slow -z-10"></div>
          <Card className="relative bg-black/95 border border-gray-800 rounded-2xl backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              <Tabs 
                defaultValue="login" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-6 pt-6">
                  <TabsList className="grid grid-cols-2 w-full h-12 bg-gray-900/50 p-1 rounded-xl">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-500 data-[state=active]:shadow-lg transition-all duration-300"
                    >
                      Login
                    </TabsTrigger>
                    <TabsTrigger 
                      value="register" 
                      className="rounded-lg py-3 text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:shadow-lg transition-all duration-300"
                    >
                      Cadastro
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="login" className="p-6 pt-8 animate-fade-in">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-300">Nome de usuário</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input 
                                  placeholder="Digite seu usuário" 
                                  {...field} 
                                  className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white transition-all"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <FormLabel className="text-sm font-medium text-gray-300">Senha</FormLabel>
                              <a href="#" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                Esqueceu a senha?
                              </a>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  <Lock className="h-5 w-5" />
                                </div>
                                <Input 
                                  type="password" 
                                  placeholder="Digite sua senha" 
                                  {...field} 
                                  className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-white transition-all"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-xl font-medium text-white shadow-lg shadow-purple-900/20 relative overflow-hidden group"
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
                              "Entrar"
                            )}
                          </span>
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">
                          Não tem uma conta?{" "}
                          <button 
                            onClick={() => setActiveTab("register")}
                            className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
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
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-300">Nome completo</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input 
                                  placeholder="Digite seu nome completo" 
                                  {...field} 
                                  className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-300">E-mail</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <Input 
                                  type="email" 
                                  placeholder="Digite seu e-mail" 
                                  {...field} 
                                  className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm font-medium text-gray-300">Nome de usuário</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                  <User className="h-5 w-5" />
                                </div>
                                <Input 
                                  placeholder="Digite um nome de usuário" 
                                  {...field} 
                                  className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-sm font-medium text-gray-300">Senha</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Lock className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    type="password" 
                                    placeholder="Digite uma senha" 
                                    {...field} 
                                    className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400 text-xs font-medium" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-sm font-medium text-gray-300">Confirmar senha</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Lock className="h-5 w-5" />
                                  </div>
                                  <Input 
                                    type="password" 
                                    placeholder="Confirme sua senha" 
                                    {...field} 
                                    className="bg-gray-900/50 border-gray-800 pl-10 rounded-xl h-12 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-white transition-all"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-400 text-xs font-medium" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="relative flex items-center">
                          <input type="checkbox" id="terms" className="sr-only" />
                          <div className="h-5 w-5 border-2 border-gray-700 rounded flex items-center justify-center bg-gray-900/50">
                            <CheckCircle className="h-3.5 w-3.5 text-purple-500 opacity-0 peer-checked:opacity-100" />
                          </div>
                        </div>
                        <label htmlFor="terms" className="text-sm text-gray-400">
                          Concordo com os <a href="#" className="text-purple-400 hover:text-purple-300">Termos de Uso</a> e <a href="#" className="text-purple-400 hover:text-purple-300">Política de Privacidade</a>
                        </label>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl font-medium text-white shadow-lg shadow-purple-900/20 relative overflow-hidden group"
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
                              "Criar conta"
                            )}
                          </span>
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-400">
                          Já tem uma conta?{" "}
                          <button 
                            onClick={() => setActiveTab("login")}
                            className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
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
        </div>
        
        {/* Recursos */}
        <div className="mt-12 md:mt-16 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center animate-fade-in">
          <div className="bg-gradient-to-b from-gray-900/70 to-black/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm group hover-lift">
            <div className="flex items-center justify-center mx-auto w-12 h-12 mb-4 rounded-lg bg-purple-500/10 text-purple-500">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-white">Pagamentos</h3>
            <p className="text-sm text-gray-400 mt-2">Aceite múltiplos métodos de pagamento.</p>
          </div>
          
          <div className="bg-gradient-to-b from-gray-900/70 to-black/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm group hover-lift">
            <div className="flex items-center justify-center mx-auto w-12 h-12 mb-4 rounded-lg bg-blue-500/10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Checkout</h3>
            <p className="text-sm text-gray-400 mt-2">Experiência de compra simplificada.</p>
          </div>
          
          <div className="bg-gradient-to-b from-gray-900/70 to-black/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm group hover-lift">
            <div className="flex items-center justify-center mx-auto w-12 h-12 mb-4 rounded-lg bg-cyan-500/10 text-cyan-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Produtos</h3>
            <p className="text-sm text-gray-400 mt-2">Gerenciamento completo de produtos.</p>
          </div>
          
          <div className="bg-gradient-to-b from-gray-900/70 to-black/80 p-6 rounded-xl border border-gray-800 backdrop-blur-sm group hover-lift">
            <div className="flex items-center justify-center mx-auto w-12 h-12 mb-4 rounded-lg bg-fuchsia-500/10 text-fuchsia-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white">Webhooks</h3>
            <p className="text-sm text-gray-400 mt-2">Notificações em tempo real.</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in">
          <p className="text-sm text-gray-500">© 2025 PAYHUB. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}