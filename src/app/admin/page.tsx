import React from 'react';
import Link from 'next/link';
import {
  Users,
  FolderTree,
  Package,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Ticket,
  Star,
  HelpCircle,
  Settings,
  FileText,
  ArrowUpRight,
  Sparkles,
  Activity,
  Type
} from 'lucide-react';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let customersCount = 0;
  let categoriesCount = 0;
  let productsCount = 0;
  let ordersCount = 0;
  let cartsCount = 0;
  let wishlistsCount = 0;
  let couponsCount = 0;
  let reviewsCount = 0;
  let qaCount = 0;

  try {
    const supabase = getSupabaseServerClient();
    if (supabase) {
      const [
        customersRes,
        categoriesRes,
        productsRes,
        ordersRes,
        cartsRes,
        wishlistsRes,
        couponsRes,
        reviewsRes,
        qaRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('cart_items').select('id', { count: 'exact', head: true }),
        supabase.from('wishlists').select('id', { count: 'exact', head: true }),
        supabase.from('coupons').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
        supabase.from('product_qa').select('id', { count: 'exact', head: true }),
      ]);

      customersCount = customersRes.count ?? 0;
      categoriesCount = categoriesRes.count ?? 0;
      productsCount = productsRes.count ?? 0;
      ordersCount = ordersRes.count ?? 0;
      cartsCount = cartsRes.count ?? 0;
      wishlistsCount = wishlistsRes.count ?? 0;
      couponsCount = couponsRes.count ?? 0;
      reviewsCount = reviewsRes.count ?? 0;
      qaCount = qaRes.count ?? 0;
    }
  } catch (err) {
    console.error('Error fetching live admin metrics:', err);
  }

  const totalReviewsAndQa = reviewsCount + qaCount;

  const summaryCards = [
    { title: 'Customers', count: `${customersCount}`, change: 'Live DB', icon: Users, href: '/admin/users' },
    { title: 'Categories', count: `${categoriesCount}`, change: 'Live DB', icon: FolderTree, href: '/admin/categories' },
    { title: 'Products', count: `${productsCount}`, change: 'Live DB', icon: Package, href: '/admin/products' },
    { title: 'Orders', count: `${ordersCount}`, change: 'Live DB', icon: ShoppingBag, href: '/admin/orders' },
    { title: 'Carts', count: `${cartsCount}`, change: 'Active', icon: ShoppingCart, href: '/admin/cart-items' },
    { title: 'Wishlists', count: `${wishlistsCount}`, change: 'Tracked', icon: Heart, href: '/admin/wishlists' },
    { title: 'Coupons', count: `${couponsCount}`, change: 'Active', icon: Ticket, href: '/admin/coupons' },
    { title: 'Reviews', count: `${totalReviewsAndQa}`, change: `${reviewsCount}R / ${qaCount}Q`, icon: Star, href: '/admin/reviews' },
  ];

  const sectionsList = [
    {
      title: 'Users & Customers',
      desc: 'Manage registered customers, roles, profiles, and order histories.',
      icon: Users,
      href: '/admin/users',
      badge: 'Users',
    },
    {
      title: 'Categories',
      desc: 'Organize catalog into Perfumes, Attars, Essential Oils.',
      icon: FolderTree,
      href: '/admin/categories',
      badge: 'Categories',
    },
    {
      title: 'Products & Variants',
      desc: 'Manage items, variants, prices, stock & category maps.',
      icon: Package,
      href: '/admin/products',
      badge: 'Catalog',
    },
    {
      title: 'Orders & Items',
      desc: 'Track sales, dispatch, and customer fulfillment.',
      icon: ShoppingBag,
      href: '/admin/orders',
      badge: 'Orders',
    },
    {
      title: 'Live Cart Items',
      desc: 'Monitor abandoned & active carts by session.',
      icon: ShoppingCart,
      href: '/admin/cart-items',
      badge: 'Live',
    },
    {
      title: 'Wishlists',
      desc: 'Track wishlisted fragrances and demand.',
      icon: Heart,
      href: '/admin/wishlists',
      badge: 'Wishlists',
    },
    {
      title: 'Coupons & Discounts',
      desc: 'Create discount codes and expiry criteria.',
      icon: Ticket,
      href: '/admin/coupons',
      badge: 'Promos',
    },
    {
      title: 'Reviews & Votes',
      desc: 'Approve ratings and verified purchase badges.',
      icon: Star,
      href: '/admin/reviews',
      badge: 'Reviews',
    },
    {
      title: 'Product Q&A',
      desc: 'Answer shopper inquiries and manage Q&A.',
      icon: HelpCircle,
      href: '/admin/qa',
      badge: 'Q&A',
    },
    {
      title: 'Typography & Fonts',
      desc: 'Select luxury heading and body fonts site-wide.',
      icon: Type,
      href: '/admin/fonts',
      badge: 'Fonts',
    },
    {
      title: 'Site Settings',
      desc: 'Store details, tax rates, shipping, homepage.',
      icon: Settings,
      href: '/admin/settings',
      badge: 'Settings',
    },
    {
      title: 'Pages & Blog',
      desc: 'Publish brand pages, press, and blog articles.',
      icon: FileText,
      href: '/admin/pages',
      badge: 'Pages',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 selection:bg-[#F6A6BB] selection:text-[#4A0D25]">
      {/* Top Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-[#F7D1D8] p-5 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#F6A6BB]" /> Executive Control
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#1A0510] tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-[#4A0D25] text-xs sm:text-sm mt-2 max-w-xl font-semibold">
              Live database metrics synced in real time. Select any section to manage catalog details.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/admin/products"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-extrabold text-[11px] sm:text-xs hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Manage Catalog
            </Link>
            <Link
              href="/admin/orders"
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#1A0510] font-bold text-[11px] sm:text-xs hover:bg-[#F7EEED] transition-all flex items-center gap-2 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#F6A6BB]" /> View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid — Mobile: 2 cols, Tablet: 2, Desktop: 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#F7D1D8] hover:border-[#F6A6BB] transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-[#4A0D25] group-hover:text-[#1A0510] transition-colors truncate pr-2">
                  {card.title}
                </span>
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8] flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F6A6BB]" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-baseline justify-between gap-1">
                <div className="text-xl sm:text-2xl font-bold font-serif text-[#1A0510]">{card.count}</div>
                <span className="text-[8px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F6A6BB]/30 text-[#4A0D25] border border-[#F7D1D8] truncate">
                  {card.change}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Sections Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1A0510] flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#F6A6BB]" /> Admin Sections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {sectionsList.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Link
                key={idx}
                href={section.href}
                className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#F7D1D8] hover:border-[#F6A6BB] transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F6A6BB]" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F7EEED] text-[#4A0D25] border border-[#F7D1D8]">
                      {section.badge}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-[#1A0510] text-sm sm:text-base group-hover:text-[#4A0D25] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#4A0D25] mt-1.5 leading-relaxed font-semibold line-clamp-2">
                    {section.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F7D1D8] flex items-center justify-between text-[11px] sm:text-xs font-extrabold text-[#4A0D25] group-hover:text-[#1A0510]">
                  <span>Open</span>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#F6A6BB]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
