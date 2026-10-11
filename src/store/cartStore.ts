import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  oldPrice: string;
  image: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// change price from str to num
const parsePrice = (price: string) =>
  parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === newItem.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + parsePrice(i.price) * i.quantity,
          0,
        ),
    }),
    {
      name: "cake-shop-cart",
      version: 2,
      // Product ids changed from mock numbers to backend UUID strings —
      // old persisted carts reference products that no longer exist.
      migrate: (persisted: unknown) => {
        const state = persisted as { items?: CartItem[] };
        if (!state || !Array.isArray(state.items)) return { items: [] };
        return {
          items: state.items.filter((i) => typeof i?.id === "string"),
        };
      },
    },
  ),
);
