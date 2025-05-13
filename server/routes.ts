import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProdutoSchema, insertCheckoutSchema, insertTransacaoSchema, insertWebhookSchema } from "@shared/schema";
import { z } from "zod";
import { createPayment, createPreference, processWebhook } from "./mercadopago";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar autenticação
  setupAuth(app);

  // API de produtos
  app.get("/api/produtos", async (req, res, next) => {
    try {
      const produtos = await storage.getProdutos();
      res.json(produtos);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/produtos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const produto = await storage.getProduto(id);
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(produto);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/produtos", async (req, res, next) => {
    try {
      const validatedData = insertProdutoSchema.parse(req.body);
      const produto = await storage.createProduto(validatedData);
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "produto",
        descricao: `Novo produto criado - ${produto.nome}`,
        icone: "shopping-bag-3-line",
        cor: "secondary",
        userId: req.user?.id
      });
      
      res.status(201).json(produto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.put("/api/produtos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertProdutoSchema.partial().parse(req.body);
      const produto = await storage.updateProduto(id, validatedData);
      
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "produto",
        descricao: `Produto atualizado - ${produto.nome}`,
        icone: "edit-line",
        cor: "primary",
        userId: req.user?.id
      });
      
      res.json(produto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.delete("/api/produtos/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const produto = await storage.getProduto(id);
      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      const success = await storage.deleteProduto(id);
      
      if (success) {
        // Registrar atividade
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

  // API de checkouts
  app.get("/api/checkouts", async (req, res, next) => {
    try {
      const checkouts = await storage.getCheckouts();
      res.json(checkouts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/checkouts/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const checkout = await storage.getCheckout(id);
      if (!checkout) {
        return res.status(404).json({ message: "Checkout não encontrado" });
      }
      
      res.json(checkout);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/checkouts", async (req, res, next) => {
    try {
      const validatedData = insertCheckoutSchema.parse(req.body);
      const checkout = await storage.createCheckout(validatedData);
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "checkout",
        descricao: `Novo checkout criado - ${checkout.nome}`,
        icone: "shopping-cart-line",
        cor: "accent",
        userId: req.user?.id
      });
      
      res.status(201).json(checkout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.put("/api/checkouts/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertCheckoutSchema.partial().parse(req.body);
      const checkout = await storage.updateCheckout(id, validatedData);
      
      if (!checkout) {
        return res.status(404).json({ message: "Checkout não encontrado" });
      }
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "checkout",
        descricao: `Checkout atualizado - ${checkout.nome}`,
        icone: "edit-line",
        cor: "primary",
        userId: req.user?.id
      });
      
      res.json(checkout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.delete("/api/checkouts/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const checkout = await storage.getCheckout(id);
      if (!checkout) {
        return res.status(404).json({ message: "Checkout não encontrado" });
      }
      
      const success = await storage.deleteCheckout(id);
      
      if (success) {
        // Registrar atividade
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

  // API de transações
  app.get("/api/transacoes", async (req, res, next) => {
    try {
      const transacoes = await storage.getTransacoes();
      res.json(transacoes);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/transacoes/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const transacao = await storage.getTransacao(id);
      if (!transacao) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      
      res.json(transacao);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/transacoes", async (req, res, next) => {
    try {
      const validatedData = insertTransacaoSchema.parse(req.body);
      const transacao = await storage.createTransacao(validatedData);
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "transacao",
        descricao: `Nova transação registrada - ${transacao.referencia}`,
        icone: "exchange-funds-line",
        cor: "success",
        userId: req.user?.id
      });
      
      res.status(201).json(transacao);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  // API de webhooks
  app.get("/api/webhooks", async (req, res, next) => {
    try {
      const webhooks = await storage.getWebhooks();
      res.json(webhooks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/webhooks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const webhook = await storage.getWebhook(id);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }
      
      res.json(webhook);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/webhooks", async (req, res, next) => {
    try {
      const validatedData = insertWebhookSchema.parse(req.body);
      const webhook = await storage.createWebhook(validatedData);
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "webhook",
        descricao: `Novo webhook criado - ${webhook.evento}`,
        icone: "exchange-line",
        cor: "secondary",
        userId: req.user?.id
      });
      
      res.status(201).json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.put("/api/webhooks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const validatedData = insertWebhookSchema.partial().parse(req.body);
      const webhook = await storage.updateWebhook(id, validatedData);
      
      if (!webhook) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "webhook",
        descricao: `Webhook atualizado - ${webhook.evento}`,
        icone: "edit-line",
        cor: "primary",
        userId: req.user?.id
      });
      
      res.json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors 
        });
      }
      next(error);
    }
  });

  app.delete("/api/webhooks/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const webhook = await storage.getWebhook(id);
      if (!webhook) {
        return res.status(404).json({ message: "Webhook não encontrado" });
      }
      
      const success = await storage.deleteWebhook(id);
      
      if (success) {
        // Registrar atividade
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

  // API de atividades
  app.get("/api/atividades", async (req, res, next) => {
    try {
      const atividades = await storage.getAtividades();
      res.json(atividades);
    } catch (error) {
      next(error);
    }
  });

  // API do MercadoPago
  app.post("/api/mercadopago/payment", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const paymentData = req.body;
      const result = await createPayment(paymentData);
      
      // Registrar a transação no sistema
      if (result.id) {
        const transacao = await storage.createTransacao({
          status: 'pendente',
          metodo: paymentData.payment_method_id || 'mercadopago',
          valor: paymentData.transaction_amount,
          moeda: 'BRL',
          referencia: result.id.toString(),
          checkoutId: paymentData.checkoutId || null,
          clienteEmail: paymentData.payer.email,
          clienteNome: paymentData.payer.name || '',
          metadata: JSON.stringify(result),
          dataCriacao: new Date()
        });
        
        // Registrar atividade
        await storage.createAtividade({
          tipo: "transacao",
          descricao: `Nova transação iniciada - ${transacao.referencia}`,
          icone: "secure-payment-line",
          cor: "info",
          userId: req.user?.id
        });
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      next(error);
    }
  });
  
  app.post("/api/mercadopago/preference", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const { items, backUrls, notificationUrl } = req.body;
      
      const result = await createPreference(items, backUrls, notificationUrl);
      
      // Registrar atividade
      await storage.createAtividade({
        tipo: "checkout",
        descricao: `Nova preferência de pagamento criada`,
        icone: "shopping-cart-line",
        cor: "accent",
        userId: req.user?.id
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Erro ao criar preferência:', error);
      next(error);
    }
  });
  
  // Endpoint para receber notificações do MercadoPago (webhook)
  app.post("/api/mercadopago/webhook", async (req, res, next) => {
    try {
      const { topic, id } = req.query;
      
      if (!topic || !id) {
        return res.status(400).json({ message: "Parâmetros inválidos" });
      }
      
      const result = await processWebhook(topic.toString(), id.toString());
      
      // Atualizar o webhook no sistema
      const webhooks = await storage.getWebhooks();
      const webhook = webhooks.find(w => w.evento === `mercadopago.${topic}`);
      
      if (webhook) {
        await storage.updateWebhook(webhook.id, {
          ultimaExecucao: new Date(),
          ultimoStatus: 'success'
        });
        
        // Registrar atividade
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
      console.error('Erro ao processar webhook:', error);
      
      // Mesmo em caso de erro, devemos responder com 200 para o MercadoPago
      // não continuar tentando enviar a notificação
      res.status(200).json({ success: false, error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
