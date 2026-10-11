import type { ApiProduct } from "./apiProduct";

export interface CartItem {
  id: number;
  product: ApiProduct;
  quantity: number;
  item_total: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: string;
}

export interface CartAddInput {
  product_id: string;
  quantity?: number;
}

export interface CartUpdateInput {
  quantity: number;
}
