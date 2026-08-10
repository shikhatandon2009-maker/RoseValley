'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useCurrencyStore } from '@/store/currency-store';
import { ShieldCheck, Lock, Tag, ArrowRight, CreditCard, ShoppingBag, CheckCircle2, XCircle, Trash2, RefreshCw, Globe, MapPin, AlertTriangle, Check, RotateCcw, X } from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';

interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
  stateLabel: string;
  postalLabel: string;
  postalPlaceholder: string;
  matchedCurrency: string;
  states?: string[];
}

const EUROPE_COUNTRY_CODES = [
  'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'AT', 'GR', 'PT', 'IE', 
  'LU', 'MC', 'FI', 'SE', 'NO', 'DK', 'HU', 'CZ', 'PL', 'RO', 'IS', 'UA'
];

const resolveCountryCurrency = (code: string): string => {
  if (code === 'IN') return 'INR';
  if (code === 'GB') return 'GBP';
  if (code === 'AE') return 'AED';
  if (EUROPE_COUNTRY_CODES.includes(code)) return 'EUR';
  return 'USD';
};

const COUNTRIES: CountryConfig[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    phoneCode: '+91',
    stateLabel: 'State / Union Territory',
    postalLabel: 'PIN Code',
    postalPlaceholder: '209725',
    matchedCurrency: 'INR',
    states: [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir',
      'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
      'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ]
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    phoneCode: '+1',
    stateLabel: 'State',
    postalLabel: 'ZIP Code',
    postalPlaceholder: '90210',
    matchedCurrency: 'USD',
    states: [
      'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
      'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
      'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
      'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
      'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
      'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
      'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
      'Wisconsin', 'Wyoming'
    ]
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    phoneCode: '+44',
    stateLabel: 'County / Region',
    postalLabel: 'Postcode',
    postalPlaceholder: 'SW1A 1AA',
    matchedCurrency: 'GBP',
    states: ['Greater London', 'Greater Manchester', 'West Midlands', 'West Yorkshire', 'Surrey', 'Essex', 'Kent', 'Hampshire', 'Scotland', 'Wales', 'Northern Ireland']
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    phoneCode: '+971',
    stateLabel: 'Emirate',
    postalLabel: 'P.O. Box / Postal Code',
    postalPlaceholder: '00000',
    matchedCurrency: 'AED',
    states: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    phoneCode: '+33',
    stateLabel: 'Region / Department',
    postalLabel: 'Postal Code',
    postalPlaceholder: '75001',
    matchedCurrency: 'EUR',
    states: ['Île-de-France (Paris)', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Nouvelle-Aquitaine', 'Occitanie']
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    phoneCode: '+49',
    stateLabel: 'Federal State (Bundesland)',
    postalLabel: 'Postleitzahl (PLZ)',
    postalPlaceholder: '10115',
    matchedCurrency: 'EUR',
    states: ['Bavaria', 'Berlin', 'Baden-Württemberg', 'North Rhine-Westphalia', 'Hesse', 'Hamburg', 'Saxony']
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    phoneCode: '+1',
    stateLabel: 'Province / Territory',
    postalLabel: 'Postal Code',
    postalPlaceholder: 'M5V 2T6',
    matchedCurrency: 'USD',
    states: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Ontario', 'Quebec', 'Saskatchewan']
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    phoneCode: '+61',
    stateLabel: 'State / Territory',
    postalLabel: 'Postcode',
    postalPlaceholder: '2000',
    matchedCurrency: 'USD',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Australian Capital Territory']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    phoneCode: '+966',
    stateLabel: 'Province / Region',
    postalLabel: 'Postal Code',
    postalPlaceholder: '12211',
    matchedCurrency: 'USD',
    states: ['Riyadh', 'Makkah', 'Madinah', 'Eastern Province', 'Asir']
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    phoneCode: '+65',
    stateLabel: 'Region',
    postalLabel: 'Postal Code',
    postalPlaceholder: '238882',
    matchedCurrency: 'USD',
    states: ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region']
  },
];

const VALID_COUPONS: Record<string, { percent: number; name: string }> = {
  ROYAL15: { percent: 15, name: 'Royal Heritage 15% Off' },
  LUXURY15: { percent: 15, name: 'Luxury Connoisseur 15% Off' },
  ROSE10: { percent: 10, name: 'Damask Rose 10% Off' },
  WELCOME10: { percent: 10, name: 'Welcome Member 10% Off' },
  HERITAGE20: { percent: 20, name: '400-Yr Heritage Reserve 20% Off' },
  KANNAUJ15: { percent: 15, name: 'Kannauj Artisanal 15% Off' },
  GULAB10: { percent: 10, name: 'Ruh Gulab 10% Off' },
};

const AVAILABLE_COUPONS = [
  {
    code: 'ROYAL15',
    flag: '👑',
    name: 'Royal Heritage 15% OFF',
    desc: '15% OFF on pure Kannauj attars & luxury perfumes',
    percent: 15,
  },
  {
    code: 'ROSE10',
    flag: '🌹',
    name: 'Damask Rose 10% OFF',
    desc: '10% OFF on pre-dawn Rosa Damascena distillates',
    percent: 10,
  },
  {
    code: 'HERITAGE20',
    flag: '🏺',
    name: '400-Yr Heritage Reserve 20% OFF',
    desc: '20% OFF on artisanal attar collections',
    percent: 20,
  },
  {
    code: 'WELCOME10',
    flag: '✨',
    name: 'Welcome Member 10% OFF',
    desc: '10% instant discount for new private clients',
    percent: 10,
  },
];

export default function CheckoutPage() {
  const { items, getTotalINR, clearCart } = useCartStore();
  const { formatPrice, setCurrency } = useCurrencyStore();
  const router = useRouter();

  // Country Selection
  const [countriesList, setCountriesList] = useState<CountryConfig[]>(COUNTRIES);
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const currentCountry = countriesList.find((c) => c.code === selectedCountryCode) || countriesList[0];

  useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch('/api/countries');
        if (res.ok) {
          const data = await res.json();
          if (data.countries && data.countries.length > 0) {
            setCountriesList(data.countries);
          }
        }
      } catch (err) {
        console.warn('Using local fallback countries config');
      }
    }
    loadCountries();
  }, []);

  // Address Inputs
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [streetAddress1, setStreetAddress1] = useState('');
  const [streetAddress2, setStreetAddress2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number; name: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [loading, setLoading] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Interactive Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [processingSuccess, setProcessingSuccess] = useState(false);

  const subtotalINR = getTotalINR();
  const discountPercent = appliedCoupon ? appliedCoupon.percent : 0;
  const discountAmount = (subtotalINR * discountPercent) / 100;
  const finalTotalINR = Math.max(0, subtotalINR - discountAmount);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = countriesList.find((c) => c.code === countryCode);
    if (country) {
      if (country.states && country.states.length > 0) {
        setState(country.states[0]);
      } else {
        setState('');
      }

      const targetCurrency = resolveCountryCurrency(countryCode);
      setCurrency(targetCurrency);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setValidatingCoupon(true);

    try {
      if (VALID_COUPONS[cleanCode]) {
        const coupon = VALID_COUPONS[cleanCode];
        setAppliedCoupon({ code: cleanCode, ...coupon });
        setCouponSuccess(`Coupon "${cleanCode}" applied! ${coupon.percent}% discount activated.`);
        setCouponInput('');
      } else {
        if (cleanCode.length >= 3) {
          setAppliedCoupon({
            code: cleanCode,
            percent: 15,
            name: `${cleanCode} Special Discount`,
          });
          setCouponSuccess(`Coupon "${cleanCode}" applied! 15% discount activated.`);
          setCouponInput('');
        } else {
          setCouponError(`Invalid code "${cleanCode}". Try: ROYAL15, ROSE10, or HERITAGE20`);
        }
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('Coupon removed.');
    setTimeout(() => setCouponSuccess(''), 3000);
  };

  // Open Payment Simulation & Order Summary Modal when clicking Pay
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setPaymentFailed(false);

    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotalINR,
          currency: 'INR',
        }),
      });

      const orderData = await res.json();

      const shippingAddress = {
        fullName,
        email,
        country: currentCountry.name,
        countryCode: currentCountry.code,
        streetAddress1,
        streetAddress2,
        landmark,
        city,
        state,
        postalCode,
        phone: `${currentCountry.phoneCode} ${phone}`,
      };

      setModalData({
        orderNumber: orderData.orderNumber || `ROSE-2026-X${Math.floor(100 + Math.random() * 900)}`,
        razorpayOrderId: orderData.razorpayOrderId || `rzp_mock_${Date.now()}`,
        shippingAddress,
      });

      setShowPaymentModal(true);
    } catch (err: any) {
      // Fallback modal setup
      setModalData({
        orderNumber: `ROSE-2026-X${Math.floor(100 + Math.random() * 900)}`,
        razorpayOrderId: `rzp_mock_${Date.now()}`,
        shippingAddress: {
          fullName,
          email,
          country: currentCountry.name,
          countryCode: currentCountry.code,
          streetAddress1,
          streetAddress2,
          landmark,
          city,
          state,
          postalCode,
          phone: `${currentCountry.phoneCode} ${phone}`,
        },
      });
      setShowPaymentModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Action: User Clicks "Simulate Success"
  const handleSimulateSuccess = async () => {
    if (!modalData) return;
    setProcessingSuccess(true);

    try {
      // Create temporary guest account credentials & order history in localStorage
      if (typeof window !== 'undefined') {
        const custFullName = modalData.shippingAddress.fullName || fullName || 'Victoria Sterling';
        const custEmail = modalData.shippingAddress.email || email || 'victoria@example.com';
        const nameParts = custFullName.trim().split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

        const tempAccount = {
          username: custEmail,
          password: lastName,
          fullName: custFullName,
          email: custEmail,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('temp_guest_account', JSON.stringify(tempAccount));

        const newOrderRecord = {
          id: modalData.orderNumber,
          order_number: modalData.orderNumber,
          created_at: new Date().toISOString(),
          status: 'processing',
          total_amount: finalTotalINR,
          tracking_number: `AWB-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          courier_name: 'Bluedart Express Courier',
          order_items: items.map((it) => ({
            id: it.id,
            product_name: it.name,
            variantName: it.variantName || 'Standard Size',
            quantity: it.quantity,
            price: it.price,
            image: it.image,
          })),
        };

        const existingOrdersStr = localStorage.getItem('user_orders');
        const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
        localStorage.setItem('user_orders', JSON.stringify([newOrderRecord, ...existingOrders]));
      }

      const verifyRes = await fetch('/api/razorpay/verify-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: modalData.razorpayOrderId,
          razorpayPaymentId: `pay_simulated_${Date.now()}`,
          razorpaySignature: 'mock_valid_signature',
          orderNumber: modalData.orderNumber,
          items,
          shippingAddress: modalData.shippingAddress,
          guestEmail: email,
          totalAmount: finalTotalINR,
          currency: 'INR',
          isMock: true,
        }),
      });

      const verifyData = await verifyRes.json();
      setShowPaymentModal(false);
      clearCart();
      router.push(`/order-success/${verifyData.orderId || modalData.orderNumber}`);
    } catch (err: any) {
      setShowPaymentModal(false);
      clearCart();
      router.push(`/order-success/${modalData.orderNumber}`);
    } finally {
      setProcessingSuccess(false);
    }
  };

  // Action: User Clicks "Simulate Failure"
  const handleSimulateFailure = () => {
    setShowPaymentModal(false);
    setPaymentFailed(true);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] flex flex-col justify-between">
        <LuxuryHeader />
        <main className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-[#F6A6BB] mx-auto" />
          <h2 className="font-serif text-3xl font-bold text-[#1A0510]">Your Reserve Bag is Empty</h2>
          <p className="text-xs text-[#4A0D25]">Please select items from our Kannauj Damask Rose collection before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-[#F6A6BB] text-[#4A0D25] text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-full shadow-sm hover:bg-[#F4BBC9] transition-all"
          >
            Explore Fragrances & Oils
          </button>
        </main>
        <LuxuryFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7EEED] text-[#1A0510] font-sans flex flex-col justify-between selection:bg-[#F6A6BB] selection:text-[#4A0D25] relative">
      <LuxuryHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#4A0D25] font-bold flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] w-fit mx-auto shadow-xs">
            <Lock className="w-3.5 h-3.5 text-[#F6A6BB]" /> 256-Bit Encrypted Secure Checkout
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1A0510]">Complete Your Order</h1>
        </div>

        {/* Failure & Retry Alert Banner */}
        {paymentFailed && (
          <div className="max-w-4xl mx-auto mb-8 p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3 shadow-md animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-200 text-rose-900">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-rose-900">Payment Transaction Failed</h4>
                  <p className="text-xs font-semibold text-rose-800">
                    Payment was declined or cancelled. All items in your reserve bag have been preserved.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentFailed(false)}
                className="p-1 rounded-lg text-rose-700 hover:bg-rose-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-rose-200">
              <button
                type="button"
                onClick={handleInitiatePayment}
                className="px-5 py-2.5 rounded-xl bg-[#F6A6BB] text-[#4A0D25] text-xs font-extrabold uppercase tracking-wider hover:bg-[#F4BBC9] transition-all flex items-center gap-2 shadow-xs"
              >
                <RotateCcw className="w-4 h-4" /> Retry Payment
              </button>
              <span className="text-xs text-rose-700 font-medium">Cart reloaded with {items.length} items. Ready for immediate retry.</span>
            </div>
          </div>
        )}

        <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Shipping & Client Details */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-3">
                <h3 className="font-serif font-bold text-[#1A0510] text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#F6A6BB]" /> Client & Shipping Address
                </h3>
                <span className="text-xs text-[#4A0D25] font-extrabold flex items-center gap-1">
                  {currentCountry.flag} {currentCountry.name}
                </span>
              </div>
              
              {/* Country Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4A0D25] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#F6A6BB]" /> Country / Region *
                </label>
                <select
                  value={selectedCountryCode}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-white border border-[#F7D1D8] rounded-xl py-3 px-3.5 text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs cursor-pointer"
                >
                  {countriesList.map((c) => {
                    const displayCurrency = resolveCountryCurrency(c.code);
                    return (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({displayCurrency})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Victoria Sterling"
                    className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="victoria@example.com"
                    className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>
              </div>

              {/* Street Address Line 1 */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4A0D25]">Street Address (Line 1) *</label>
                <input
                  type="text"
                  required
                  value={streetAddress1}
                  onChange={(e) => setStreetAddress1(e.target.value)}
                  placeholder="35 Farsh Road / 42 Rosewood Boulevard"
                  className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                />
              </div>

              {/* Street Address Line 2 & Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25]">Apartment, Suite, Unit (Line 2)</label>
                  <input
                    type="text"
                    value={streetAddress2}
                    onChange={(e) => setStreetAddress2(e.target.value)}
                    placeholder="Apt 4B / Floor 2 (Optional)"
                    className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25]">Landmark / Nearby Spot</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near Grand Clock Tower (Optional)"
                    className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>
              </div>

              {/* City, State & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25]">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Kannauj / Mumbai / London"
                    className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25] truncate block">
                    {currentCountry.stateLabel} *
                  </label>
                  {currentCountry.states && currentCountry.states.length > 0 ? (
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs cursor-pointer"
                    >
                      {currentCountry.states.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State / Region"
                      className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#4A0D25] truncate block">
                    {currentCountry.postalLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={currentCountry.postalPlaceholder}
                    className="w-full bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#4A0D25]">Phone Number (For Delivery Updates) *</label>
                <div className="flex gap-2">
                  <div className="px-3.5 py-2.5 rounded-xl bg-stone-100 border border-[#F7D1D8] text-xs font-extrabold text-[#4A0D25] flex items-center gap-1">
                    <span>{currentCountry.flag}</span>
                    <span>{currentCountry.phoneCode}</span>
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 bg-white border border-[#F7D1D8] rounded-xl py-2.5 px-3.5 text-xs text-[#1A0510] font-semibold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB] shadow-xs"
                  />
                </div>
              </div>

            </div>

            <div className="p-6 rounded-3xl bg-[#FAE6E7]/80 border border-[#F7D1D8] space-y-2 shadow-sm">
              <h3 className="font-serif font-bold text-[#1A0510] text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#F6A6BB]" /> Razorpay Encrypted Gateway
              </h3>
              <p className="text-xs text-[#4A0D25] font-semibold">
                Supports UPI, Credit/Debit Cards, Netbanking, & International Wallets with instant server verification.
              </p>
            </div>

          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-[#F7D1D8] space-y-6 sticky top-28 shadow-md">
              <h3 className="font-serif font-bold text-[#1A0510] text-xl border-b border-[#F7D1D8] pb-3">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#1A0510]">{item.name}</p>
                      <span className="text-[10px] text-[#4A0D25] font-semibold">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-[#1A0510]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-4 border-t border-[#F7D1D8] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#4A0D25] flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#F6A6BB]" /> Available Eligible Coupons & Offers
                  </label>
                  <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider">
                    {AVAILABLE_COUPONS.length} Coupons Available
                  </span>
                </div>

                {/* Available Coupon Chips List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_COUPONS.map((coupon) => {
                    const isSelected = appliedCoupon?.code === coupon.code;
                    return (
                      <div
                        key={coupon.code}
                        onClick={() => {
                          if (isSelected) {
                            handleRemoveCoupon();
                          } else {
                            setAppliedCoupon({ code: coupon.code, percent: coupon.percent, name: coupon.name });
                            setCouponSuccess(`Coupon "${coupon.code}" applied! ${coupon.percent}% discount activated.`);
                            setCouponError('');
                          }
                        }}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-md'
                            : 'bg-[#FAE6E7]/50 border-[#F7D1D8] hover:border-[#F6A6BB] hover:bg-[#FAE6E7]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl flex-shrink-0">{coupon.flag}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-xs text-[#1A0510]">
                                {coupon.code}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#F6A6BB] text-[#4A0D25]'
                                }`}
                              >
                                {coupon.percent}% OFF
                              </span>
                            </div>
                            <p className="text-[10px] text-[#4A0D25] font-bold mt-0.5 line-clamp-1">
                              {coupon.desc}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all flex-shrink-0 ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white border border-[#F7D1D8] text-[#4A0D25] hover:bg-[#F6A6BB] hover:text-[#4A0D25]'
                          }`}
                        >
                          {isSelected ? 'Applied ✓' : 'Apply'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Coupon Code Input Box */}
                <div className="pt-2">
                  <label className="text-[11px] font-extrabold text-[#4A0D25] block mb-1">
                    Have Your Own Custom Promo / Gift Code?
                  </label>

                  {appliedCoupon ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-700" />
                        <div>
                          <div className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                            {appliedCoupon.code} <span className="text-[10px] text-emerald-800 font-extrabold uppercase">({appliedCoupon.percent}% OFF APPLIED)</span>
                          </div>
                          <span className="text-[10px] text-emerald-800 font-bold">{appliedCoupon.name}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="px-3 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black hover:bg-rose-100 hover:text-rose-900 transition-colors flex items-center gap-1"
                        title="Remove Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          if (couponError) setCouponError('');
                        }}
                        placeholder="Enter Code (e.g. ROYAL15)"
                        className="flex-1 bg-white border border-[#F7D1D8] rounded-xl px-3.5 py-2.5 text-xs text-[#1A0510] uppercase font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon}
                        className="bg-[#F6A6BB] text-[#4A0D25] px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-[#F4BBC9] transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {validatingCoupon ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 pt-1.5">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 pt-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2.5 pt-3 border-t border-[#F7D1D8] text-xs font-semibold">
                <div className="flex justify-between text-[#1A0510]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotalINR)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-800 font-extrabold">
                    <span>Discount ({appliedCoupon.percent}% OFF)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#1A0510]">
                  <span>Complimentary Shipping</span>
                  <span className="text-emerald-800 font-extrabold">FREE</span>
                </div>

                <div className="flex justify-between text-lg font-bold text-[#1A0510] pt-3 border-t border-[#F7D1D8]">
                  <span>Total Payable</span>
                  <span className="text-[#4A0D25] font-serif font-extrabold">{formatPrice(finalTotalINR)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] py-4 rounded-full font-extrabold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? 'Preparing Payment...' : `Pay ${formatPrice(finalTotalINR)} via Razorpay`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </form>
      </main>

      {/* INTERACTIVE PAYMENT GATEWAY & ORDER SUMMARY SIMULATION MODAL */}
      {showPaymentModal && modalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#F7D1D8] max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#FAE6E7] text-[#4A0D25]">
                  <CreditCard className="w-6 h-6 text-[#F6A6BB]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#1A0510]">Razorpay Encrypted Payment</h3>
                  <p className="text-xs text-[#4A0D25] font-extrabold">Order Ref: {modalData.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client & Delivery Summary */}
            <div className="p-4 rounded-2xl bg-[#FAE6E7]/50 border border-[#F7D1D8] space-y-1.5 text-xs">
              <div className="font-bold text-[#4A0D25] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F6A6BB]" /> Shipping To:
              </div>
              <p className="font-bold text-[#1A0510]">{modalData.shippingAddress.fullName} ({modalData.shippingAddress.email})</p>
              <p className="text-stone-600 font-medium">
                {modalData.shippingAddress.streetAddress1}, {modalData.shippingAddress.city}, {modalData.shippingAddress.state} {modalData.shippingAddress.postalCode}, {modalData.shippingAddress.country}
              </p>
            </div>

            {/* Order Items Preview */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1A0510]">Order Items ({items.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-white flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[#1A0510] line-clamp-1">{item.name}</p>
                        <span className="text-[10px] text-[#4A0D25] font-extrabold">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[#1A0510]">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payable Amount */}
            <div className="p-4 rounded-2xl bg-[#F7EEED] flex items-center justify-between text-sm font-bold border border-[#F7D1D8]">
              <span>Total Amount Payable:</span>
              <span className="text-xl font-serif text-[#4A0D25] font-extrabold">{formatPrice(finalTotalINR)}</span>
            </div>

            {/* Simulation Options Notice */}
            <div className="text-center space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#4A0D25] bg-[#FAE6E7] px-3 py-1 rounded-full border border-[#F7D1D8]">
                Interactive Payment Simulation
              </span>
              <p className="text-xs text-stone-500 font-semibold pt-1">
                Select your payment outcome below to verify cart & success workflow:
              </p>
            </div>

            {/* Interactive Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={processingSuccess}
                onClick={handleSimulateSuccess}
                className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {processingSuccess ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Simulate Success</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateFailure}
                className="py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <X className="w-4 h-4" />
                <span>Simulate Failure</span>
              </button>
            </div>

          </div>
        </div>
      )}

      <LuxuryFooter />
    </div>
  );
}
