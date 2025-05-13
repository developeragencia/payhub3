/**
 * Interface para resposta de pagamento do MercadoPago
 */
export interface MercadoPagoPayment {
  id: string | number;
  status: string;
  status_detail?: string;
  transaction_amount?: number;
  currency_id?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  external_reference?: string;
  description?: string;
  date_created?: string;
  date_approved?: string;
  date_last_updated?: string;
  payer?: {
    id?: string | number;
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
  metadata?: Record<string, any>;
  additional_info?: {
    items?: Array<{
      id?: string;
      title?: string;
      description?: string;
      quantity?: number;
      unit_price?: number;
      category_id?: string;
    }>;
  };
}

/**
 * Interface para resposta de preferência de pagamento do MercadoPago
 */
export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
    description?: string;
  }>;
  payer: {
    email?: string;
    name?: string;
    surname?: string;
  };
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: string;
  notification_url?: string;
  external_reference?: string;
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
}

/**
 * Tipos de resposta do processamento de webhook
 */
export type WebhookResponseType = 
  | MercadoPagoPayment 
  | { status: string; id: string; topic?: string };