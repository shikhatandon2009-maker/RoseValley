import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Pinyon_Script } from 'next/font/google';
import './globals.css';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { FontProvider } from '@/components/layout/FontProvider';
import { SiteSettingsInitializer } from '@/components/layout/SiteSettingsInitializer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
});

const pinyonScript = Pinyon_Script({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-script',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: "RoseOil.in | 100% Pure Botanical Distillates & Essential Oils",
  description: 'Hand-crafted 100% pure botanical essential oils, hydro-distillates, and rare aromatic extracts.',
  icons: {
    icon: '/images/logo/favicon.png',
    shortcut: '/images/logo/favicon.png',
    apple: '/images/logo/favicon.png',
  },
  openGraph: {
    title: "RoseOil.in | Pure Botanical Essential Oils",
    description: 'Explore pure rose distillations, natural botanical extracts, and therapeutic essential oils.',
    type: 'website',
    images: [{ url: '/images/logo/logo.png', width: 800, height: 600, alt: 'RoseOil.in Logo' }],
  },
  other: {
    'theme-color': '#F7EEED',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable} ${pinyonScript.variable}`}>
      <body className="font-sans min-h-screen flex flex-col justify-between selection:bg-[#F6A6BB] selection:text-neutral-950 relative">
        <SiteSettingsInitializer />
        <FontProvider>
          <ThemeProvider>
            <main className="flex-1">{children}</main>
            <CartDrawer />
            <ScrollToTop />
          </ThemeProvider>
        </FontProvider>
      </body>
    </html>
  );
}
