
export type OrderStatus =
  | "waiting_for_approval"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "canceled"
  | string;

export type PaymentMethod = "cash" | "card" | "online" | string;

export interface OrderItem {
  product_name: string;
  quantity: number;
  price_at_purchase: string;
  old_price_at_purchase: string | null;
}

export interface Order {
  id: number;
  status: OrderStatus;
  full_name: string;
  phone_number: string;
  city: string;
  delivery_address: string;
  payment_method: PaymentMethod;
  notes: string;
  total_price: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}
