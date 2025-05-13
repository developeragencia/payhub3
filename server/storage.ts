import { 
  users, type User, type InsertUser,
  produtos, type Produto, type InsertProduto,
  checkouts, type Checkout, type InsertCheckout,
  transacoes, type Transacao, type InsertTransacao,
  webhooks, type Webhook, type InsertWebhook,
  atividades, type Atividade, type InsertAtividade
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface de armazenamento
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Produtos
  getProduto(id: number): Promise<Produto | undefined>;
  getProdutos(): Promise<Produto[]>;
  createProduto(produto: InsertProduto): Promise<Produto>;
  updateProduto(id: number, produto: Partial<InsertProduto>): Promise<Produto | undefined>;
  deleteProduto(id: number): Promise<boolean>;
  
  // Checkouts
  getCheckout(id: number): Promise<Checkout | undefined>;
  getCheckouts(): Promise<Checkout[]>;
  createCheckout(checkout: InsertCheckout): Promise<Checkout>;
  updateCheckout(id: number, checkout: Partial<InsertCheckout>): Promise<Checkout | undefined>;
  deleteCheckout(id: number): Promise<boolean>;
  
  // Transações
  getTransacao(id: number): Promise<Transacao | undefined>;
  getTransacoes(): Promise<Transacao[]>;
  createTransacao(transacao: InsertTransacao): Promise<Transacao>;
  
  // Webhooks
  getWebhook(id: number): Promise<Webhook | undefined>;
  getWebhooks(): Promise<Webhook[]>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
  updateWebhook(id: number, webhook: Partial<InsertWebhook>): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  
  // Atividades
  getAtividade(id: number): Promise<Atividade | undefined>;
  getAtividades(): Promise<Atividade[]>;
  createAtividade(atividade: InsertAtividade): Promise<Atividade>;
  
  // Store de sessão para autenticação
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private produtos: Map<number, Produto>;
  private checkouts: Map<number, Checkout>;
  private transacoes: Map<number, Transacao>;
  private webhooks: Map<number, Webhook>;
  private atividades: Map<number, Atividade>;
  
  currentUserId: number;
  currentProdutoId: number;
  currentCheckoutId: number;
  currentTransacaoId: number;
  currentWebhookId: number;
  currentAtividadeId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.produtos = new Map();
    this.checkouts = new Map();
    this.transacoes = new Map();
    this.webhooks = new Map();
    this.atividades = new Map();
    
    this.currentUserId = 1;
    this.currentProdutoId = 1;
    this.currentCheckoutId = 1;
    this.currentTransacaoId = 1;
    this.currentWebhookId = 1;
    this.currentAtividadeId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 horas
    });
    
    // Criar dados iniciais de exemplo
    this.setupInitialData();
  }

  // Métodos de usuários
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Métodos de produtos
  async getProduto(id: number): Promise<Produto | undefined> {
    return this.produtos.get(id);
  }
  
  async getProdutos(): Promise<Produto[]> {
    return Array.from(this.produtos.values());
  }
  
  async createProduto(insertProduto: InsertProduto): Promise<Produto> {
    const id = this.currentProdutoId++;
    const produto: Produto = { ...insertProduto, id };
    this.produtos.set(id, produto);
    return produto;
  }
  
  async updateProduto(id: number, updateProduto: Partial<InsertProduto>): Promise<Produto | undefined> {
    const produto = this.produtos.get(id);
    if (!produto) return undefined;
    
    const updatedProduto = { ...produto, ...updateProduto };
    this.produtos.set(id, updatedProduto);
    return updatedProduto;
  }
  
  async deleteProduto(id: number): Promise<boolean> {
    return this.produtos.delete(id);
  }
  
  // Métodos de checkouts
  async getCheckout(id: number): Promise<Checkout | undefined> {
    return this.checkouts.get(id);
  }
  
  async getCheckouts(): Promise<Checkout[]> {
    return Array.from(this.checkouts.values());
  }
  
  async createCheckout(insertCheckout: InsertCheckout): Promise<Checkout> {
    const id = this.currentCheckoutId++;
    const checkout: Checkout = { 
      ...insertCheckout, 
      id, 
      dataCriacao: new Date()
    };
    this.checkouts.set(id, checkout);
    return checkout;
  }
  
  async updateCheckout(id: number, updateCheckout: Partial<InsertCheckout>): Promise<Checkout | undefined> {
    const checkout = this.checkouts.get(id);
    if (!checkout) return undefined;
    
    const updatedCheckout = { ...checkout, ...updateCheckout };
    this.checkouts.set(id, updatedCheckout);
    return updatedCheckout;
  }
  
  async deleteCheckout(id: number): Promise<boolean> {
    return this.checkouts.delete(id);
  }
  
  // Métodos de transações
  async getTransacao(id: number): Promise<Transacao | undefined> {
    return this.transacoes.get(id);
  }
  
  async getTransacoes(): Promise<Transacao[]> {
    return Array.from(this.transacoes.values());
  }
  
  async createTransacao(insertTransacao: InsertTransacao): Promise<Transacao> {
    const id = this.currentTransacaoId++;
    const transacao: Transacao = { 
      ...insertTransacao, 
      id, 
      data: new Date() 
    };
    this.transacoes.set(id, transacao);
    return transacao;
  }
  
  // Métodos de webhooks
  async getWebhook(id: number): Promise<Webhook | undefined> {
    return this.webhooks.get(id);
  }
  
  async getWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values());
  }
  
  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const id = this.currentWebhookId++;
    const webhook: Webhook = { 
      ...insertWebhook, 
      id, 
      ultimaExecucao: null,
      ultimoStatus: null
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }
  
  async updateWebhook(id: number, updateWebhook: Partial<InsertWebhook>): Promise<Webhook | undefined> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return undefined;
    
    const updatedWebhook = { ...webhook, ...updateWebhook };
    this.webhooks.set(id, updatedWebhook);
    return updatedWebhook;
  }
  
  async deleteWebhook(id: number): Promise<boolean> {
    return this.webhooks.delete(id);
  }
  
  // Métodos de atividades
  async getAtividade(id: number): Promise<Atividade | undefined> {
    return this.atividades.get(id);
  }
  
  async getAtividades(): Promise<Atividade[]> {
    return Array.from(this.atividades.values()).sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }
  
  async createAtividade(insertAtividade: InsertAtividade): Promise<Atividade> {
    const id = this.currentAtividadeId++;
    const atividade: Atividade = { 
      ...insertAtividade, 
      id, 
      data: new Date() 
    };
    this.atividades.set(id, atividade);
    return atividade;
  }
  
  // Configure dados iniciais
  private setupInitialData() {
    // Criar usuário de exemplo (admin) - senha temporária simples para testes
    this.users.set(1, {
      id: 1,
      username: "admin",
      password: "admin123", // FIXME: Esta é uma senha temporária para desenvolvimento, será substituída por hash na produção
      nome: "Administrador",
      email: "admin@exemplo.com",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin"
    });
    
    // Criar produto de exemplo
    this.createProduto({
      nome: "Curso de Marketing Digital",
      descricao: "Curso completo sobre marketing digital e estratégias de vendas",
      preco: 199.90,
      imagem: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      categoria: "Cursos",
      ativo: true
    });
    
    // Criar webhook de exemplo
    this.createWebhook({
      evento: "payment.processed",
      url: "https://api.seusite.com.br/webhooks/payments",
      ativo: true
    });
    
    // Criar uma transação de exemplo
    this.createTransacao({
      checkoutId: 1,
      clienteNome: "Maria Oliveira",
      clienteEmail: "maria@exemplo.com",
      valor: 1458.90,
      status: "Concluído",
      metodo: "Cartão de Crédito",
      referencia: "TRX-78945"
    });
    
    // Criar atividades de exemplo
    this.createAtividade({
      tipo: "usuario",
      descricao: "Novo cliente registrado - Carlos Santos se registrou no sistema",
      icone: "user-add-line",
      cor: "primary",
      userId: null
    });
    
    this.createAtividade({
      tipo: "transacao",
      descricao: "Transação concluída - Transação #TRX-78945 foi concluída com sucesso",
      icone: "checkbox-circle-line",
      cor: "success",
      userId: null
    });
    
    this.createAtividade({
      tipo: "sistema",
      descricao: "Notificação de sistema - Atualização de sistema programada para 20/05/2023",
      icone: "error-warning-line",
      cor: "warning",
      userId: null
    });
  }
}

export const storage = new MemStorage();
