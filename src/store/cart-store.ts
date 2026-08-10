import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product_id or variant_id
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number; // base price in INR
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number, autoOpen?: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  getTotalINR: () => number;
  syncLiveCart: () => void;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 'guest_session_default';
  let sid = localStorage.getItem('maison_guest_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    localStorage.setItem('maison_guest_session_id', sid);
  }
  return sid;
}

async function syncCartToSupabase(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  const sessionId = getSessionId();
  try {
    await fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        items,
      }),
    });
  } catch (e) {
    console.error('Cart sync error:', e);
  }
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = 1, autoOpen = true) => {
        let updatedItems: CartItem[] = [];
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          );
          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += qty;
            updatedItems = newItems;
            return { items: newItems, ...(autoOpen ? { isOpen: true } : {}) };
          }
          updatedItems = [...state.items, { ...item, quantity: qty }];
          return { items: updatedItems, ...(autoOpen ? { isOpen: true } : {}) };
        });
        syncCartToSupabase(updatedItems);
      },

      removeItem: (id) => {
        let updatedItems: CartItem[] = [];
        set((state) => {
          updatedItems = state.items.filter((i) => i.id !== id);
          return { items: updatedItems };
        });
        syncCartToSupabase(updatedItems);
      },

      updateQuantity: (id, delta) => {
        let updatedItems: CartItem[] = [];
        set((state) => {
          const newItems = state.items
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];
          updatedItems = newItems;
          return { items: newItems };
        });
        syncCartToSupabase(updatedItems);
      },

      clearCart: () => {
        set({ items: [] });
        syncCartToSupabase([]);
      },

      toggleCart: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      getTotalINR: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      syncLiveCart: () => {
        syncCartToSupabase(get().items);
      },
    }),
    {
      name: 'maison_perfumes_cart',
    }
  )
);
