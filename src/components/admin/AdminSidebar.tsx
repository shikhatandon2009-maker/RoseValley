'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteSettingsStore } from '@/store/site-settings-store';
import { formatImageUrl } from '@/lib/format-image';
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
  MessageCircle,
  Settings,
  Globe,
  FileText,
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Type,
  Lock,
  X,
  Bot,
  Sliders,
  Zap,
  Link2
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavChildItem {
  label: string;
  href: string;
  icon?: any;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavChildItem[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const settings = useSiteSettingsStore((s) => s.settings);

  const handleLockPortal = () => {
    localStorage.removeItem('rv_admin_pin_unlocked_198411');
    sessionStorage.removeItem('rv_admin_pin_unlocked_198411');
    window.dispatchEvent(new Event('lock_admin_portal'));
  };

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    orders: false,
    settings: false,
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navGroups: NavGroup[] = [
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
        },
        {
          label: 'Bulk Price Manager',
          href: '/admin/products/bulk-pricing',
          icon: Zap,
          badge: '1-Click',
        },
        {
          label: 'URL Slug Manager',
          href: '/admin/products/slugs',
          icon: Link2,
          badge: 'SEO',
        },
        {
          label: 'SEO & Content Studio',
          href: '#seo-drawer',
          icon: Sparkles,
          badge: 'Live',
        },
        {
          label: 'AI Prompts Studio',
          href: '/admin/prompts',
          icon: Bot,
          badge: 'New',
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
          label: 'Customer Inquiries & Desk',
          href: '/admin/inquiries',
          icon: MessageCircle,
          badge: 'Live',
        },
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
        {/* Brand Header & Top Left Lock Portal */}
        <div className="px-3 py-2.5 border-b border-[#F7D1D8] bg-[#FAE6E7]/80 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2 group" onClick={handleLinkClick}>
              {!settings.use_text_logo && (
                <div className="p-0.5 rounded-lg bg-white border border-[#F7D1D8] shadow-xs">
                  <img 
                    src={formatImageUrl(settings.logo_url, '/images/logo/logo.png')} 
                    alt={settings.site_name || "RoseOil.in"} 
                    className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/logo/logo.png';
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className="font-serif font-extrabold text-[#1A0510] text-xs tracking-wider group-hover:text-[#4A0D25] transition-colors leading-tight uppercase">
                  {settings.site_name || 'ROSEOIL.IN'}
                </h1>
                <p className="text-[8px] tracking-widest text-[#4A0D25] uppercase font-black">
                  Executive Admin Suite
                </p>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg bg-[#F7EEED] border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F7D1D8] transition-all"
              aria-label="Close sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Lock Portal Button — Situated in Top Left Corner below Logo / Text */}
          <button
            onClick={handleLockPortal}
            className="w-full py-1 px-2.5 rounded-lg bg-white hover:bg-[#F6A6BB]/50 border border-[#F7D1D8] text-[#4A0D25] font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-98"
            title="Lock Admin Portal"
          >
            <Lock className="w-3 h-3 text-[#4A0D25]" />
            <span>Lock Portal</span>
          </button>
        </div>

        {/* Navigation List — Compact Vertical Spacing */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="px-2 py-0.5 text-[8.5px] font-black tracking-widest text-[#4A0D25]/70 uppercase">
                {group.title}
              </div>
              <nav className="space-y-0.5">
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
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                            isActive
                              ? 'bg-[#4A0D25] text-white shadow-xs'
                              : 'text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/70'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                            <span>{item.label}</span>
                          </div>
                          {isSubmenuOpen ? (
                            <ChevronDown className={`w-3 h-3 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                          ) : (
                            <ChevronRight className={`w-3 h-3 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                          )}
                        </button>

                        {isSubmenuOpen && (
                          <div className="pl-5 space-y-0.5 border-l-2 border-[#F6A6BB]/40 ml-3.5 py-0.5">
                            {item.children?.map((child) => {
                              const isChildActive = pathname === child.href;
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={handleLinkClick}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                                    isChildActive
                                      ? 'bg-[#FAE6E7] text-[#4A0D25] border border-[#F6A6BB] shadow-2xs'
                                      : 'text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/60'
                                  }`}
                                >
                                  {ChildIcon && <ChildIcon className="w-3 h-3 text-[#F6A6BB]" />}
                                  <span>{child.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (item.href === '#seo-drawer') {
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          window.dispatchEvent(new Event('open_seo_drawer'));
                          if (onClose) onClose();
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/70 cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-[#D45A7A]" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-[#D45A7A] text-white">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 ${
                        isActive
                          ? 'bg-[#4A0D25] text-white shadow-xs'
                          : 'text-[#1A0510] hover:text-[#4A0D25] hover:bg-[#FAE6E7]/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F6A6BB]' : 'text-[#4A0D25]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-[#F6A6BB] text-[#4A0D25]">
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
        <div className="p-2 px-3 border-t border-[#F7D1D8] bg-[#FAE6E7]/80 flex items-center justify-between">
          <Link
            href="/"
            target="_blank"
            onClick={handleLinkClick}
            className="flex items-center gap-1.5 py-1 px-2 rounded-lg text-[11px] font-bold text-[#4A0D25] hover:text-[#1A0510] hover:bg-white transition-all"
          >
            <ExternalLink className="w-3 h-3 text-[#F6A6BB]" />
            <span>Storefront</span>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-[#F7D1D8] text-[9px] text-[#1A0510] shadow-2xs">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
            <span className="font-black">Online</span>
          </div>
        </div>
      </aside>
    </>
  );
}
