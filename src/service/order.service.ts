import { apiFetch } from "../lib/api";
import type { Order } from "../types/order";

/**
 * GET /api/orders/
 * List user orders — returns all orders for the current user, newest first.
 * Requires authentication (HttpOnly access_token cookie, sent via credentials: include).
 */
export function getOrders(signal?: AbortSignal): Promise<Order[]> {
  return apiFetch<Order[]>("/api/orders/", {
    method: "GET",
    signal,
  });
}

export function getOrderDetail(
  orderId: number,
  signal?: AbortSignal,
): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}/`, {
    method: "GET",
    signal,
  });
}

export interface CreateOrderInput {
  full_name: string;
  phone_number: string;
  city: string;
  delivery_address: string;
  payment_method: "cash" | "card" | "online";
  notes?: string;
}


export function createOrder(
  input: CreateOrderInput,
  signal?: AbortSignal,
): Promise<Order> {
  return apiFetch<Order>("/api/orders/create/", {
    method: "POST",
    body: JSON.stringify(input),
    signal,
  });
}
