import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // product_id or variant_id
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number; // base price in INR
  quantity: number;
  image: string;
  net_weight?: number;
  weight_unit?: string;
  gross_weight?: number;
  item_shipping_cost?: number;
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
}

function sanitizeImageUrl(imgUrl: string | undefined): string {
  if (!imgUrl || typeof imgUrl !== 'string') return '';
  // Prevent storing megabytes of raw base64 data URLs in localStorage quota (>5000 chars)
  if (imgUrl.startsWith('data:image/') || imgUrl.length > 5000) {
    return '';
  }
  return imgUrl;
}

// Custom quota-safe localStorage engine that catches QuotaExceededError
const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('LocalStorage QuotaExceededError caught in cart-store. Cleaning up & sanitizing...');
      try {
        const parsed = JSON.parse(value);
        if (parsed?.state?.items && Array.isArray(parsed.state.items)) {
          parsed.state.items = parsed.state.items.map((item: CartItem) => ({
            ...item,
            image: sanitizeImageUrl(item.image),
          }));
          localStorage.setItem(name, JSON.stringify(parsed));
          return;
        }
      } catch (innerErr) {}

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key !== name && (key.startsWith('roseoil_') || key.startsWith('maison_'))) {
            try { localStorage.removeItem(key); } catch (err) {}
          }
        }
        localStorage.setItem(name, value);
      } catch (finalErr) {
        console.error('SafeLocalStorage setItem fallback executed cleanly:', finalErr);
      }
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch (e) {}
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = 1, autoOpen = true) => {
        const cleanImage = sanitizeImageUrl(item.image) || item.image || '';
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
            newItems[existingIndex].image = cleanImage || newItems[existingIndex].image;
            return { items: newItems, ...(autoOpen ? { isOpen: true } : {}) };
          }
          const newItem: CartItem = {
            ...item,
            id: itemId,
            image: cleanImage,
            quantity: Math.min(99, Math.max(1, qty)),
          };
          return { items: [...state.items, newItem], ...(autoOpen ? { isOpen: true } : {}) };
        });
      },

      removeItem: (id) => {
        if (!id) return;
        set((state) => ({
          items: state.items.filter((i) => {
            const itemId = i.id || (i.variantId ? `${i.productId}_${i.variantId}` : i.productId);
            return itemId !== id && i.id !== id && i.productId !== id;
          }),
        }));
      },

      updateQuantity: (id, targetQuantityOrDelta) => {
        if (!id) return;
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
                return { ...item, id: itemId, image: item.image, quantity: newQty };
              }
              const cleanQty = item.quantity > 99 ? 1 : Math.max(1, item.quantity);
              return { ...item, id: itemId, image: item.image, quantity: cleanQty };
            })
            .filter(Boolean) as CartItem[];
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: (open) => set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),

      getTotalINR: () => {
        const currentItems = get().items || [];
        return currentItems.reduce((sum, item) => {
          const p = Number(item.price) || 0;
          const q = Number(item.quantity) || 1;
          const qty = q > 99 ? 1 : Math.max(1, q);
          return sum + p * qty;
        }, 0);
      },
    }),
    {
      name: 'roseoil_perfumes_cart',
      storage: createJSONStorage(() => safeLocalStorage),
    }
  )
);
