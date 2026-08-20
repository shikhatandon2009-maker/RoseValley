import { create } from 'zustand';
import { formatImageUrl } from '@/lib/format-image';

export interface SiteSettings {
  store_id: string;
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  use_text_logo: boolean;
  contact_email: string;
  contact_phone: string;
  shipping_rates: {
    standard: number;
    express: number;
    free_threshold: number;
  };
  tax_rate: number;
  store_gstin?: string;
  social_links: Record<string, string>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  store_id: 'essential_oils_perfumes_store_01',
  site_name: 'Rose Valley Kannauj',
  tagline: 'Artisanal Attars & Pure Distillates • Kannauj',
  logo_url: '/images/logo/logo.png',
  favicon_url: '/images/logo/favicon.png',
  use_text_logo: false,
  contact_email: 'support@rosevalleykannauj.com',
  contact_phone: '+91 98765 43210',
  shipping_rates: { standard: 150, express: 300, free_threshold: 2500 },
  tax_rate: 18.00,
  store_gstin: '09AAACR1234F1Z5',
  social_links: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  },
};

export function updateFaviconInDOM(faviconUrl: string) {
  if (typeof window === 'undefined') return;
  const formattedFavicon = formatImageUrl(faviconUrl, '/images/logo/favicon.png');

  // Find or create rel="icon" and rel="shortcut icon"
  const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
  rels.forEach((rel) => {
    let link: HTMLLinkElement | null = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.getElementsByTagName('head')[0]?.appendChild(link);
    }
    link.href = formattedFavicon;
  });
}

export interface SiteSettingsState {
  settings: SiteSettings;
  loaded: boolean;
  fetchSettings: (force?: boolean) => Promise<void>;
  setSettings: (newSettings: Partial<SiteSettings>) => void;
}

let inFlightSettingsPromise: Promise<void> | null = null;

export const useSiteSettingsStore = create<SiteSettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  fetchSettings: async (force = false) => {
    // If already loaded and not forcing, return instantly without network request
    if (get().loaded && !force) {
      return;
    }

    // Deduplicate in-flight promises across simultaneous component mounts
    if (inFlightSettingsPromise) {
      return inFlightSettingsPromise;
    }

    // Hydrate cached settings from localStorage if available
    if (typeof window !== 'undefined' && !get().loaded) {
      try {
        const cached = localStorage.getItem('cached_site_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          set({ settings: { ...DEFAULT_SETTINGS, ...parsed } });
        }
      } catch (e) {}
    }

    inFlightSettingsPromise = (async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            const formattedLogo = formatImageUrl(data.settings.logo_url, '/images/logo/logo.png');
            const formattedFavicon = formatImageUrl(data.settings.favicon_url, '/images/logo/favicon.png');

            const updated: SiteSettings = {
              ...DEFAULT_SETTINGS,
              ...data.settings,
              logo_url: formattedLogo,
              favicon_url: formattedFavicon,
            };

            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('cached_site_settings', JSON.stringify(updated));
              } catch (e) {}
            }

            set({ settings: updated, loaded: true });
            updateFaviconInDOM(formattedFavicon);
          }
        }
      } catch (e) {
        console.error('Error fetching site settings in store:', e);
      } finally {
        inFlightSettingsPromise = null;
      }
    })();

    return inFlightSettingsPromise;
  },
  setSettings: (newSettings) => {
    const current = get().settings;
    const formattedLogo = newSettings.logo_url
      ? formatImageUrl(newSettings.logo_url, current.logo_url)
      : current.logo_url;
    const formattedFavicon = newSettings.favicon_url
      ? formatImageUrl(newSettings.favicon_url, current.favicon_url)
      : current.favicon_url;

    const updated: SiteSettings = {
      ...current,
      ...newSettings,
      logo_url: formattedLogo,
      favicon_url: formattedFavicon,
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cached_site_settings', JSON.stringify(updated));
      } catch (e) {}
    }

    set({ settings: updated, loaded: true });
    updateFaviconInDOM(formattedFavicon);
  },
}));
