import type { Metadata } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { FloatingAdminButton } from '@/components/common/FloatingAdminButton';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Rose Valley Kannauj | Artisanal Attars & Pure Essential Oils",
  description: 'Hand-crafted traditional Kannauj attars and 100% pure botanical essential oils distilled using centuries-old Deg-Bhapka copper stills.',
  openGraph: {
    title: "Rose Valley Kannauj | Artisanal Perfumes & Attars",
    description: 'Explore rare rose distillations, hydro-distilled attars, and pure essential oils from Kannauj.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <body className="font-sans min-h-screen flex flex-col justify-between selection:bg-[#F6A6BB] selection:text-neutral-950 relative">
        <ThemeProvider>
          <main className="flex-1">{children}</main>
          <CartDrawer />
        </ThemeProvider>
      </body>
    </html>
  );
}
