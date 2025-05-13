import { MercadoPagoConfig, Payment } from 'mercadopago';
import { initMercadoPago } from '@mercadopago/sdk-react';

// Inicializa o SDK do MercadoPago com a chave pública
// Esta chave é usada para o frontend
initMercadoPago('TEST-41e30cfc-40c3-437d-a068-ddca10ad5876');

// Configuração do cliente com a chave privada
// Esta chave é usada para operações no backend
const client = new MercadoPagoConfig({ 
  accessToken: 'TEST-1012316033860073-021220-e1dafb22aef47bbe9e1e4611973a955c-554634053' 
});

// Instancia o objeto Payment para criar pagamentos
const payment = new Payment(client);

/**
 * Cria um novo pagamento no MercadoPago
 * 
 * @param data Dados do pagamento conforme especificação do MercadoPago
 * @returns Promise com o resultado da operação
 */
export async function createPayment(data: any) {
  try {
    const result = await payment.create({ body: data });
    return result;
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    throw error;
  }
}

/**
 * Obtém informações de um pagamento existente
 * 
 * @param id ID do pagamento no MercadoPago
 * @returns Promise com os dados do pagamento
 */
export async function getPayment(id: string) {
  try {
    const result = await payment.get({ id });
    return result;
  } catch (error) {
    console.error(`Erro ao obter pagamento ${id}:`, error);
    throw error;
  }
}

/**
 * Cria uma preferência de pagamento (usado para checkout)
 * 
 * @param items Itens a serem incluídos no checkout
 * @param backUrls URLs de retorno após o pagamento
 * @returns Promise com a preferência criada
 */
export async function createPreference(items: any[], backUrls: { 
  success: string, 
  failure: string, 
  pending: string 
}) {
  try {
    // A implementação completa será feita quando necessário
    // Por enquanto é apenas um placeholder
    return { id: 'mock-preference-id' };
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    throw error;
  }
}

/**
 * Tipo para os dados de um novo pagamento
 * Baseado na documentação do MercadoPago
 */
export interface PaymentData {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    }
  };
  additional_info?: {
    items: Array<{
      id: string;
      title: string;
      description: string;
      picture_url?: string;
      category_id?: string;
      quantity: number;
      unit_price: number;
    }>;
  };
}