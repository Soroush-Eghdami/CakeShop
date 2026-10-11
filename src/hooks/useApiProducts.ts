import { useCallback, useEffect, useState } from "react";
import { getApiProductDetail, getApiProducts } from "../service/productApi.service";
import { toUiProduct } from "../service/productAdapter";
import type { Product } from "../types/product";

interface ListResult {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiProducts(categorySlug?: string): ListResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getApiProducts(categorySlug, controller.signal);
        if (!controller.signal.aborted) setProducts(data.map(toUiProduct));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load products.");
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [categorySlug, nonce]);

  return { products, isLoading, error, refetch };
}

interface DetailResult {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

export function useApiProductDetail(productId: string | undefined): DetailResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      setProduct(null);
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getApiProductDetail(productId, controller.signal);
        if (!controller.signal.aborted) setProduct(toUiProduct(data));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load product.");
        setProduct(null);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [productId]);

  return { product, isLoading, error };
}
