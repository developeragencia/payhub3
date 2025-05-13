import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Usuários
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("usuario"),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nome: true,
  email: true,
});

// Produtos
export const produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco: doublePrecision("preco").notNull(),
  imagem: text("imagem"),
  categoria: text("categoria"),
  ativo: boolean("ativo").notNull().default(true),
});

export const insertProdutoSchema = createInsertSchema(produtos).pick({
  nome: true,
  descricao: true,
  preco: true,
  imagem: true,
  categoria: true,
  ativo: true,
});

// Checkouts
export const checkouts = pgTable("checkouts", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  url: text("url").notNull(),
  produtoId: integer("produtoId").notNull(),
  layout: text("layout").notNull(),
  config: jsonb("config").notNull(),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow(),
  ativo: boolean("ativo").notNull().default(true),
});

export const insertCheckoutSchema = createInsertSchema(checkouts).pick({
  nome: true,
  url: true,
  produtoId: true,
  layout: true,
  config: true,
  ativo: true,
});

// Transações
export const transacoes = pgTable("transacoes", {
  id: serial("id").primaryKey(),
  checkoutId: integer("checkoutId"),
  clienteNome: text("clienteNome").notNull(),
  clienteEmail: text("clienteEmail").notNull(),
  valor: doublePrecision("valor").notNull(),
  moeda: text("moeda").notNull().default("BRL"),
  status: text("status").notNull(),
  metodo: text("metodo").notNull(),
  data: timestamp("data").notNull().defaultNow(),
  referencia: text("referencia").notNull(),
  metadata: jsonb("metadata"),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow(),
});

export const insertTransacaoSchema = createInsertSchema(transacoes).pick({
  checkoutId: true,
  clienteNome: true,
  clienteEmail: true,
  valor: true,
  moeda: true,
  status: true,
  metodo: true,
  referencia: true,
  metadata: true,
  dataCriacao: true,
});

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  evento: text("evento").notNull(),
  url: text("url").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  ultimoStatus: integer("ultimoStatus"),
  ultimaExecucao: timestamp("ultimaExecucao"),
  dados: jsonb("dados"),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow(),
});

export const insertWebhookSchema = createInsertSchema(webhooks).pick({
  evento: true,
  url: true,
  ativo: true,
  ultimoStatus: true,
  ultimaExecucao: true,
  dados: true,
});

// Schema para update de webhook - todos os campos são opcionais
export const updateWebhookSchema = createInsertSchema(webhooks)
  .pick({
    url: true,
    evento: true,
    ativo: true,
    ultimoStatus: true,
    ultimaExecucao: true,
  })
  .partial(); // Torna todos os campos opcionais

// Atividades
export const atividades = pgTable("atividades", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  descricao: text("descricao").notNull(),
  data: timestamp("data").notNull().defaultNow(),
  metadados: jsonb("metadados"),
  icone: text("icone"),
  cor: text("cor"),
  userId: integer("userId"),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow(),
});

export const insertAtividadeSchema = createInsertSchema(atividades).pick({
  tipo: true,
  descricao: true,
  metadados: true,
  icone: true,
  cor: true,
  userId: true,
  dataCriacao: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = z.infer<typeof insertProdutoSchema>;

export type Checkout = typeof checkouts.$inferSelect;
export type InsertCheckout = z.infer<typeof insertCheckoutSchema>;

export type Transacao = typeof transacoes.$inferSelect;
export type InsertTransacao = z.infer<typeof insertTransacaoSchema>;

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type UpdateWebhook = z.infer<typeof updateWebhookSchema>;

export type Atividade = typeof atividades.$inferSelect;
export type InsertAtividade = z.infer<typeof insertAtividadeSchema>;
