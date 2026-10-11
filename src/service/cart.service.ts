import { apiFetch } from "../lib/api";
import type {
  Cart,
  CartAddInput,
  CartItem,
  CartUpdateInput,
} from "../types/cart";

export function getCart(signal?: AbortSignal): Promise<Cart> {
  return apiFetch<Cart>("/api/cart/", { method: "GET", signal });
}

export function addCartItem(
  input: CartAddInput,
  signal?: AbortSignal,
): Promise<CartItem> {
  return apiFetch<CartItem>("/api/cart/items/", {
    method: "POST",
    body: JSON.stringify({ quantity: 1, ...input }),
    signal,
  });
}

export function updateCartItem(
  productId: string,
  input: CartUpdateInput,
  signal?: AbortSignal,
): Promise<CartItem> {
  return apiFetch<CartItem>(`/api/cart/items/${productId}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
    signal,
  });
}

export async function removeCartItem(
  productId: string,
  signal?: AbortSignal,
): Promise<void> {
  await apiFetch<null>(`/api/cart/items/${productId}/`, {
    method: "DELETE",
    signal,
  });
}

export async function clearCart(signal?: AbortSignal): Promise<void> {
  await apiFetch<null>("/api/cart/clear/", { method: "DELETE", signal });
}
