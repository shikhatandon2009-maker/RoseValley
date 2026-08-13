import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Pinyon_Script } from 'next/font/google';
import './globals.css';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { FontProvider } from '@/components/layout/FontProvider';

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
  title: "Rose Valley Kannauj | Artisanal Attars & Pure Essential Oils",
  description: 'Hand-crafted traditional Kannauj attars and 100% pure botanical essential oils distilled using centuries-old Deg-Bhapka copper stills.',
  openGraph: {
    title: "Rose Valley Kannauj | Artisanal Perfumes & Attars",
    description: 'Explore rare rose distillations, hydro-distilled attars, and pure essential oils from Kannauj.',
    type: 'website',
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
        <FontProvider>
          <ThemeProvider>
            <main className="flex-1">{children}</main>
            <CartDrawer />
          </ThemeProvider>
        </FontProvider>
      </body>
    </html>
  );
}
