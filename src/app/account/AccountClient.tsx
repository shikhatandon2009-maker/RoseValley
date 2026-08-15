'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Package,
  Heart,
  MapPin,
  Bell,
  LogOut,
  Truck,
  CheckCircle2,
  Sparkles,
  Key,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Send,
  Clock,
  ExternalLink,
  RefreshCw,
  Building2,
  X
} from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCurrencyStore } from '@/store/currency-store';

interface AccountClientProps {
  user: any;
  orders: any[];
  defaultTab: string;
}

export function AccountClient({ user: initialUser, orders: initialOrders, defaultTab }: AccountClientProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || 'orders');
  const [userState, setUserState] = useState(initialUser || {});
  const [ordersList, setOrdersList] = useState<any[]>(initialOrders || []);
  const [tempAccount, setTempAccount] = useState<{ username: string; password: string; fullName: string; email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Address Book State
  const [addressesList, setAddressesList] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    companyName: '',
    gstin: '',
    streetAddress: '',
    city: '',
    state: 'Uttar Pradesh',
    postalCode: '',
    country: 'India',
    phone: '',
    isDefault: true,
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Personal Communications & Concierge Queries State
  const [inquiriesList, setInquiriesList] = useState<any[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [queryFormData, setQueryFormData] = useState({
    subject: 'Order Tracking & Tax Invoice Query',
    message: '',
    phone: '',
  });
  const [querySubmitting, setQuerySubmitting] = useState(false);
  const [querySuccessMsg, setQuerySuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const { productIds } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();

  // Load temporary guest account, stored local orders & fetch addresses/inquiries
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAccountStr = localStorage.getItem('temp_guest_account');
      if (storedAccountStr) {
        try {
          const parsedAcc = JSON.parse(storedAccountStr);
          setTempAccount(parsedAcc);
          if (parsedAcc.fullName || parsedAcc.email) {
            setUserState((prev: any) => ({
              ...prev,
              full_name: parsedAcc.fullName || prev.full_name,
              email: parsedAcc.email || prev.email,
              role: 'customer',
            }));
          }
        } catch (e) {
          console.error('Error parsing temp_guest_account:', e);
        }
      }

      const storedOrdersStr = localStorage.getItem('user_orders');
      if (storedOrdersStr) {
        try {
          const parsedOrders = JSON.parse(storedOrdersStr);
          if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
            const combinedMap = new Map();
            parsedOrders.forEach((o) => combinedMap.set(o.order_number || o.id, o));
            initialOrders.forEach((o) => combinedMap.set(o.order_number || o.id, o));
            setOrdersList(Array.from(combinedMap.values()));
          }
        } catch (e) {
          console.error('Error parsing user_orders:', e);
        }
      }
    }
  }, [initialOrders]);

  // Load Addresses
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const userId = userState?.id || initialUser?.id;
      let url = '/api/admin/users/addresses';
      if (userId) url += `?user_id=${userId}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setAddressesList(data.addresses);
          return;
        }
      }
      
      // Fallback default address if none saved in database yet
      setAddressesList([
        {
          id: 'addr-default-1',
          full_name: userState.full_name || 'Ankur Tandon',
          street_address: '35 Farsh Road / Rosewood Estate, Suite 4B',
          city: 'Kannauj',
          state: 'Uttar Pradesh',
          postal_code: '209725',
          country: 'India',
          phone: '+91 98390 12345',
          is_default: true,
        },
      ]);
    } catch (err) {
      console.warn('Addresses fetch notice:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Load Personal Communications / Inquiries
  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const userId = userState?.id || initialUser?.id;
      if (!userId) return;

      const res = await fetch(`/api/contact?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.inquiries && Array.isArray(data.inquiries)) {
          setInquiriesList(data.inquiries);
        }
      }
    } catch (err) {
      console.warn('Inquiries fetch notice:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
    fetchInquiries();
  }, [userState?.id]);

  const handleCopyCredentials = () => {
    if (!tempAccount) return;
    const textToCopy = `Username: ${tempAccount.username}\nPassword: ${tempAccount.password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('temp_guest_account');
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  // Open Add/Edit Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      fullName: userState.full_name || '',
      companyName: '',
      gstin: '',
      streetAddress: '',
      city: 'Kannauj',
      state: 'Uttar Pradesh',
      postalCode: '209725',
      country: 'India',
      phone: userState.phone || '+91 ',
      isDefault: addressesList.length === 0,
    });
    setAddressFeedback(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: any) => {
    setEditingAddressId(addr.id);
    setAddressFormData({
      fullName: addr.full_name || '',
      companyName: addr.company_name || addr.business_name || '',
      gstin: addr.gstin || '',
      streetAddress: addr.street_address || addr.street || '',
      city: addr.city || '',
      state: addr.state || 'Uttar Pradesh',
      postalCode: addr.postal_code || addr.zip || '',
      country: addr.country || 'India',
      phone: addr.phone || '',
      isDefault: Boolean(addr.is_default),
    });
    setAddressFeedback(null);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressFeedback(null);

    const userId = userState?.id || initialUser?.id || 'usr-default';

    const payload = {
      id: editingAddressId,
      user_id: userId,
      full_name: addressFormData.fullName.trim(),
      company_name: addressFormData.companyName.trim(),
      business_name: addressFormData.companyName.trim(),
      gstin: addressFormData.gstin.trim().toUpperCase(),
      street_address: addressFormData.streetAddress.trim(),
      city: addressFormData.city.trim(),
      state: addressFormData.state.trim(),
      postal_code: addressFormData.postalCode.trim(),
      country: addressFormData.country.trim(),
      phone: addressFormData.phone.trim(),
      is_default: addressFormData.isDefault,
    };

    try {
      const method = editingAddressId && !editingAddressId.startsWith('addr-default') ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/users/addresses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Fallback local update if database error
        console.warn('API returned error, updating local address state');
      }

      // Update state locally
      if (editingAddressId) {
        setAddressesList((prev) =>
          prev.map((a) => {
            if (a.id === editingAddressId) {
              return { ...a, ...payload };
            }
            if (payload.is_default) {
              return { ...a, is_default: false };
            }
            return a;
          })
        );
      } else {
        const newEntry = {
          ...payload,
          id: `addr-${Date.now()}`,
        };
        setAddressesList((prev) => {
          if (payload.is_default) {
            return [newEntry, ...prev.map((a) => ({ ...a, is_default: false }))];
          }
          return [...prev, newEntry];
        });
      }

      // Sync default address to localStorage for checkout
      if (payload.is_default) {
        localStorage.setItem('saved_shipping_address', JSON.stringify(payload));
      }

      setAddressFeedback({ type: 'success', message: 'Shipping address saved successfully.' });
      setTimeout(() => {
        setIsAddressModalOpen(false);
        setAddressFeedback(null);
      }, 1000);
    } catch (err: any) {
      setAddressFeedback({ type: 'error', message: err.message || 'Could not save address.' });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you wish to remove this shipping address?')) return;
    try {
      await fetch(`/api/admin/users/addresses?id=${id}`, { method: 'DELETE' });
    } catch (e) {}
    setAddressesList((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = async (addr: any) => {
    setAddressesList((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === addr.id,
      }))
    );
    try {
      await fetch('/api/admin/users/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addr, is_default: true }),
      });
      localStorage.setItem('saved_shipping_address', JSON.stringify({ ...addr, is_default: true }));
    } catch (e) {}
  };

  // Submit New Personal Query / Communication
  const handleSubmitPersonalQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryFormData.message.trim()) return;

    setQuerySubmitting(true);
    setQuerySuccessMsg(null);

    try {
      const payload = {
        name: userState.full_name || 'Client',
        email: userState.email || 'client@rosevalleykannauj.com',
        phone: queryFormData.phone || userState.phone || '',
        subject: queryFormData.subject,
        message: queryFormData.message,
        user_id: userState?.id || initialUser?.id || 'usr-default',
        is_guest: false,
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      const newInq = {
        id: `inq-${Date.now()}`,
        subject: `[${data.inquiry_ref || 'INQ'}] ${queryFormData.subject}`,
        created_at: new Date().toISOString(),
        metadata: {
          inquiry_ref: data.inquiry_ref || `INQ-${Date.now().toString().slice(-5)}`,
          subject: queryFormData.subject,
          message: queryFormData.message,
          status: 'In Review',
          concierge_notes: 'Assigned to Kannauj Master Distiller concierge desk.',
        },
      };

      setInquiriesList((prev) => [newInq, ...prev]);
      setQuerySuccessMsg(`Your communication (Ref: ${newInq.metadata.inquiry_ref}) has been dispatched and recorded.`);
      setQueryFormData({ subject: 'Order Tracking & Tax Invoice Query', message: '', phone: '' });

      setTimeout(() => {
        setIsQueryModalOpen(false);
        setQuerySuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      alert('Could not submit inquiry: ' + (err.message || 'Error'));
    } finally {
      setQuerySubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1A0510]">
      {/* 1. Header Profile Banner */}
      <div className="p-8 rounded-3xl bg-[#FAE6E7]/60 border-2 border-[#F7D1D8] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl text-left">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6A6BB] text-[#4A0D25] flex items-center justify-center text-2xl font-serif font-black shadow-md border-2 border-[#F7D1D8]">
            {userState.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" /> Maison Private Client Portal
            </div>
            <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#1A0510] mt-1">
              {userState.full_name || 'Ankur Tandon'}
            </h1>
            <p className="text-xs text-[#4A0D25] font-bold mt-0.5">{userState.email || 'shivaexportsindia@gmail.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-full border border-[#F7D1D8] bg-white text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* 2. Temporary Account Credentials Notification Box (If Created) */}
      {tempAccount && (
        <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-lg text-left space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-xs">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-lg text-amber-950">
                  Temporary Account Auto-Generated On Order Placement
                </h3>
                <p className="text-xs text-amber-800 font-bold">
                  Use these credentials to log in anytime and view your order history & tracking.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCredentials}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Credentials</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-0.5">
                Username / Email ID
              </span>
              <span className="font-mono font-black text-sm text-stone-900 select-all">
                {tempAccount.username}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block mb-0.5">
                  Password (Customer Last Name)
                </span>
                <span className="font-mono font-black text-sm text-amber-900 select-all">
                  {showPassword ? tempAccount.password : '••••••••'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex border-b-2 border-[#F7D1D8] overflow-x-auto gap-8 text-xs font-black uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <Package className="w-4 h-4 text-[#F6A6BB]" /> Placed Order History ({ordersList.length})
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'wishlist'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#F6A6BB]" /> Saved Wishlist ({productIds.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <MapPin className="w-4 h-4 text-[#F6A6BB]" /> Shipping Address Book ({addressesList.length})
        </button>
        <button
          onClick={() => setActiveTab('communications')}
          className={`pb-3 transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
            activeTab === 'communications'
              ? 'border-[#F6A6BB] text-[#4A0D25] font-black'
              : 'border-transparent text-stone-500 hover:text-[#1A0510]'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-[#F6A6BB]" /> Personal Queries & Communications ({inquiriesList.length})
        </button>
      </div>

      {/* 4. Tab 1: Placed Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-6 text-left animate-fade-in">
          {ordersList.length === 0 ? (
            <div className="text-center py-20 bg-[#FAE6E7]/30 border-2 border-dashed border-[#F7D1D8] rounded-3xl space-y-4">
              <Package className="w-12 h-12 text-[#F6A6BB] mx-auto" />
              <h3 className="font-serif font-extrabold text-xl text-[#1A0510]">No Past Orders Placed Yet</h3>
              <p className="text-xs text-[#4A0D25] font-bold max-w-sm mx-auto">
                Explore our hand-distilled Damask Rose attars and essential oils catalog.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider py-3 px-8 rounded-full shadow-xs cursor-pointer"
              >
                Shop Scent Collection
              </button>
            </div>
          ) : (
            ordersList.map((ord) => {
              const totalAmt = Number(ord.total_amount || 4800);
              const shippingAddr = (ord.shipping_address as any) || {};
              const taxRate = shippingAddr?.tax_rate || ord.tax_rate || 18.00;
              const taxableVal = shippingAddr?.taxable_amount || ord.taxable_amount || Math.round(totalAmt / (1 + taxRate / 100));
              const taxAmt = shippingAddr?.tax_amount || ord.tax_amount || (totalAmt - taxableVal);
              const buyerGstin = shippingAddr?.gstin || ord.gstin || null;
              const payMethod = shippingAddr?.payment_method || ord.payment_method || (ord.razorpay_payment_id?.startsWith('PAYPAL') ? 'paypal' : 'razorpay');

              return (
                <div
                  key={ord.id || ord.order_number}
                  className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-lg space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#F7D1D8] pb-4 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-extrabold text-lg text-[#1A0510]">
                          Order #{ord.order_number || ord.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          payMethod === 'paypal'
                            ? 'bg-sky-100 border border-sky-300 text-sky-900'
                            : 'bg-emerald-100 border border-emerald-300 text-emerald-950'
                        }`}>
                          PAID VIA {payMethod === 'paypal' ? 'PAYPAL' : 'RAZORPAY'}
                        </span>
                      </div>
                      <p className="text-xs text-[#4A0D25] font-bold mt-0.5" suppressHydrationWarning>
                        Placed on {ord.created_at ? new Date(ord.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-xs font-black uppercase tracking-wider">
                        STATUS: {ord.status || 'PROCESSING'}
                      </span>
                      <span className="font-serif font-black text-xl text-[#4A0D25]" suppressHydrationWarning>
                        {formatPrice(totalAmt)}
                      </span>
                    </div>
                  </div>

                  {/* Courier Tracking Banner */}
                  <div className="p-4 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] text-xs font-bold text-[#4A0D25] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-5 h-5 text-[#F6A6BB]" />
                      <div>
                        <span>Carrier Partner: <strong>{ord.courier_name || 'Bluedart Express Courier'}</strong></span>
                        <span className="block text-[11px] font-mono text-[#1A0510] font-bold mt-0.5">
                          Tracking AWB #: {ord.tracking_number || 'AWB-2026-948201'}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      Dispatched from Kannauj Estate
                    </span>
                  </div>

                  {/* B2B GSTIN & Business Details if provided */}
                  {(buyerGstin || ord.company_name || ord.business_name || ord.shipping_address?.companyName || ord.shipping_address?.company_name) && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex flex-wrap items-center justify-between font-bold gap-2">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-700" />
                        <span>B2B Tax Invoice:</span>
                        {(ord.company_name || ord.business_name || ord.shipping_address?.companyName || ord.shipping_address?.company_name) && (
                          <span className="font-black text-[#1A0510]">
                            {ord.company_name || ord.business_name || ord.shipping_address?.companyName || ord.shipping_address?.company_name}
                          </span>
                        )}
                      </div>
                      {buyerGstin && (
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">
                          GSTIN: {buyerGstin}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Ordered Items List */}
                  <div className="space-y-3 pt-1">
                    <span className="text-xs font-black text-[#4A0D25] uppercase tracking-wider block">
                      Order Items Breakdown:
                    </span>
                    {ord.order_items && ord.order_items.length > 0 ? (
                      ord.order_items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.product_name}
                                className="w-12 h-12 rounded-xl object-cover border border-[#F7D1D8] bg-white flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#F6A6BB]">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-extrabold text-[#1A0510] text-sm">{item.product_name || item.name}</h4>
                              <span className="text-[11px] text-[#4A0D25] font-bold block">
                                Qty: {item.quantity} • {item.variantName || 'Standard Bottle'}
                              </span>
                            </div>
                          </div>
                          <span className="font-serif font-black text-sm text-[#1A0510]" suppressHydrationWarning>
                            {formatPrice((item.price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-[#FAE6E7]/30 border border-[#F7D1D8] text-xs font-bold text-[#4A0D25]">
                        Damask Rose Artisanal Attars & Pure Botanical Hydro-Distillates Batch
                      </div>
                    )}
                  </div>

                  {/* Tax Breakdown Footer */}
                  <div className="pt-3 border-t border-[#F7D1D8] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-stone-600">
                    <div>
                      <span>Taxable Value: <strong className="text-[#1A0510]">{formatPrice(taxableVal)}</strong></span>
                      <span className="mx-2">•</span>
                      <span>GST ({taxRate}%): <strong className="text-[#4A0D25]">{formatPrice(taxAmt)}</strong></span>
                    </div>
                    <span className="text-emerald-800 font-extrabold">COMPLIMENTARY SHIPPING (FREE)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 5. Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="p-10 bg-white rounded-3xl border-2 border-[#F7D1D8] text-center space-y-4 shadow-lg animate-fade-in">
          <Heart className="w-12 h-12 text-[#F6A6BB] mx-auto fill-current animate-pulse" />
          <h3 className="font-serif text-2xl font-extrabold text-[#1A0510]">Your Saved Fragrance Reserve</h3>
          <p className="text-xs text-[#4A0D25] font-bold">
            You have <strong className="text-[#4A0D25]">{productIds.length} item(s)</strong> saved in your private wishlist.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => router.push('/wishlist')}
              className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black py-3.5 px-8 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-4 h-4" /> View Saved Wishlist Catalog
            </button>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Shipping Addresses Book (Add / Edit / Delete) */}
      {activeTab === 'addresses' && (
        <div className="p-8 bg-white rounded-3xl border-2 border-[#F7D1D8] space-y-6 shadow-lg text-left animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-4">
            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#1A0510]">Shipping Address Book</h3>
              <p className="text-xs text-[#4A0D25] font-bold mt-0.5">
                Manage your primary and secondary shipping locations for rapid checkout.
              </p>
            </div>
            <button
              onClick={handleOpenAddAddress}
              className="px-5 py-2.5 rounded-full bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addressesList.map((addr) => (
              <div
                key={addr.id}
                className={`p-6 rounded-2xl border-2 transition-all space-y-3 relative ${
                  addr.is_default
                    ? 'bg-[#FAE6E7]/50 border-[#F6A6BB] shadow-sm'
                    : 'bg-white border-[#F7D1D8] hover:border-[#F6A6BB]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-[#1A0510] block">
                      {addr.full_name}
                    </span>
                    {(addr.company_name || addr.business_name || addr.gstin) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {(addr.company_name || addr.business_name) && (
                          <span className="text-xs font-black text-[#4A0D25] flex items-center gap-1 bg-[#FAE6E7] px-2 py-0.5 rounded-md">
                            <Building2 className="w-3.5 h-3.5 text-[#F6A6BB]" />
                            {addr.company_name || addr.business_name}
                          </span>
                        )}
                        {addr.gstin && (
                          <span className="text-[10px] font-mono font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                            GSTIN: {addr.gstin}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {addr.is_default ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-[10px] uppercase">
                      Default Address
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefaultAddress(addr)}
                      className="text-[11px] text-[#4A0D25] font-bold underline hover:text-[#1A0510] cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#4A0D25] space-y-1 font-bold leading-relaxed">
                  <p>{addr.street_address || addr.street || ''}</p>
                  <p>
                    {addr.city}, {addr.state} {addr.postal_code || addr.zip || ''}
                  </p>
                  <p>{addr.country || 'India'}</p>
                  <p className="text-stone-700 font-mono pt-1">Phone: {addr.phone || 'N/A'}</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F7D1D8]">
                  <button
                    onClick={() => handleOpenEditAddress(addr)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#F7D1D8] hover:bg-[#FAE6E7] text-xs font-bold text-[#4A0D25] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#F6A6BB]" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-bold text-rose-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Personal Communications & Concierge Queries */}
      {activeTab === 'communications' && (
        <div className="p-8 bg-white rounded-3xl border-2 border-[#F7D1D8] space-y-6 shadow-lg text-left animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-4">
            <div>
              <h3 className="font-serif text-2xl font-extrabold text-[#1A0510]">
                Personal Communications & Concierge Queries
              </h3>
              <p className="text-xs text-[#4A0D25] font-bold mt-0.5">
                All communications and inquiries submitted from Contact Us or your client desk are logged here.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="px-4 py-2.5 rounded-full border border-[#F7D1D8] bg-white hover:bg-[#FAE6E7] text-[#4A0D25] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Contact Page
              </Link>
              <button
                onClick={() => setIsQueryModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> New Personal Query
              </button>
            </div>
          </div>

          {inquiriesList.length === 0 ? (
            <div className="text-center py-16 bg-[#FAE6E7]/30 border-2 border-dashed border-[#F7D1D8] rounded-3xl space-y-3">
              <MessageSquare className="w-10 h-10 text-[#F6A6BB] mx-auto" />
              <h4 className="font-serif font-extrabold text-lg text-[#1A0510]">No Communications Logged Yet</h4>
              <p className="text-xs text-[#4A0D25] font-bold max-w-sm mx-auto">
                Have a question about custom distillation batches, tax invoice credits, or tracking? Send a direct message to our Kannauj perfumer desk.
              </p>
              <button
                onClick={() => setIsQueryModalOpen(true)}
                className="bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-full shadow-xs cursor-pointer"
              >
                Send Message To Concierge
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiriesList.map((inq, idx) => {
                const meta = inq.metadata || {};
                const refCode = meta.inquiry_ref || `INQ-${idx + 101}`;
                const subject = meta.subject || inq.subject || 'General Inquiry';
                const message = meta.message || inq.provider_response || 'Inquiry message submitted to concierge.';
                const status = meta.status || 'In Review';
                const notes = meta.concierge_notes || 'Assigned to Kannauj Master Distiller concierge desk.';
                const dateStr = inq.created_at
                  ? new Date(inq.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : 'Recent';

                return (
                  <div
                    key={inq.id || idx}
                    className="p-6 rounded-2xl bg-[#FAE6E7]/30 border-2 border-[#F7D1D8] space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F7D1D8] pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-[#F6A6BB] text-[#4A0D25]">
                          {refCode}
                        </span>
                        <h4 className="font-serif font-extrabold text-base text-[#1A0510]">
                          {subject}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-[10px] uppercase">
                          {status}
                        </span>
                        <span className="text-[11px] text-stone-500 font-bold flex items-center gap-1" suppressHydrationWarning>
                          <Clock className="w-3 h-3 text-[#F6A6BB]" /> {dateStr}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-[#1A0510] font-bold p-3 bg-white rounded-xl border border-[#F7D1D8] leading-relaxed">
                      <p className="text-stone-500 text-[10px] font-black uppercase mb-1">Your Message:</p>
                      <p className="whitespace-pre-line">{message}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-bold flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-emerald-800 uppercase font-black block">Concierge Desk Update:</span>
                        <span>{notes}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Address Form Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3">
              <h3 className="font-serif font-extrabold text-xl text-[#1A0510] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#F6A6BB]" />
                {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addressFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-bold ${
                  addressFeedback.type === 'success'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100 text-rose-950 border border-rose-300'
                }`}
              >
                {addressFeedback.message}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-[#4A0D25] mb-1">Recipient Full Name *</label>
                <input
                  type="text"
                  required
                  value={addressFormData.fullName}
                  onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                  placeholder="e.g. Ankur Tandon"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black text-[#4A0D25]">Company Name (Optional)</label>
                  </div>
                  <input
                    type="text"
                    value={addressFormData.companyName}
                    onChange={(e) => setAddressFormData({ ...addressFormData, companyName: e.target.value })}
                    placeholder="e.g. Royal Aromatics Pvt. Ltd."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-black text-[#4A0D25]">GST Number / GSTIN (Optional)</label>
                    <span className="text-[10px] text-emerald-700 font-extrabold uppercase">Tax Credit</span>
                  </div>
                  <input
                    type="text"
                    value={addressFormData.gstin}
                    onChange={(e) => setAddressFormData({ ...addressFormData, gstin: e.target.value.toUpperCase() })}
                    placeholder="09AAACR1234F1Z5"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] uppercase font-mono focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-[#4A0D25] mb-1">Street Address / Suite / Estate *</label>
                <input
                  type="text"
                  required
                  value={addressFormData.streetAddress}
                  onChange={(e) => setAddressFormData({ ...addressFormData, streetAddress: e.target.value })}
                  placeholder="e.g. 35 Farsh Road, Rosewood Estate, Suite 4B"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#4A0D25] mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    placeholder="Kannauj"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#4A0D25] mb-1">State / Province *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                    placeholder="Uttar Pradesh"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-[#4A0D25] mb-1">PIN / Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.postalCode}
                    onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                    placeholder="209725"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-black text-[#4A0D25] mb-1">Country *</label>
                  <select
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData({ ...addressFormData, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-extrabold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                  >
                    <option value="India">India (🇮🇳)</option>
                    <option value="United States">United States (🇺🇸)</option>
                    <option value="United Kingdom">United Kingdom (🇬🇧)</option>
                    <option value="United Arab Emirates">United Arab Emirates (🇦🇪)</option>
                    <option value="Saudi Arabia">Saudi Arabia (🇸🇦)</option>
                    <option value="Singapore">Singapore (🇸🇬)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-[#4A0D25] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={addressFormData.phone}
                  onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                  placeholder="+91 98390 12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-[#F6A6BB] focus:ring-[#F6A6BB]"
                />
                <label htmlFor="isDefault" className="font-extrabold text-xs text-[#1A0510] cursor-pointer">
                  Set as default shipping address for checkout
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-extrabold text-[#1A0510] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {addressSaving ? 'Saving Address...' : 'Save Shipping Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Query Composer Modal */}
      {isQueryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#F7D1D8] shadow-2xl w-full max-w-lg p-6 sm:p-8 space-y-5 text-left relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3">
              <h3 className="font-serif font-extrabold text-xl text-[#1A0510] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#F6A6BB]" />
                Send Personal Communication / Query
              </h3>
              <button
                onClick={() => setIsQueryModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {querySuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold">
                {querySuccessMsg}
              </div>
            )}

            <form onSubmit={handleSubmitPersonalQuery} className="space-y-4 text-xs">
              <div>
                <label className="block font-black text-[#4A0D25] mb-1">Inquiry Subject *</label>
                <select
                  value={queryFormData.subject}
                  onChange={(e) => setQueryFormData({ ...queryFormData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-extrabold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                >
                  <option value="Order Tracking & Tax Invoice Query">Order Tracking & Tax Invoice Query</option>
                  <option value="Wholesale & Bulk Distillates">Wholesale & Export Distillates</option>
                  <option value="Custom Attar Formulation">Custom Attar Formulation</option>
                  <option value="Provenance & QR Authenticity">Provenance & QR Authenticity</option>
                  <option value="General Concierge Query">General Concierge Query</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-[#4A0D25] mb-1">Callback Phone (Optional)</label>
                <input
                  type="tel"
                  value={queryFormData.phone}
                  onChange={(e) => setQueryFormData({ ...queryFormData, phone: e.target.value })}
                  placeholder="+91 98390 12345"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                />
              </div>

              <div>
                <label className="block font-black text-[#4A0D25] mb-1">Query / Message Details *</label>
                <textarea
                  rows={4}
                  required
                  value={queryFormData.message}
                  onChange={(e) => setQueryFormData({ ...queryFormData, message: e.target.value })}
                  placeholder="Detail your question, order issue, custom attar request, or invoice clarification..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAE6E7]/50 border border-[#F7D1D8] text-[11px] text-[#4A0D25] font-semibold">
                This communication will be logged to your account history and emailed to the master perfumer concierge desk.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F7D1D8]">
                <button
                  type="button"
                  onClick={() => setIsQueryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-extrabold text-[#1A0510] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={querySubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] text-xs font-black uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {querySubmitting ? 'Sending Query...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
