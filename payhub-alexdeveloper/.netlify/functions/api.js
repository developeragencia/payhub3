var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// functions/api.js
import express from "express";
import serverless from "serverless-http";
import session3 from "express-session";
import cors from "cors";

// server/auth-new.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  atividades: () => atividades,
  checkouts: () => checkouts,
  clientes: () => clientes,
  insertAtividadeSchema: () => insertAtividadeSchema,
  insertCheckoutSchema: () => insertCheckoutSchema,
  insertClienteSchema: () => insertClienteSchema,
  insertProdutoSchema: () => insertProdutoSchema,
  insertTransacaoSchema: () => insertTransacaoSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebhookSchema: () => insertWebhookSchema,
  produtos: () => produtos,
  transacoes: () => transacoes,
  updateWebhookSchema: () => updateWebhookSchema,
  users: () => users,
  webhooks: () => webhooks
});
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("usuario"),
  avatar: text("avatar")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  nome: true,
  email: true
});
var produtos = pgTable("produtos", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  preco: doublePrecision("preco").notNull(),
  imagem: text("imagem"),
  categoria: text("categoria"),
  ativo: boolean("ativo").notNull().default(true)
});
var insertProdutoSchema = createInsertSchema(produtos).pick({
  nome: true,
  descricao: true,
  preco: true,
  imagem: true,
  categoria: true,
  ativo: true
});
var checkouts = pgTable("checkouts", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  url: text("url").notNull(),
  produtoId: integer("produtoId").notNull(),
  layout: text("layout").notNull(),
  config: jsonb("config").notNull(),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow(),
  ativo: boolean("ativo").notNull().default(true)
});
var insertCheckoutSchema = createInsertSchema(checkouts).pick({
  nome: true,
  url: true,
  produtoId: true,
  layout: true,
  config: true,
  ativo: true
});
var transacoes = pgTable("transacoes", {
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
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow()
});
var insertTransacaoSchema = createInsertSchema(transacoes).pick({
  checkoutId: true,
  clienteNome: true,
  clienteEmail: true,
  valor: true,
  moeda: true,
  status: true,
  metodo: true,
  referencia: true,
  metadata: true,
  dataCriacao: true
});
var webhooks = pgTable("webhooks", {
  id: serial("id").primaryKey(),
  evento: text("evento").notNull(),
  url: text("url").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  ultimoStatus: integer("ultimoStatus"),
  ultimaExecucao: timestamp("ultimaExecucao"),
  dados: jsonb("dados"),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow()
});
var insertWebhookSchema = createInsertSchema(webhooks).pick({
  evento: true,
  url: true,
  ativo: true,
  ultimoStatus: true,
  ultimaExecucao: true,
  dados: true
});
var updateWebhookSchema = createInsertSchema(webhooks).pick({
  url: true,
  evento: true,
  ativo: true,
  ultimoStatus: true,
  ultimaExecucao: true
}).partial();
var atividades = pgTable("atividades", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  descricao: text("descricao").notNull(),
  data: timestamp("data").notNull().defaultNow(),
  metadados: jsonb("metadados"),
  icone: text("icone"),
  cor: text("cor"),
  userId: integer("userId"),
  dataCriacao: timestamp("dataCriacao").notNull().defaultNow()
});
var insertAtividadeSchema = createInsertSchema(atividades).pick({
  tipo: true,
  descricao: true,
  data: true,
  metadados: true,
  icone: true,
  cor: true,
  userId: true,
  dataCriacao: true
});
var clientes = pgTable("clientes", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  cpfCnpj: text("cpf_cnpj").notNull().unique(),
  telefone: text("telefone"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  observacoes: text("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  dataCriacao: timestamp("data_criacao").defaultNow().notNull(),
  usuarioId: integer("usuario_id").references(() => users.id)
});
var insertClienteSchema = createInsertSchema(clientes).pick({
  nome: true,
  email: true,
  cpfCnpj: true,
  telefone: true,
  endereco: true,
  cidade: true,
  estado: true,
  cep: true,
  observacoes: true,
  ativo: true,
  usuarioId: true
});

// server/database-storage.ts
import session from "express-session";
import connectPg from "connect-pg-simple";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL deve ser definido. Voc\xEA esqueceu de criar um banco de dados?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/database-storage.ts
import { eq, desc } from "drizzle-orm";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }
  // Usuários
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, userData) {
    const [updatedUser] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return updatedUser;
  }
  // Produtos
  async getProduto(id) {
    const [produto] = await db.select().from(produtos).where(eq(produtos.id, id));
    return produto;
  }
  async getProdutos() {
    return await db.select().from(produtos);
  }
  async createProduto(produto) {
    const [newProduto] = await db.insert(produtos).values(produto).returning();
    return newProduto;
  }
  async updateProduto(id, produto) {
    const [updatedProduto] = await db.update(produtos).set(produto).where(eq(produtos.id, id)).returning();
    return updatedProduto;
  }
  async deleteProduto(id) {
    const result = await db.delete(produtos).where(eq(produtos.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Checkouts
  async getCheckout(id) {
    const [checkout] = await db.select().from(checkouts).where(eq(checkouts.id, id));
    return checkout;
  }
  async getCheckouts() {
    return await db.select().from(checkouts);
  }
  async createCheckout(checkout) {
    const [newCheckout] = await db.insert(checkouts).values(checkout).returning();
    return newCheckout;
  }
  async updateCheckout(id, checkout) {
    const [updatedCheckout] = await db.update(checkouts).set(checkout).where(eq(checkouts.id, id)).returning();
    return updatedCheckout;
  }
  async deleteCheckout(id) {
    const result = await db.delete(checkouts).where(eq(checkouts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Transações
  async getTransacao(id) {
    const [transacao] = await db.select().from(transacoes).where(eq(transacoes.id, id));
    return transacao;
  }
  async getTransacoes() {
    return await db.select().from(transacoes).orderBy(desc(transacoes.data));
  }
  async createTransacao(transacao) {
    const [newTransacao] = await db.insert(transacoes).values(transacao).returning();
    return newTransacao;
  }
  async getTransacaoPorReferencia(referencia) {
    const [transacao] = await db.select().from(transacoes).where(eq(transacoes.referencia, referencia));
    return transacao;
  }
  // Webhooks
  async getWebhook(id) {
    const [webhook] = await db.select().from(webhooks).where(eq(webhooks.id, id));
    return webhook;
  }
  async getWebhooks() {
    return await db.select().from(webhooks);
  }
  async createWebhook(webhook) {
    const [newWebhook] = await db.insert(webhooks).values(webhook).returning();
    return newWebhook;
  }
  async updateWebhook(id, updateData) {
    const [updatedWebhook] = await db.update(webhooks).set(updateData).where(eq(webhooks.id, id)).returning();
    return updatedWebhook;
  }
  async deleteWebhook(id) {
    const result = await db.delete(webhooks).where(eq(webhooks.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  // Atividades
  async getAtividade(id) {
    const [atividade] = await db.select().from(atividades).where(eq(atividades.id, id));
    return atividade;
  }
  async getAtividades() {
    return await db.select().from(atividades).orderBy(desc(atividades.data));
  }
  async createAtividade(atividade) {
    const [newAtividade] = await db.insert(atividades).values(atividade).returning();
    return newAtividade;
  }
  // Clientes
  async getCliente(id) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, id));
    return cliente;
  }
  async getClienteByCpfCnpj(cpfCnpj) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.cpfCnpj, cpfCnpj));
    return cliente;
  }
  async getClienteByEmail(email) {
    const [cliente] = await db.select().from(clientes).where(eq(clientes.email, email));
    return cliente;
  }
  async getClientes(usuarioId) {
    if (usuarioId) {
      return await db.select().from(clientes).where(eq(clientes.usuarioId, usuarioId)).orderBy(desc(clientes.dataCriacao));
    }
    return await db.select().from(clientes).orderBy(desc(clientes.dataCriacao));
  }
  async createCliente(cliente) {
    const [novoCliente] = await db.insert(clientes).values(cliente).returning();
    return novoCliente;
  }
  async updateCliente(id, clienteData) {
    const [clienteAtualizado] = await db.update(clientes).set(clienteData).where(eq(clientes.id, id)).returning();
    return clienteAtualizado;
  }
  async deleteCliente(id) {
    const result = await db.delete(clientes).where(eq(clientes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
};

// server/storage.ts
var storage = new DatabaseStorage();

// server/auth-utils.ts
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// server/auth-new.ts
function setupAuth(app2) {
  if (!process.env.SESSION_SECRET) {
    process.env.SESSION_SECRET = "desenvolvimento-secret-mercadopagoadmin2025";
  }
  const sessionSettings2 = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1e3
      // 24 horas
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings2));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Tentativa de login para usu\xE1rio: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`Usu\xE1rio n\xE3o encontrado: ${username}`);
          return done(null, false, { message: "Usu\xE1rio n\xE3o encontrado" });
        }
        if (user.username === "admin" && user.password === "admin123") {
          console.log("Primeiro login detectado. Atualizando senha para hash.");
          const hashedPassword = await hashPassword("admin123");
          await storage.updateUser(user.id, {
            password: hashedPassword
          });
          user.password = hashedPassword;
          return done(null, user);
        }
        if (await comparePasswords(password, user.password)) {
          console.log(`Login bem-sucedido para: ${username}`);
          return done(null, user);
        } else {
          console.log(`Senha inv\xE1lida para: ${username}`);
          return done(null, false, { message: "Senha inv\xE1lida" });
        }
      } catch (error) {
        console.error("Erro durante autentica\xE7\xE3o:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Nome de usu\xE1rio j\xE1 existe" });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      await storage.createAtividade({
        tipo: "usuario",
        descricao: `Novo usu\xE1rio criado - ${user.nome}`,
        icone: "user-add-line",
        cor: "primary",
        userId: null
      });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Falha na autentica\xE7\xE3o" });
      }
      req.login(user, async (err2) => {
        if (err2) return next(err2);
        await storage.createAtividade({
          tipo: "login",
          descricao: `Login realizado - ${user.nome}`,
          icone: "login-box-line",
          cor: "primary",
          userId: user.id
        });
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    if (req.user) {
      const userId = req.user.id;
      const userName = req.user.nome;
      req.logout((err) => {
        if (err) return next(err);
        storage.createAtividade({
          tipo: "logout",
          descricao: `Logout realizado - ${userName}`,
          icone: "logout-box-line",
          cor: "secondary",
          userId
        }).catch(console.error);
        res.status(200).json({ message: "Logout realizado com sucesso" });
      });
    } else {
      res.status(200).json({ message: "Nenhuma sess\xE3o ativa" });
    }
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "N\xE3o autenticado" });
    }
    res.json(req.user);
  });
}

// server/routes.ts
import { createServer } from "http";
import { z as z2 } from "zod";

// server/mercadopago.ts
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
var accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "TEST-1012316033860073-021220-e1dafb22aef47bbe9e1e4611973a955c-554634053";
var client = new MercadoPagoConfig({ accessToken });
var payment = new Payment(client);
var preference = new Preference(client);
async function createPayment(paymentData) {
  try {
    const response = await payment.create({ body: paymentData });
    return response;
  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    throw error;
  }
}
async function getPayment(id) {
  try {
    const response = await payment.get({ id });
    return response;
  } catch (error) {
    console.error(`Erro ao obter pagamento ${id}:`, error);
    throw error;
  }
}
async function createPreference(items, backUrls, notificationUrl) {
  try {
    const preferenceData = {
      items,
      back_urls: backUrls,
      auto_return: "approved"
    };
    if (notificationUrl) {
      preferenceData.notification_url = notificationUrl;
    }
    const response = await preference.create({ body: preferenceData });
    return response;
  } catch (error) {
    console.error("Erro ao criar prefer\xEAncia:", error);
    throw error;
  }
}
async function processWebhook(topic, id) {
  try {
    switch (topic) {
      case "payment":
        const paymentData = await getPayment(id);
        return paymentData;
      case "merchant_order":
        return { status: "received", id };
      default:
        return { status: "unhandled", topic, id };
    }
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    throw error;
  }
}

// server/routes/mercadopago.ts
import { Router } from "express";
var router = Router();
router.post("/mercadopago/preference", async (req, res) => {
  try {
    const { items, backUrls, notificationUrl } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Itens s\xE3o obrigat\xF3rios" });
    }
    const preference2 = await createPreference(items, backUrls, notificationUrl);
    res.status(201).json(preference2);
  } catch (error) {
    console.error("Erro ao criar prefer\xEAncia:", error);
    res.status(500).json({ error: error.message || "Erro ao criar prefer\xEAncia" });
  }
});
router.post("/mercadopago/webhook", async (req, res) => {
  try {
    const { topic, id } = req.query;
    if (!topic || !id) {
      return res.status(400).json({ error: "Par\xE2metros inv\xE1lidos" });
    }
    const result = await processWebhook(String(topic), String(id));
    if (topic === "payment") {
      const payment2 = result;
      const checkoutId = payment2.external_reference ? parseInt(String(payment2.external_reference), 10) : 1;
      const transacaoData = {
        checkoutId,
        clienteNome: payment2.payer?.first_name && payment2.payer?.last_name ? `${payment2.payer.first_name} ${payment2.payer.last_name}` : "Cliente",
        clienteEmail: payment2.payer?.email || "email@exemplo.com",
        valor: payment2.transaction_amount || 0,
        moeda: payment2.currency_id || "BRL",
        status: payment2.status || "pending",
        metodo: payment2.payment_method_id || "mercadopago",
        referencia: String(payment2.id),
        metadata: JSON.stringify(payment2),
        dataCriacao: /* @__PURE__ */ new Date()
      };
      const validatedData = insertTransacaoSchema.parse(transacaoData);
      await storage.createTransacao(validatedData);
      const atividadeData = {
        tipo: "pagamento",
        descricao: `Pagamento ${payment2.status} de R$ ${payment2.transaction_amount || 0}`,
        metadados: JSON.stringify({
          valor: payment2.transaction_amount,
          status: payment2.status,
          id: payment2.id
        }),
        dataCriacao: /* @__PURE__ */ new Date()
      };
      await storage.createAtividade(atividadeData);
    }
    const webhookData = {
      evento: String(topic),
      url: req.originalUrl,
      ativo: true,
      ultimaExecucao: /* @__PURE__ */ new Date(),
      dados: JSON.stringify(result)
    };
    await storage.createWebhook(webhookData);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    try {
      const webhookErroData = {
        evento: String(req.query.topic || "unknown"),
        url: req.originalUrl,
        ativo: true,
        ultimaExecucao: /* @__PURE__ */ new Date(),
        dados: JSON.stringify({ error: error.message })
      };
      await storage.createWebhook(webhookErroData);
    } catch (webhookError) {
      console.error("Erro ao registrar webhook com falha:", webhookError);
    }
    res.status(500).json({ error: error.message || "Erro ao processar webhook" });
  }
});
router.get("/mercadopago/payment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const transacao = await storage.getTransacaoPorReferencia(id);
    if (!transacao) {
      return res.status(404).json({ error: "Pagamento n\xE3o encontrado" });
    }
    res.status(200).json(transacao);
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error);
    res.status(500).json({ error: error.message || "Erro ao buscar pagamento" });
  }
});
var mercadopago_default = router;

// server/routes/clientes.ts
import { Router as Router2 } from "express";
import { z } from "zod";
var router2 = Router2();
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "N\xE3o autenticado" });
}
router2.get("/", isAuthenticated, async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId ? parseInt(req.query.usuarioId) : void 0;
    const clientes2 = await storage.getClientes(usuarioId);
    res.json(clientes2);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ message: "Erro ao buscar clientes" });
  }
});
router2.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cliente = await storage.getCliente(id);
    if (!cliente) {
      return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).json({ message: "Erro ao buscar cliente" });
  }
});
router2.post("/", isAuthenticated, async (req, res) => {
  try {
    const clienteData = insertClienteSchema.parse(req.body);
    const clienteExistenteCpfCnpj = await storage.getClienteByCpfCnpj(clienteData.cpfCnpj);
    if (clienteExistenteCpfCnpj) {
      return res.status(400).json({ message: "J\xE1 existe um cliente com este CPF/CNPJ" });
    }
    const clienteExistenteEmail = await storage.getClienteByEmail(clienteData.email);
    if (clienteExistenteEmail) {
      return res.status(400).json({ message: "J\xE1 existe um cliente com este e-mail" });
    }
    if (!clienteData.usuarioId && req.user?.id) {
      clienteData.usuarioId = req.user.id;
    }
    const novoCliente = await storage.createCliente(clienteData);
    await storage.createAtividade({
      tipo: "cliente_criado",
      descricao: `Cliente ${novoCliente.nome} criado`,
      icone: "user-add-line",
      cor: "success",
      userId: req.user?.id
    });
    res.status(201).json(novoCliente);
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados de cliente inv\xE1lidos",
        errors: error.errors
      });
    }
    res.status(500).json({ message: "Erro ao criar cliente" });
  }
});
router2.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const clienteExistente = await storage.getCliente(id);
    if (!clienteExistente) {
      return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
    }
    const clienteData = insertClienteSchema.partial().parse(req.body);
    if (clienteData.cpfCnpj) {
      const clienteCpfCnpj = await storage.getClienteByCpfCnpj(clienteData.cpfCnpj);
      if (clienteCpfCnpj && clienteCpfCnpj.id !== id) {
        return res.status(400).json({ message: "CPF/CNPJ j\xE1 est\xE1 sendo usado por outro cliente" });
      }
    }
    if (clienteData.email) {
      const clienteEmail = await storage.getClienteByEmail(clienteData.email);
      if (clienteEmail && clienteEmail.id !== id) {
        return res.status(400).json({ message: "E-mail j\xE1 est\xE1 sendo usado por outro cliente" });
      }
    }
    const clienteAtualizado = await storage.updateCliente(id, clienteData);
    await storage.createAtividade({
      tipo: "cliente_atualizado",
      descricao: `Cliente ${clienteAtualizado?.nome} atualizado`,
      icone: "user-edit-line",
      cor: "primary",
      userId: req.user?.id
    });
    res.json(clienteAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Dados de atualiza\xE7\xE3o inv\xE1lidos",
        errors: error.errors
      });
    }
    res.status(500).json({ message: "Erro ao atualizar cliente" });
  }
});
router2.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const clienteExistente = await storage.getCliente(id);
    if (!clienteExistente) {
      return res.status(404).json({ message: "Cliente n\xE3o encontrado" });
    }
    const sucesso = await storage.deleteCliente(id);
    if (sucesso) {
      await storage.createAtividade({
        tipo: "cliente_excluido",
        descricao: `Cliente ${clienteExistente.nome} exclu\xEDdo`,
        icone: "delete-bin-line",
        cor: "danger",
        userId: req.user?.id
      });
      return res.status(200).json({ message: "Cliente exclu\xEDdo com sucesso" });
    } else {
      return res.status(500).json({ message: "Erro ao excluir cliente" });
    }
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).json({ message: "Erro ao excluir cliente" });
  }
});
router2.get("/busca/avancada", isAuthenticated, async (req, res) => {
  try {
    const { cpfCnpj, email } = req.query;
    if (cpfCnpj) {
      const cliente = await storage.getClienteByCpfCnpj(cpfCnpj);
      return res.json(cliente ? [cliente] : []);
    }
    if (email) {
      const cliente = await storage.getClienteByEmail(email);
      return res.json(cliente ? [cliente] : []);
    }
    return res.status(400).json({ message: "Informe cpfCnpj ou email para busca" });
  } catch (error) {
    console.error("Erro na busca avan\xE7ada:", error);
    res.status(500).json({ message: "Erro ao realizar busca" });
  }
});
var clientes_default = router2;

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/api", mercadopago_default);
  app2.use("/api/clientes", clientes_default);
  app2.get("/api/produtos", async (req, res, next) => {
    try {
      const produtos2 = await storage.getProdutos();
      res.json(produtos2);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/produtos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const produto = await storage.getProduto(id);
      if (!produto) {
        return res.status(404).json({ message: "Produto n\xE3o encontrado" });
      }
      res.json(produto);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/produtos", async (req, res, next) => {
    try {
      const validatedData = insertProdutoSchema.parse(req.body);
      const produto = await storage.createProduto(validatedData);
      await storage.createAtividade({
        tipo: "produto",
        descricao: `Novo produto criado - ${produto.nome}`,
        icone: "shopping-bag-3-line",
        cor: "secondary",
        userId: req.user?.id
      });
      res.status(201).json(produto);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.put("/api/produtos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const validatedData = insertProdutoSchema.partial().parse(req.body);
      const produto = await storage.updateProduto(id, validatedData);
      if (!produto) {
        return res.status(404).json({ message: "Produto n\xE3o encontrado" });
      }
      await storage.createAtividade({
        tipo: "produto",
        descricao: `Produto atualizado - ${produto.nome}`,
        icone: "edit-line",
        cor: "primary",
        userId: req.user?.id
      });
      res.json(produto);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.delete("/api/produtos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const produto = await storage.getProduto(id);
      if (!produto) {
        return res.status(404).json({ message: "Produto n\xE3o encontrado" });
      }
      const success = await storage.deleteProduto(id);
      if (success) {
        await storage.createAtividade({
          tipo: "produto",
          descricao: `Produto removido - ${produto.nome}`,
          icone: "delete-bin-line",
          cor: "danger",
          userId: req.user?.id
        });
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Erro ao remover produto" });
      }
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/checkouts", async (req, res, next) => {
    try {
      const checkouts2 = await storage.getCheckouts();
      res.json(checkouts2);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/checkouts/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const checkout = await storage.getCheckout(id);
      if (!checkout) {
        return res.status(404).json({ message: "Checkout n\xE3o encontrado" });
      }
      res.json(checkout);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/checkouts", async (req, res, next) => {
    try {
      const validatedData = insertCheckoutSchema.parse(req.body);
      const checkout = await storage.createCheckout(validatedData);
      await storage.createAtividade({
        tipo: "checkout",
        descricao: `Novo checkout criado - ${checkout.nome}`,
        icone: "shopping-cart-line",
        cor: "accent",
        userId: req.user?.id
      });
      res.status(201).json(checkout);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.put("/api/checkouts/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const validatedData = insertCheckoutSchema.partial().parse(req.body);
      const checkout = await storage.updateCheckout(id, validatedData);
      if (!checkout) {
        return res.status(404).json({ message: "Checkout n\xE3o encontrado" });
      }
      await storage.createAtividade({
        tipo: "checkout",
        descricao: `Checkout atualizado - ${checkout.nome}`,
        icone: "edit-line",
        cor: "primary",
        userId: req.user?.id
      });
      res.json(checkout);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.delete("/api/checkouts/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const checkout = await storage.getCheckout(id);
      if (!checkout) {
        return res.status(404).json({ message: "Checkout n\xE3o encontrado" });
      }
      const success = await storage.deleteCheckout(id);
      if (success) {
        await storage.createAtividade({
          tipo: "checkout",
          descricao: `Checkout removido - ${checkout.nome}`,
          icone: "delete-bin-line",
          cor: "danger",
          userId: req.user?.id
        });
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Erro ao remover checkout" });
      }
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/transacoes", async (req, res, next) => {
    try {
      const transacoes2 = await storage.getTransacoes();
      res.json(transacoes2);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/transacoes/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const transacao = await storage.getTransacao(id);
      if (!transacao) {
        return res.status(404).json({ message: "Transa\xE7\xE3o n\xE3o encontrada" });
      }
      res.json(transacao);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/transacoes", async (req, res, next) => {
    try {
      const validatedData = insertTransacaoSchema.parse(req.body);
      const transacao = await storage.createTransacao(validatedData);
      await storage.createAtividade({
        tipo: "transacao",
        descricao: `Nova transa\xE7\xE3o registrada - ${transacao.referencia}`,
        icone: "exchange-funds-line",
        cor: "success",
        userId: req.user?.id
      });
      res.status(201).json(transacao);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.get("/api/webhooks", async (req, res, next) => {
    try {
      const webhooks2 = await storage.getWebhooks();
      res.json(webhooks2);
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/webhooks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const webhook = await storage.getWebhook(id);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook n\xE3o encontrado" });
      }
      res.json(webhook);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/webhooks", async (req, res, next) => {
    try {
      const validatedData = insertWebhookSchema.parse(req.body);
      const webhook = await storage.createWebhook(validatedData);
      await storage.createAtividade({
        tipo: "webhook",
        descricao: `Novo webhook criado - ${webhook.evento}`,
        icone: "exchange-line",
        cor: "secondary",
        userId: req.user?.id
      });
      res.status(201).json(webhook);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.put("/api/webhooks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const validatedData = updateWebhookSchema.parse(req.body);
      const webhook = await storage.updateWebhook(id, validatedData);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook n\xE3o encontrado" });
      }
      await storage.createAtividade({
        tipo: "webhook",
        descricao: `Webhook atualizado - ${webhook.evento}`,
        icone: "edit-line",
        cor: "primary",
        userId: req.user?.id
      });
      res.json(webhook);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dados inv\xE1lidos",
          errors: error.errors
        });
      }
      next(error);
    }
  });
  app2.delete("/api/webhooks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inv\xE1lido" });
      }
      const webhook = await storage.getWebhook(id);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook n\xE3o encontrado" });
      }
      const success = await storage.deleteWebhook(id);
      if (success) {
        await storage.createAtividade({
          tipo: "webhook",
          descricao: `Webhook removido - ${webhook.evento}`,
          icone: "delete-bin-line",
          cor: "danger",
          userId: req.user?.id
        });
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Erro ao remover webhook" });
      }
    } catch (error) {
      next(error);
    }
  });
  app2.get("/api/atividades", async (req, res, next) => {
    try {
      const atividades2 = await storage.getAtividades();
      res.json(atividades2);
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/mercadopago/payment", async (req, res, next) => {
    try {
      const paymentData = req.body;
      const result = await createPayment(paymentData);
      if (result.id) {
        const transacao = await storage.createTransacao({
          status: "pendente",
          metodo: paymentData.payment_method_id || "mercadopago",
          valor: paymentData.transaction_amount,
          moeda: "BRL",
          referencia: result.id.toString(),
          checkoutId: paymentData.checkoutId || null,
          clienteEmail: paymentData.payer.email,
          clienteNome: paymentData.payer.name || "",
          metadata: JSON.stringify(result),
          dataCriacao: /* @__PURE__ */ new Date()
        });
        await storage.createAtividade({
          tipo: "transacao",
          descricao: `Nova transa\xE7\xE3o iniciada - ${transacao.referencia}`,
          icone: "secure-payment-line",
          cor: "info",
          userId: null
        });
      }
      res.status(201).json(result);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      next(error);
    }
  });
  app2.post("/api/mercadopago/preference", async (req, res, next) => {
    try {
      const { items, backUrls, notificationUrl } = req.body;
      const result = await createPreference(items, backUrls, notificationUrl);
      await storage.createAtividade({
        tipo: "checkout",
        descricao: `Nova prefer\xEAncia de pagamento criada`,
        icone: "shopping-cart-line",
        cor: "accent",
        userId: null
      });
      res.status(201).json(result);
    } catch (error) {
      console.error("Erro ao criar prefer\xEAncia:", error);
      next(error);
    }
  });
  app2.post("/api/mercadopago/webhook", async (req, res, next) => {
    try {
      const { topic, id } = req.query;
      if (!topic || !id) {
        return res.status(400).json({ message: "Par\xE2metros inv\xE1lidos" });
      }
      const result = await processWebhook(topic.toString(), id.toString());
      const webhooks2 = await storage.getWebhooks();
      const webhook = webhooks2.find((w) => w.evento === `mercadopago.${topic}`);
      if (webhook) {
        await storage.updateWebhook(webhook.id, updateWebhookSchema.parse({
          ultimoStatus: "success",
          ultimaExecucao: /* @__PURE__ */ new Date()
        }));
        await storage.createAtividade({
          tipo: "webhook",
          descricao: `Webhook do MercadoPago processado - ${topic}`,
          icone: "notification-4-line",
          cor: "success",
          userId: null
        });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      res.status(200).json({ success: false, error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/db-setup.ts
import { eq as eq2 } from "drizzle-orm";
async function tableExists(tableName) {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
    return false;
  }
}
async function setupDatabase() {
  console.log("Iniciando configura\xE7\xE3o do banco de dados...");
  try {
    const usersTableExists = await tableExists("users");
    const produtosTableExists = await tableExists("produtos");
    const checkoutsTableExists = await tableExists("checkouts");
    const webhooksTableExists = await tableExists("webhooks");
    const transacoesTableExists = await tableExists("transacoes");
    const atividadesTableExists = await tableExists("atividades");
    if (!usersTableExists || !produtosTableExists || !checkoutsTableExists || !webhooksTableExists || !transacoesTableExists || !atividadesTableExists) {
      console.log("Uma ou mais tabelas n\xE3o existem. Aguarde enquanto as migra\xE7\xF5es s\xE3o conclu\xEDdas.");
      return;
    }
    console.log("Tabelas existem, configurando dados iniciais...");
    const [existingAdmin] = await db.select().from(users).where(eq2(users.username, "admin"));
    if (!existingAdmin) {
      console.log("Criando usu\xE1rio admin...");
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        nome: "Administrador",
        email: "admin@exemplo.com",
        role: "admin",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin"
      });
      console.log("Usu\xE1rio admin criado com sucesso");
    } else {
      console.log("Usu\xE1rio admin j\xE1 existe");
    }
    const [existingProduto] = await db.select().from(produtos);
    if (!existingProduto) {
      console.log("Criando produto de demonstra\xE7\xE3o...");
      const [produto] = await db.insert(produtos).values({
        nome: "Curso de Marketing Digital",
        descricao: "Curso completo sobre marketing digital e estrat\xE9gias de vendas",
        preco: 199.9,
        imagem: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        categoria: "Cursos",
        ativo: true
      }).returning();
      await pool.query(`
        INSERT INTO checkouts (nome, url, "produtoId", layout, config, ativo, "dataCriacao") 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        "Checkout Padr\xE3o",
        "/checkout/curso-marketing",
        produto.id,
        "padrao",
        JSON.stringify({ tema: "claro", showLogo: true }),
        true,
        /* @__PURE__ */ new Date()
      ]);
      console.log("Produto e checkout de demonstra\xE7\xE3o criados");
    } else {
      console.log("Produtos j\xE1 existem no banco de dados");
    }
    const [existingWebhook] = await db.select().from(webhooks);
    if (!existingWebhook) {
      console.log("Criando webhook de demonstra\xE7\xE3o...");
      await db.insert(webhooks).values({
        evento: "payment.processed",
        url: "https://api.seusite.com.br/webhooks/payments",
        ativo: true,
        ultimoStatus: null,
        ultimaExecucao: null,
        dataCriacao: /* @__PURE__ */ new Date()
      });
      console.log("Webhook de demonstra\xE7\xE3o criado");
    } else {
      console.log("Webhooks j\xE1 existem no banco de dados");
    }
    const [existingTransacao] = await db.select().from(transacoes);
    if (!existingTransacao) {
      console.log("Criando transa\xE7\xE3o de demonstra\xE7\xE3o...");
      const [checkout] = await db.select().from(checkouts);
      if (checkout) {
        await pool.query(`
          INSERT INTO transacoes ("checkoutId", "clienteNome", "clienteEmail", valor, moeda, status, metodo, referencia, data, "dataCriacao", metadata) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          checkout.id,
          "Maria Oliveira",
          "maria@exemplo.com",
          1458.9,
          "BRL",
          "aprovado",
          "Cart\xE3o de Cr\xE9dito",
          "TRX-78945",
          /* @__PURE__ */ new Date(),
          /* @__PURE__ */ new Date(),
          JSON.stringify({ origem: "demonstracao" })
        ]);
        console.log("Transa\xE7\xE3o de demonstra\xE7\xE3o criada");
      } else {
        console.log("N\xE3o foi poss\xEDvel criar transa\xE7\xE3o - nenhum checkout encontrado");
      }
    } else {
      console.log("Transa\xE7\xF5es j\xE1 existem no banco de dados");
    }
    const [existingAtividade] = await db.select().from(atividades);
    if (!existingAtividade) {
      console.log("Criando atividades de demonstra\xE7\xE3o...");
      await db.insert(atividades).values([
        {
          tipo: "usuario",
          descricao: "Novo cliente registrado - Carlos Santos se registrou no sistema",
          icone: "user-add-line",
          cor: "primary",
          userId: null,
          data: new Date(Date.now() - 36e5 * 24 * 2)
          // 2 dias atrás
        },
        {
          tipo: "transacao",
          descricao: "Transa\xE7\xE3o conclu\xEDda - Transa\xE7\xE3o #TRX-78945 foi conclu\xEDda com sucesso",
          icone: "checkbox-circle-line",
          cor: "success",
          userId: null,
          data: new Date(Date.now() - 36e5 * 8)
          // 8 horas atrás
        },
        {
          tipo: "sistema",
          descricao: "Notifica\xE7\xE3o de sistema - Atualiza\xE7\xE3o de sistema programada para 20/05/2023",
          icone: "error-warning-line",
          cor: "warning",
          userId: null,
          data: new Date(Date.now() - 36e5)
          // 1 hora atrás
        }
      ]);
      console.log("Atividades de demonstra\xE7\xE3o criadas");
    } else {
      console.log("Atividades j\xE1 existem no banco de dados");
    }
    console.log("Configura\xE7\xE3o do banco de dados conclu\xEDda com sucesso!");
  } catch (error) {
    console.error("Erro durante a configura\xE7\xE3o do banco de dados:", error);
  } finally {
  }
}
setupDatabase().then(() => {
  console.log("Script de configura\xE7\xE3o conclu\xEDdo");
}).catch((err) => {
  console.error("Erro no script de configura\xE7\xE3o:", err);
});

// functions/api.js
var app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? ["https://payhub-alexdeveloper.netlify.app", "https://www.payhub-alexdeveloper.netlify.app"] : "http://localhost:5000",
  credentials: true
}));
var sessionSettings = {
  secret: process.env.SESSION_SECRET || "payhub-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1e3 * 60 * 60 * 24
    // 24 horas
  }
};
app.use(session3(sessionSettings));
setupAuth(app);
registerRoutes(app);
(async function() {
  try {
    await setupDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
})();
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});
var handler = serverless(app);
export {
  handler
};
