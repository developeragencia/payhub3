import { ReactNode } from "react";
import { initMercadoPago } from "@mercadopago/sdk-react";

// Chave pública para o cliente
// Usamos o prefixo VITE_ para que esteja disponível no frontend
const PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "TEST-dd6bf5c2-02cf-492c-9f0d-de2e24e30103";

// Inicializa o MercadoPago com a chave pública
initMercadoPago(PUBLIC_KEY, { locale: 'pt-BR' });

interface MercadoPagoProviderProps {
  children: ReactNode;
}

export function MercadoPagoProvider({ children }: MercadoPagoProviderProps) {
  return <>{children}</>;
}