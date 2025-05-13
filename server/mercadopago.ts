import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { MercadoPagoPayment, MercadoPagoPreference, WebhookResponseType } from './types/mercadopago';

// Configuração do cliente com a chave privada 
// Nota: Em ambiente de produção, sempre use uma variável de ambiente para a chave
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1012316033860073-021220-e1dafb22aef47bbe9e1e4611973a955c-554634053';
const client = new MercadoPagoConfig({ accessToken });

// Instanciando os objetos para API
const payment = new Payment(client);
const preference = new Preference(client);

/**
 * Cria um novo pagamento no MercadoPago
 * 
 * @param paymentData Dados do pagamento
 * @returns Resultado da operação
 */
export async function createPayment(paymentData: any) {
  try {
    const response = await payment.create({ body: paymentData });
    return response;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
}

/**
 * Obtém informações de um pagamento
 * 
 * @param id ID do pagamento
 * @returns Dados do pagamento
 */
export async function getPayment(id: string) {
  try {
    const response = await payment.get({ id });
    return response;
  } catch (error) {
    console.error(`Erro ao obter pagamento ${id}:`, error);
    throw error;
  }
}

/**
 * Cria uma preferência de pagamento para checkout
 * 
 * @param items Itens a serem incluídos no checkout
 * @param backUrls URLs de retorno
 * @param notificationUrl URL para notificações (webhook)
 * @returns Preferência criada
 */
export async function createPreference(
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    description?: string;
    picture_url?: string;
  }>,
  backUrls: {
    success: string;
    failure: string;
    pending: string;
  },
  notificationUrl?: string
): Promise<MercadoPagoPreference> {
  try {
    const preferenceData: any = {
      items,
      back_urls: backUrls,
      auto_return: 'approved',
    };

    if (notificationUrl) {
      preferenceData.notification_url = notificationUrl;
    }

    const response = await preference.create({ body: preferenceData });
    return response as unknown as MercadoPagoPreference;
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    throw error;
  }
}

/**
 * Processa um webhook do MercadoPago
 * 
 * @param topic Tipo de notificação
 * @param id ID do recurso
 * @returns Dados processados
 */
export async function processWebhook(topic: string, id: string): Promise<WebhookResponseType> {
  try {
    switch (topic) {
      case 'payment':
        const paymentData = await getPayment(id);
        // Cast para o tipo correto
        return paymentData as MercadoPagoPayment;
        
      case 'merchant_order':
        // Implementação para ordens de merchant
        return { status: 'received', id };
        
      default:
        return { status: 'unhandled', topic, id };
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw error;
  }
}