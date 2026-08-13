'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Package,
  Layers,
  Tags,
  ShoppingBag,
  ListOrdered,
  ShoppingCart,
  Heart,
  Ticket,
  Star,
  HelpCircle,
  MessageSquare,
  Settings,
  Globe,
  FileText,
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Type,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
    settings: false,
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups = [
    {
      title: 'CORE MANAGEMENT',
      items: [
        {
          label: 'Dashboard Overview',
          href: '/admin',
          icon: LayoutDashboard,
        },
        {
          label: 'Users / Customers',
          href: '/admin/users',
          icon: Users,
        },
        {
          label: 'Categories',
          href: '/admin/categories',
          icon: FolderTree,
        },
      ],
    },
    {
      title: 'CATALOG & INVENTORY',
      items: [
        {
          label: 'Products',
          href: '/admin/products',
          icon: Package,
          children: [
            { label: 'All Products', href: '/admin/products', icon: Layers },
            { label: 'Product Variants', href: '/admin/products/variants', icon: Tags },
            { label: 'Product Categories', href: '/admin/products/categories', icon: FolderTree },
          ],
        },
      ],
    },
    {
      title: 'SALES & ACTIVITY',
      items: [
        {
          label: 'Orders',
          href: '/admin/orders',
          icon: ShoppingBag,
          children: [
            { label: 'All Orders', href: '/admin/orders', icon: ShoppingBag },
            { label: 'Order Items', href: '/admin/orders/items', icon: ListOrdered },
          ],
        },
        {
          label: 'Live Cart Items',
          href: '/admin/cart-items',
          icon: ShoppingCart,
          badge: 'Live',
        },
        {
          label: 'Wishlists',
          href: '/admin/wishlists',
          icon: Heart,
        },
        {
          label: 'Coupons & Discounts',
          href: '/admin/coupons',
          icon: Ticket,
        },
      ],
    },
    {
      title: 'COMMUNITY & FEEDBACK',
      items: [
        {
          label: 'Reviews & Votes',
          href: '/admin/reviews',
          icon: Star,
        },
        {
          label: 'Product Q&A',
          href: '/admin/qa',
          icon: HelpCircle,
        },
        {
          label: 'Chat & AI Assistant',
          href: '/admin/chat',
          icon: MessageSquare,
        },
      ],
    },
    {
      title: 'STORE CONFIGURATION',
      items: [
        {
          label: 'Site Settings',
          href: '/admin/settings',
          icon: Settings,
        },
        {
          label: 'Countries & Addresses',
          href: '/admin/countries',
          icon: Globe,
        },
        {
          label: 'Pages (Static & Blog)',
          href: '/admin/pages',
          icon: FileText,
        },
        {
          label: 'Notification Logs',
          href: '/admin/notifications/logs',
          icon: Mail,
        },
      ],
    },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          w-72 lg:w-72 bg-white border-r border-[#F7D1D8] text-[#1A0510]
          flex flex-col shadow-xl lg:shadow-sm select-none antialiased
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#F7D1D8] bg-[#FAE6E7]/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group" onClick={handleLinkClick}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F6A6BB] via-[#F4BBC9] to-[#F7D1D8] p-0.5 shadow-md flex-shrink-0">
              <div className="w-full h-full bg-[#4A0D25] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#F6A6BB] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-[#1A0510] text-lg tracking-wider group-hover:text-[#4A0D25] transition-colors leading-tight">
                ROSE VALLEY
              </h1>
              <p className="text-[10px] tracking-widest text-[#4A0D25] uppercase font-black">
                Admin Suite
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] transition-all"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-black tracking-widest text-[#4A0D25]/60 uppercase">
                {group.title}
              </div>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isSubmenuOpen = openSubmenus[item.label.toLowerCase().replace(/\s+/g, '')];
                  const isActive = pathname === item.href || (hasChildren && item.children?.some(c => pathname === c.href));

                  if (hasChildren) {
                    return (
                      <div key={item.href} className="space-y-0.5">
                        <button
                          onClick={() => toggleSubmenu(item.label.toLowerCase().replace(/\s+/g, ''))}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-extrabold transition-all duration-200 ${
                            isActive
                              ? 'bg-[#4A0D25] text-white shadow-sm'
                              : 'text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/70'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {isSubmenuOpen ? (
                            <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                          ) : (
                            <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                          )}
                        </button>

                        {isSubmenuOpen && (
                          <div className="pl-7 space-y-0.5 border-l-2 border-[#F6A6BB]/40 ml-4 py-0.5">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href;
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={handleLinkClick}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                    isChildActive
                                      ? 'bg-[#FAE6E7] text-[#4A0D25] border border-[#F6A6BB] shadow-xs'
                                      : 'text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/60'
                                  }`}
                                >
                                  {ChildIcon && <ChildIcon className="w-3.5 h-3.5 text-[#F6A6BB]" />}
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-extrabold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#4A0D25] text-white shadow-sm'
                          : 'text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#F6A6BB] text-[#4A0D25]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Quick Action */}
        <div className="p-3 border-t border-[#F7D1D8] bg-[#FAE6E7]/80 space-y-1.5">
          <Link
            href="/"
            target="_blank"
            onClick={handleLinkClick}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#4A0D25] hover:text-[#1A0510] hover:bg-white transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#F6A6BB]" /> View Storefront
            </span>
          </Link>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#F7D1D8] text-[10px] text-[#1A0510] shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="font-black">Connected</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
