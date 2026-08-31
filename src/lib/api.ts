import "server-only";
import { getSession } from "@/lib/session";
import type {
  Product,
  InventoryLevel,
  Order,
  Payment,
  Notification,
} from "@/lib/types";

const GATEWAY = process.env.GATEWAY_URL ?? "http://localhost:8080";

export class GatewayError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

interface CallOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

/**
 * The one place the server talks to the platform. Attaches the bearer token from
 * the session cookie when `auth` is set. Never called from the browser.
 * Always fetched fresh - responses are per-user and cheap.
 */
export async function gateway<T>(
  path: string,
  { method = "GET", body, auth = false }: CallOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const session = await getSession();
    if (!session) throw new GatewayError(401, "NO_SESSION", "Not signed in");
    headers.Authorization = `Bearer ${session.token}`;
  }

  const res = await fetch(`${GATEWAY}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new GatewayError(
      res.status,
      problem?.code ?? "ERROR",
      problem?.message ?? res.statusText,
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// --- typed helpers the pages actually call -----------------------------------

export const listProducts = () =>
  gateway<Product[]>("/api/products", { auth: true });

export const getProduct = (id: string | number) =>
  gateway<Product>(`/api/products/${id}`, { auth: true });

export const getInventory = (id: string | number) =>
  gateway<InventoryLevel>(`/api/inventory/${id}`, { auth: true });

export const myOrders = (userId: string) =>
  gateway<Order[]>(`/api/orders?userId=${encodeURIComponent(userId)}`, {
    auth: true,
  });

export const getPayment = (id: string | number) =>
  gateway<Payment>(`/api/payments/${id}`, { auth: true });

export const myNotifications = (userId: string) =>
  gateway<Notification[]>(
    `/api/notifications?userId=${encodeURIComponent(userId)}`,
    { auth: true },
  );
