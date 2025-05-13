import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, LockKeyhole, LogOut, RefreshCw, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Schema para atualização de perfil
const profileSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  avatar: z.string().nullable(),
});

// Schema para atualização de senha
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "A senha atual deve ter pelo menos 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação da senha deve ter pelo menos 6 caracteres"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function PerfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const { toast } = useToast();

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("GET", "/api/user");
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          throw new Error("Falha ao carregar dados do usuário");
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do usuário",
          variant: "destructive",
        });
        console.error("Erro ao buscar usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  // Form para edição de perfil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: "",
      email: "",
      avatar: null,
    },
  });

  // Form para mudança de senha
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Preencher formulário quando os dados do usuário estiverem disponíveis
  useEffect(() => {
    if (user) {
      profileForm.reset({
        nome: user.nome,
        email: user.email,
        avatar: user.avatar,
      });
    }
  }, [user, profileForm]);

  // Função para atualizar perfil
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setUpdating(true);
      
      // Fazer requisição para atualizar o perfil
      const res = await apiRequest("PUT", `/api/user/${user?.id}`, data);
      
      if (!res.ok) {
        throw new Error("Falha ao atualizar perfil");
      }
      
      const updatedUser = await res.json();
      setUser(updatedUser);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
      console.error("Erro ao atualizar perfil:", error);
    } finally {
      setUpdating(false);
    }
  };

  // Função para atualizar senha
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setUpdatingPassword(true);
      
      // Fazer requisição para atualizar a senha
      const res = await apiRequest("PUT", `/api/user/${user?.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Falha ao atualizar senha");
      }
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a senha",
        variant: "destructive",
      });
      console.error("Erro ao atualizar senha:", error);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Função para realizar logout
  const handleLogout = async () => {
    try {
      const res = await apiRequest("POST", "/api/logout");
      
      if (res.ok) {
        window.location.href = "/auth";
      } else {
        throw new Error("Falha ao realizar logout");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao realizar logout",
        variant: "destructive",
      });
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <MainLayout pageTitle="Meu Perfil" loading={loading}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gradient">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Visualize e atualize suas informações pessoais.
        </p>
      </div>

      {user && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Seu perfil administrativo</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user.avatar || undefined} alt={user.nome} />
                <AvatarFallback className="text-xl">
                  {user.nome?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-1">{user.nome}</h3>
              <p className="text-muted-foreground mb-2">{user.email}</p>
              <div className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs">
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="destructive" 
                className="w-full flex items-center justify-center"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair da conta
              </Button>
            </CardFooter>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="informacoes">
              <TabsList className="mb-6">
                <TabsTrigger value="informacoes" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Informações Pessoais
                </TabsTrigger>
                <TabsTrigger value="senha" className="flex items-center">
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Segurança
                </TabsTrigger>
              </TabsList>

              <TabsContent value="informacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="avatar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL do Avatar (opcional)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  value={field.value || ''}
                                  placeholder="https://exemplo.com/avatar.jpg"
                                />
                              </FormControl>
                              <FormDescription>
                                URL de uma imagem para seu avatar.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full gradient-primary"
                          disabled={updating}
                        >
                          {updating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Atualizando...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Salvar alterações
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="senha">
                <Card>
                  <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                      Atualize sua senha de acesso.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha atual</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nova senha</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Sua senha deve ter pelo menos 6 caracteres.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar nova senha</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full gradient-accent"
                          disabled={updatingPassword}
                        >
                          {updatingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Atualizando...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Alterar senha
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </MainLayout>
  );
}