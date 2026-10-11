import { apiFetch } from "../lib/api";
import type { ApiProduct, Category } from "../types/apiProduct";

export function getApiProducts(
  categorySlug?: string,
  signal?: AbortSignal,
): Promise<ApiProduct[]> {
  const path =
    categorySlug && categorySlug.length > 0
      ? `/api/products/?category=${encodeURIComponent(categorySlug)}`
      : "/api/products/";
  return apiFetch<ApiProduct[]>(path, { method: "GET", signal });
}

export function getCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiFetch<Category[]>("/api/products/categories/", {
    method: "GET",
    signal,
  });
}

export function getApiProductDetail(
  productId: string,
  signal?: AbortSignal,
): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/api/products/${productId}/`, {
    method: "GET",
    signal,
  });
}
