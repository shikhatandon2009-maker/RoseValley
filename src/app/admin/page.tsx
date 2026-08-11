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
    { title: 'Total Customers', count: `${customersCount}`, change: 'Live DB', icon: Users, href: '/admin/users' },
    { title: 'Categories', count: `${categoriesCount} Active`, change: 'Live DB', icon: FolderTree, href: '/admin/categories' },
    { title: 'Products & Variants', count: `${productsCount} Items`, change: 'Live DB', icon: Package, href: '/admin/products' },
    { title: 'Total Orders', count: `${ordersCount}`, change: 'Live DB', icon: ShoppingBag, href: '/admin/orders' },
    { title: 'Live Carts', count: `${cartsCount} Online`, change: 'Active', icon: ShoppingCart, href: '/admin/cart-items' },
    { title: 'Wishlists', count: `${wishlistsCount} Items`, change: 'Tracked', icon: Heart, href: '/admin/wishlists' },
    { title: 'Coupons', count: `${couponsCount} Codes`, change: 'Active', icon: Ticket, href: '/admin/coupons' },
    { title: 'Reviews & Q&A', count: `${totalReviewsAndQa} Items`, change: `${reviewsCount} Rev / ${qaCount} Q&A`, icon: Star, href: '/admin/reviews' },
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
      desc: 'Organize catalog into Luxury Perfumes, Attars, Essential Oils, etc.',
      icon: FolderTree,
      href: '/admin/categories',
      badge: 'Categories',
    },
    {
      title: 'Products, Variants & Categories',
      desc: 'Manage perfume items, 50ml/100ml variants, prices, stock & category maps.',
      icon: Package,
      href: '/admin/products',
      badge: 'Catalog & Stock',
    },
    {
      title: 'Orders & Order Items',
      desc: 'Track sales, dispatch orders, view customer line items and fulfillment status.',
      icon: ShoppingBag,
      href: '/admin/orders',
      badge: 'Orders & Items',
    },
    {
      title: 'Live Cart Items (Customer/Visitor)',
      desc: 'Monitor real-time abandoned & active cart contents by user session.',
      icon: ShoppingCart,
      href: '/admin/cart-items',
      badge: 'Live Tracker',
    },
    {
      title: 'Wishlists',
      desc: 'Track customer wishlisted fragrances and demand analytics.',
      icon: Heart,
      href: '/admin/wishlists',
      badge: 'Wishlists',
    },
    {
      title: 'Coupons & Discount Rules',
      desc: 'Create discount codes, percentage / fixed offers, and expiry criteria.',
      icon: Ticket,
      href: '/admin/coupons',
      badge: 'Promotions',
    },
    {
      title: 'Reviews & Review Votes',
      desc: 'Approve customer reviews, ratings, verified purchase badges, and helpful votes.',
      icon: Star,
      href: '/admin/reviews',
      badge: 'Reviews & Votes',
    },
    {
      title: 'Product Questions & Answers',
      desc: 'Answer shopper product inquiries and manage published Q&A.',
      icon: HelpCircle,
      href: '/admin/qa',
      badge: 'Q&A',
    },
    {
      title: 'Executive Typography & Font Suite',
      desc: 'Select and customize luxury heading, calligraphic script, and body fonts site-wide.',
      icon: Type,
      href: '/admin/fonts',
      badge: 'Font Suite',
    },
    {
      title: 'Site Settings & Homepage Sections',
      desc: 'Configure store details, tax rates, shipping policies & homepage layout grids.',
      icon: Settings,
      href: '/admin/settings',
      badge: 'Settings & Home',
    },
    {
      title: 'Pages (Static Content & Blog)',
      desc: 'Publish bespoke brand story pages, press releases, and blog articles.',
      icon: FileText,
      href: '/admin/pages',
      badge: 'Pages & Blog',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 selection:bg-[#F6A6BB] selection:text-[#4A0D25]">
      {/* Top Banner */}
      <div className="rounded-3xl bg-white border border-[#F7D1D8] p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Maison Essence Executive Control
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A0510] tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-[#4A0D25] text-sm mt-2 max-w-xl font-semibold">
              Live database metrics synchronized in real time. Select any section below or use the sidebar navigation to manage catalog details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 rounded-xl bg-[#F6A6BB] text-[#4A0D25] font-extrabold text-xs hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#4A0D25]" /> Manage Catalog
            </Link>
            <Link
              href="/admin/orders"
              className="px-5 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-[#1A0510] font-bold text-xs hover:bg-[#F7EEED] transition-all flex items-center gap-2 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#F6A6BB]" /> View Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - LIVE SUPABASE VALUES */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="p-5 rounded-2xl bg-white border border-[#F7D1D8] hover:border-[#F6A6BB] transition-all group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A0D25] group-hover:text-[#1A0510] transition-colors">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-[#FAE6E7] text-[#4A0D25] border border-[#F7D1D8]">
                  <Icon className="w-4 h-4 text-[#F6A6BB]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-bold font-serif text-[#1A0510]">{card.count}</div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F6A6BB]/30 text-[#4A0D25] border border-[#F7D1D8]">
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
          <h2 className="text-xl font-serif font-bold text-[#1A0510] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#F6A6BB]" /> Administrative Sections
          </h2>
          <span className="text-xs text-[#4A0D25] font-semibold">Ready for page building details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sectionsList.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Link
                key={idx}
                href={section.href}
                className="group p-6 rounded-2xl bg-white border border-[#F7D1D8] hover:border-[#F6A6BB] transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#F6A6BB]" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#F7EEED] text-[#4A0D25] border border-[#F7D1D8]">
                      {section.badge}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-[#1A0510] text-base group-hover:text-[#4A0D25] transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-[#4A0D25] mt-2 leading-relaxed font-semibold">
                    {section.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F7D1D8] flex items-center justify-between text-xs font-extrabold text-[#4A0D25] group-hover:text-[#1A0510]">
                  <span>Open Management Shell</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#F6A6BB]" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
