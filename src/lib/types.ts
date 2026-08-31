// Mirrors the JSON the api-gateway returns. Kept deliberately small - just the
// fields the storefront uses.

export interface Product {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  sku: string;
}

export interface InventoryLevel {
  productId: number;
  quantityAvailable: number;
}

export interface OrderLine {
  productId: number;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export type OrderStatus =
  | "CONFIRMED"
  | "REJECTED_STOCK"
  | "PAYMENT_FAILED"
  | "PENDING";

export interface Order {
  id: number;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  paymentId: number | null;
  createdAt: string;
  lines: OrderLine[];
}

export interface Payment {
  paymentId: number;
  orderId: number;
  amountCents: number;
  status: "APPROVED" | "DECLINED";
}

export interface Notification {
  id: number;
  userId: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface TokenResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  timestamp: string;
}

// Cart lives only in the browser (localStorage) until checkout.
export interface CartItem {
  productId: number;
  name: string;
  priceCents: number;
  quantity: number;
}
