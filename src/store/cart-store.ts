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
          const itemId = item.id || (item.variantId ? `${item.productId}_${item.variantId}` : item.productId) || `item_${Date.now()}`;
          const existingIndex = state.items.findIndex(
            (i) => (i.id && i.id === itemId) || (i.productId === item.productId && (item.variantId ? i.variantId === item.variantId : !i.variantId))
          );
          if (existingIndex > -1) {
            const newItems = [...state.items];
            const currentQty = newItems[existingIndex].quantity || 1;
            newItems[existingIndex].quantity = Math.min(99, currentQty + qty);
            newItems[existingIndex].id = itemId;
            updatedItems = newItems;
            return { items: newItems, ...(autoOpen ? { isOpen: true } : {}) };
          }
          const newItem: CartItem = {
            ...item,
            id: itemId,
            quantity: Math.min(99, Math.max(1, qty)),
          };
          updatedItems = [...state.items, newItem];
          return { items: updatedItems, ...(autoOpen ? { isOpen: true } : {}) };
        });
        syncCartToSupabase(updatedItems);
      },

      removeItem: (id) => {
        if (!id) return;
        let updatedItems: CartItem[] = [];
        set((state) => {
          updatedItems = state.items.filter((i) => {
            const itemId = i.id || (i.variantId ? `${i.productId}_${i.variantId}` : i.productId);
            return itemId !== id && i.id !== id && i.productId !== id;
          });
          return { items: updatedItems };
        });
        syncCartToSupabase(updatedItems);
      },

      updateQuantity: (id, targetQuantityOrDelta) => {
        if (!id) return;
        let updatedItems: CartItem[] = [];
        set((state) => {
          const newItems = state.items
            .map((item) => {
              const itemId = item.id || (item.variantId ? `${item.productId}_${item.variantId}` : item.productId);
              if (itemId === id || item.id === id || item.productId === id) {
                let newQty: number;
                if (targetQuantityOrDelta === 1) {
                  newQty = (item.quantity || 1) + 1;
                } else if (targetQuantityOrDelta === -1) {
                  newQty = (item.quantity || 1) - 1;
                } else {
                  newQty = targetQuantityOrDelta;
                }
                newQty = Math.min(99, Math.max(1, newQty));
                return { ...item, id: itemId, quantity: newQty };
              }
              // Auto-sanitize any existing inflated quantities in state
              const cleanQty = item.quantity > 99 ? 1 : Math.max(1, item.quantity);
              return { ...item, id: itemId, quantity: cleanQty };
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
        return get().items.reduce((sum, item) => {
          const qty = item.quantity > 99 ? 1 : Math.max(1, item.quantity);
          return sum + item.price * qty;
        }, 0);
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
