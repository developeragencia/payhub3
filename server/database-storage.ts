import { 
  users, type User, type InsertUser,
  produtos, type Produto, type InsertProduto,
  checkouts, type Checkout, type InsertCheckout,
  transacoes, type Transacao, type InsertTransacao,
  webhooks, type Webhook, type InsertWebhook, updateWebhookSchema, type UpdateWebhook,
  atividades, type Atividade, type InsertAtividade
} from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, desc } from "drizzle-orm";
import { type IStorage } from "./storage";

// Para seções de usuário
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }

  // Usuários
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Produtos
  async getProduto(id: number): Promise<Produto | undefined> {
    const [produto] = await db.select().from(produtos).where(eq(produtos.id, id));
    return produto;
  }

  async getProdutos(): Promise<Produto[]> {
    return await db.select().from(produtos);
  }

  async createProduto(produto: InsertProduto): Promise<Produto> {
    const [newProduto] = await db.insert(produtos).values(produto).returning();
    return newProduto;
  }

  async updateProduto(id: number, produto: Partial<InsertProduto>): Promise<Produto | undefined> {
    const [updatedProduto] = await db
      .update(produtos)
      .set(produto)
      .where(eq(produtos.id, id))
      .returning();
    return updatedProduto;
  }

  async deleteProduto(id: number): Promise<boolean> {
    const result = await db.delete(produtos).where(eq(produtos.id, id));
    return result.rowCount > 0;
  }

  // Checkouts
  async getCheckout(id: number): Promise<Checkout | undefined> {
    const [checkout] = await db.select().from(checkouts).where(eq(checkouts.id, id));
    return checkout;
  }

  async getCheckouts(): Promise<Checkout[]> {
    return await db.select().from(checkouts);
  }

  async createCheckout(checkout: InsertCheckout): Promise<Checkout> {
    const [newCheckout] = await db.insert(checkouts).values(checkout).returning();
    return newCheckout;
  }

  async updateCheckout(id: number, checkout: Partial<InsertCheckout>): Promise<Checkout | undefined> {
    const [updatedCheckout] = await db
      .update(checkouts)
      .set(checkout)
      .where(eq(checkouts.id, id))
      .returning();
    return updatedCheckout;
  }

  async deleteCheckout(id: number): Promise<boolean> {
    const result = await db.delete(checkouts).where(eq(checkouts.id, id));
    return result.rowCount > 0;
  }

  // Transações
  async getTransacao(id: number): Promise<Transacao | undefined> {
    const [transacao] = await db.select().from(transacoes).where(eq(transacoes.id, id));
    return transacao;
  }

  async getTransacoes(): Promise<Transacao[]> {
    return await db
      .select()
      .from(transacoes)
      .orderBy(desc(transacoes.data));
  }

  async createTransacao(transacao: InsertTransacao): Promise<Transacao> {
    const [newTransacao] = await db.insert(transacoes).values(transacao).returning();
    return newTransacao;
  }

  // Webhooks
  async getWebhook(id: number): Promise<Webhook | undefined> {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }

  async getWebhooks(): Promise<Webhook[]> {
    return await db.select().from(webhooks);
  }

  async createWebhook(webhook: InsertWebhook): Promise<Webhook> {
    const [newWebhook] = await db.insert(webhooks).values(webhook).returning();
    return newWebhook;
  }

  async updateWebhook(id: number, updateData: UpdateWebhook): Promise<Webhook | undefined> {
    const [updatedWebhook] = await db
      .update(webhooks)
      .set(updateData)
      .where(eq(webhooks.id, id))
      .returning();
    return updatedWebhook;
  }

  async deleteWebhook(id: number): Promise<boolean> {
    const result = await db.delete(webhooks).where(eq(webhooks.id, id));
    return result.rowCount > 0;
  }

  // Atividades
  async getAtividade(id: number): Promise<Atividade | undefined> {
    const [atividade] = await db.select().from(atividades).where(eq(atividades.id, id));
    return atividade;
  }

  async getAtividades(): Promise<Atividade[]> {
    return await db
      .select()
      .from(atividades)
      .orderBy(desc(atividades.data));
  }

  async createAtividade(atividade: InsertAtividade): Promise<Atividade> {
    const [newAtividade] = await db.insert(atividades).values(atividade).returning();
    return newAtividade;
  }
}