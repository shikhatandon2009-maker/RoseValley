import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans, Montserrat, Cinzel } from 'next/font/google';
import './globals.css';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-serif',
  display: 'swap',
  preload: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: false,
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
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
    <html lang="en" className={`${playfair.variable} ${plusJakarta.variable} ${montserrat.variable} ${cinzel.variable}`}>
      <body className="font-sans min-h-screen flex flex-col justify-between selection:bg-[#F6A6BB] selection:text-neutral-950 relative">
        <ThemeProvider>
          <main className="flex-1">{children}</main>
          <CartDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
