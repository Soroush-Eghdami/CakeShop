import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../lib/api";
import { getOrders } from "../service/order.service";
import type { Order } from "../types/order";

interface UseOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  isUnauthorized: boolean;
  refetch: () => void;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setIsLoading(true);
      setError(null);
      setIsUnauthorized(false);
      try {
        const data = await getOrders(controller.signal);
        setOrders(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          setIsUnauthorized(true);
          setError("Please sign in to view your orders.");
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to load orders.",
          );
        }
        setOrders([]);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [nonce]);

  return { orders, isLoading, error, isUnauthorized, refetch };
}
