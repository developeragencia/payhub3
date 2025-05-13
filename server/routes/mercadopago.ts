import { Router } from 'express';
import { storage } from '../storage';
import { createPreference, processWebhook } from '../mercadopago';
import { insertTransacaoSchema, type InsertAtividade, type InsertWebhook } from '@shared/schema';
import { MercadoPagoPayment } from '../types/mercadopago';

const router = Router();

// Endpoint para criar preferência de pagamento
router.post('/mercadopago/preference', async (req, res) => {
  try {
    const { items, backUrls, notificationUrl } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Itens são obrigatórios' });
    }
    
    const preference = await createPreference(items, backUrls, notificationUrl);
    res.status(201).json(preference);
  } catch (error: any) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar preferência' });
  }
});

// Endpoint para webhook do MercadoPago
router.post('/mercadopago/webhook', async (req, res) => {
  try {
    const { topic, id } = req.query;
    
    if (!topic || !id) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    
    const result = await processWebhook(String(topic), String(id));
    
    // Se for uma notificação de pagamento, registrar transação
    if (topic === 'payment') {
      // Cast para o tipo correto
      const payment = result as MercadoPagoPayment;
      
      // Buscar checkout pela referência externa (se existir)
      const checkoutId = payment.external_reference 
        ? parseInt(String(payment.external_reference), 10) 
        : 1; // valor padrão caso não exista
      
      // Criar transação
      const transacaoData = {
        checkoutId,
        clienteNome: payment.payer?.first_name && payment.payer?.last_name 
          ? `${payment.payer.first_name} ${payment.payer.last_name}` 
          : 'Cliente',
        clienteEmail: payment.payer?.email || 'email@exemplo.com',
        valor: payment.transaction_amount || 0,
        moeda: payment.currency_id || 'BRL',
        status: payment.status || 'pending',
        metodo: payment.payment_method_id || 'mercadopago',
        referencia: String(payment.id),
        metadata: JSON.stringify(payment),
        dataCriacao: new Date(),
      };
      
      // Validar e criar transação
      const validatedData = insertTransacaoSchema.parse(transacaoData);
      await storage.createTransacao(validatedData);
      
      // Registrar atividade
      const atividadeData: InsertAtividade = {
        tipo: 'pagamento',
        descricao: `Pagamento ${payment.status} de R$ ${payment.transaction_amount || 0}`,
        metadados: JSON.stringify({
          valor: payment.transaction_amount,
          status: payment.status,
          id: payment.id,
        }),
        dataCriacao: new Date(),
      };
      
      await storage.createAtividade(atividadeData);
    }
    
    // Registrar webhook
    const webhookData: InsertWebhook = {
      evento: String(topic),
      url: req.originalUrl,
      ativo: true,
      ultimaExecucao: new Date(),
      dados: JSON.stringify(result),
    };
    
    await storage.createWebhook(webhookData);
    
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error);
    
    // Registrar webhook com erro
    try {
      const webhookErroData: InsertWebhook = {
        evento: String(req.query.topic || 'unknown'),
        url: req.originalUrl,
        ativo: true,
        ultimaExecucao: new Date(),
        dados: JSON.stringify({ error: error.message }),
      };
      
      await storage.createWebhook(webhookErroData);
    } catch (webhookError) {
      console.error('Erro ao registrar webhook com falha:', webhookError);
    }
    
    res.status(500).json({ error: error.message || 'Erro ao processar webhook' });
  }
});

// Endpoint para buscar informações de pagamento
router.get('/mercadopago/payment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar pagamento pelo ID de referência (transação)
    const transacao = await storage.getTransacaoPorReferencia(id);
    
    if (!transacao) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }
    
    res.status(200).json(transacao);
  } catch (error: any) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar pagamento' });
  }
});

export default router;