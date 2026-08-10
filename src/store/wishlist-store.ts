import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  productIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  syncLiveWishlist: () => void;
}

async function syncWishlistToSupabase(productIds: string[]) {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/wishlist/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productIds,
      }),
    });
  } catch (e) {
    console.error('Wishlist sync error:', e);
  }
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggleWishlist: (productId: string) => {
        let updatedIds: string[] = [];
        set((state) => {
          const exists = state.productIds.includes(productId);
          if (exists) {
            updatedIds = state.productIds.filter((id) => id !== productId);
          } else {
            updatedIds = [...state.productIds, productId];
          }
          return { productIds: updatedIds };
        });
        syncWishlistToSupabase(updatedIds);
      },

      isInWishlist: (productId: string) => {
        return get().productIds.includes(productId);
      },

      syncLiveWishlist: () => {
        syncWishlistToSupabase(get().productIds);
      },
    }),
    {
      name: 'maison_wishlist',
    }
  )
);
