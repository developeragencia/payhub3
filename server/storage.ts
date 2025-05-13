import { 
  type User, type InsertUser,
  type Produto, type InsertProduto,
  type Checkout, type InsertCheckout,
  type Transacao, type InsertTransacao,
  type Webhook, type InsertWebhook, type UpdateWebhook,
  type Atividade, type InsertAtividade
} from "@shared/schema";
import session from "express-session";

// Interface de armazenamento
export interface IStorage {
  // Usuários
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
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
  updateWebhook(id: number, webhook: UpdateWebhook): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  
  // Atividades
  getAtividade(id: number): Promise<Atividade | undefined>;
  getAtividades(): Promise<Atividade[]>;
  createAtividade(atividade: InsertAtividade): Promise<Atividade>;
  
  // Store de sessão para autenticação
  sessionStore: session.Store;
}

// Exporta a instância do DatabaseStorage
import { DatabaseStorage } from "./database-storage";
export const storage = new DatabaseStorage();