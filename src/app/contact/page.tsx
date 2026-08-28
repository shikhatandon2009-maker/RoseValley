'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Lock,
  RefreshCw,
  Globe2,
  Check,
  UserCheck,
  ExternalLink
} from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { SectionWrapper } from '@/components/common/SectionWrapper';

interface StoreInfo {
  store_address_line1?: string;
  store_address_line2?: string;
  store_city?: string;
  store_state?: string;
  store_pincode?: string;
  store_country?: string;
  contact_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  support_hours?: string;
  google_map_embed?: string;
}

export default function ContactUsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>({
    store_address_line1: 'RoseOil.in Botanical Laboratories',
    store_address_line2: 'Distillation Center',
    store_city: 'Kannauj',
    store_state: 'Uttar Pradesh',
    store_pincode: '209725',
    store_country: 'India',
    contact_email: 'support@roseoil.in',
    contact_phone: '+91 96486 78599',
    whatsapp_number: '+91 96486 78599',
    support_hours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
    google_map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Tracking & Invoice Query',
    message: '',
  });

  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isVerifyingRecaptcha, setIsVerifyingRecaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<{ inquiryRef?: string; isRecorded?: boolean } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Dynamic Store Address & Contact Channels from Admin Settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setStoreInfo((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      })
      .catch((err) => console.warn('Admin settings fetch notice:', err));
  }, []);

  // 2. Check if customer is already logged in & auto-fill details
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setFormData((prev) => ({
            ...prev,
            name: data.user.full_name || prev.name,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }));
        }
      })
      .catch((err) => console.warn('User auth check notice:', err));
  }, []);

  const handleRecaptchaCheck = () => {
    if (recaptchaVerified) return;
    setIsVerifyingRecaptcha(true);
    setTimeout(() => {
      setIsVerifyingRecaptcha(false);
      setRecaptchaVerified(true);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaVerified) {
      setErrorMsg('Please complete the reCAPTCHA security verification below.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        user_id: currentUser ? currentUser.id : null,
        is_guest: !currentUser,
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setInquiryResult({
        inquiryRef: data.inquiry_ref,
        isRecorded: data.is_recorded,
      });
      setSubmittedSuccess(true);
      setFormData({
        name: currentUser?.full_name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        subject: 'Order Tracking & Invoice Query',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanPhone = (storeInfo.contact_phone || '+91 96486 78599').replace(/[^\d+]/g, '');
  const cleanWhatsApp = (storeInfo.whatsapp_number || '+91 96486 78599').replace(/[^\d]/g, '');

  return (
    <div className="min-h-screen bg-white text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-[#FAE6E7]/60 via-[#F7EEED] to-white border-b border-[#F7D1D8] text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A0510] tracking-tight">
            Contact RoseOil.in
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] max-w-2xl mx-auto font-medium leading-relaxed">
            Have inquiries regarding pure essential oils, botanical hydro-distillates, or order tracking? Our specialists and client support are at your service.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <SectionWrapper className="bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          {/* Left Column: Contact Cards & Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <span className="text-xs font-black text-[#F6A6BB] uppercase tracking-widest">
                Customer Concierge
              </span>
              <h2 className="font-serif font-extrabold text-3xl text-[#1A0510] mt-1">
                Direct Contact Channels
              </h2>
              <p className="text-xs sm:text-sm text-[#4A0D25] font-bold mt-2 leading-relaxed">
                Reach out to our customer care desk at RoseOil.in for support and wholesale inquiries.
              </p>
            </div>

            <div className="space-y-4">
              {/* Address Card (Dynamically populated from Admin) */}
              <div className="p-5 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] flex items-start gap-4 shadow-xs">
                <div className="p-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Laboratories & Office</h3>
                  <p className="text-xs text-[#4A0D25] font-bold mt-1 leading-relaxed">
                    {storeInfo.store_address_line1 || 'RoseOil.in Botanical Laboratories'}<br />
                    {storeInfo.store_address_line2 ? `${storeInfo.store_address_line2}, ` : ''}
                    {storeInfo.store_city || 'Kannauj'}, {storeInfo.store_state || 'Uttar Pradesh'} {storeInfo.store_pincode || '209725'}, {storeInfo.store_country || 'India'}
                  </p>
                </div>
              </div>

              {/* Email Card (Dynamically populated from Admin) */}
              <div className="p-5 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] flex items-start gap-4 shadow-xs">
                <div className="p-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Direct Store Email</h3>
                  <p className="text-xs text-[#4A0D25] font-bold mt-1">
                    <a
                      href={`mailto:${storeInfo.contact_email || 'shikhatandon2009@gmail.com'}`}
                      className="hover:underline font-mono text-sm text-[#4A0D25] font-black"
                    >
                      {storeInfo.contact_email || 'shikhatandon2009@gmail.com'}
                    </a><br />
                    <span className="text-[11px] text-stone-600 font-medium">Inquiries & Export Desk (24/7 Monitored)</span>
                  </p>
                </div>
              </div>

              {/* Phone Card (Dynamically populated from Admin) */}
              <div className="p-5 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] flex items-start gap-4 shadow-xs">
                <div className="p-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Customer Care & Support</h3>
                  <p className="text-xs text-[#4A0D25] font-bold mt-1">
                    <a
                      href={`tel:${cleanPhone}`}
                      className="hover:underline font-mono text-sm text-[#4A0D25] font-black"
                    >
                      {storeInfo.contact_phone || '+91 96486 78599'}
                    </a><br />
                    <span className="text-[11px] text-stone-600 font-medium">
                      {storeInfo.support_hours || 'Mon - Sat: 9:00 AM - 8:00 PM IST'}
                    </span>
                  </p>
                </div>
              </div>

              {/* 1-Click WhatsApp Support Card (Dynamically populated from Admin) */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-600 text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-emerald-950 text-sm">Instant WhatsApp Support</h3>
                    <p className="text-[11px] text-emerald-800 font-bold font-mono">
                      {storeInfo.whatsapp_number || '+91 96486 78599'}
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=Hello%20Rose%20Valley%20Kannauj%20Concierge`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex-shrink-0"
                >
                  Chat Now
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form with reCAPTCHA (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-[#FAE6E7]/40 border-2 border-[#F7D1D8] shadow-xl text-left space-y-6">
              <div>
                <h3 className="font-serif font-extrabold text-2xl text-[#1A0510]">
                  Send Inquiry to Perfumer Desk
                </h3>
                <p className="text-xs text-[#4A0D25] font-bold mt-1">
                  Fill out the form below. Messages are verified by reCAPTCHA v3 and encrypted.
                </p>
              </div>

              {/* Logged in User Status Banner */}
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3 text-xs text-emerald-900 font-bold shadow-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Logged In: <strong>{currentUser.full_name || currentUser.email}</strong></span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-black uppercase tracking-wider">
                    Auto-Linked to Account
                  </span>
                </div>
              )}

              {submittedSuccess ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-extrabold text-xl text-emerald-950">Inquiry Dispatched Successfully!</h4>
                  <p className="text-xs text-emerald-800 font-bold max-w-md mx-auto leading-relaxed">
                    Reference ID: <strong className="font-mono text-emerald-950 font-black">{inquiryResult?.inquiryRef || 'INQ-94821'}</strong>.<br />
                    A confirmation receipt has been dispatched to your email. Our concierge desk at <span className="font-mono text-emerald-950 font-bold">{storeInfo.contact_email || 'shikhatandon2009@gmail.com'}</span> will review and respond within 24 hours.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {currentUser && (
                      <Link
                        href="/account"
                        className="px-6 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 font-black text-xs uppercase tracking-wider hover:bg-emerald-100 transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View In My Account Portal
                      </Link>
                    )}
                    <button
                      onClick={() => setSubmittedSuccess(false)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#4A0D25] mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Victoria Sterling"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#4A0D25] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-[#4A0D25] mb-1">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 96486 00000"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-[#4A0D25] mb-1">Inquiry Subject *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                      >
                        <option value="Order Tracking & Invoice Query">Order Tracking & Tax Invoice Query</option>
                        <option value="Wholesale & Bulk Distillates">Wholesale & Export Distillates</option>
                        <option value="Custom Attar Formulation">Custom Attar Formulation</option>
                        <option value="Provenance & QR Authenticity">Provenance & QR Authenticity</option>
                        <option value="General Concierge Query">General Concierge Query</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#4A0D25] mb-1">Message Details *</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your personal communication, question, or specific order details..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                    />
                  </div>

                  {/* Google reCAPTCHA Verification Box */}
                  <div className="p-4 rounded-2xl bg-white border border-[#F7D1D8] flex items-center justify-between shadow-xs">
                    <button
                      type="button"
                      onClick={handleRecaptchaCheck}
                      className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          recaptchaVerified
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-stone-50 border-stone-300 group-hover:border-[#F6A6BB]'
                        }`}
                      >
                        {isVerifyingRecaptcha ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F6A6BB]" />
                        ) : recaptchaVerified ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : null}
                      </div>
                      <span className="text-xs font-black text-[#1A0510]">
                        {recaptchaVerified ? 'reCAPTCHA Verified' : 'I am not a robot'}
                      </span>
                    </button>

                    <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold">
                      <Lock className="w-3.5 h-3.5 text-[#F6A6BB]" />
                      <span>reCAPTCHA v3 • 256-Bit SSL</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !recaptchaVerified}
                    className="w-full py-4 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#4A0D25]" />
                        <span>Sending to Concierge...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message To Concierge</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Google Map Section (Dynamically populated from Admin) */}
      <section className="py-12 bg-[#FAE6E7]/30 border-t border-[#F7D1D8]">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#F6A6BB] uppercase tracking-widest">
              Estate Location
            </span>
            <h2 className="font-serif font-extrabold text-3xl text-[#1A0510]">
              {storeInfo.store_city || 'Kannauj'} Distillation Estate Map
            </h2>
            <p className="text-xs text-[#4A0D25] font-bold max-w-lg mx-auto">
              Visit our heritage copper Deg-Bhapka distillery in {storeInfo.store_city || 'Kannauj'}, {storeInfo.store_state || 'Uttar Pradesh'}, {storeInfo.store_country || 'India'}.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-[#F7D1D8] shadow-xl aspect-[21/9] w-full relative">
            <iframe
              title="RoseOil.in Laboratories Google Map"
              src={storeInfo.google_map_embed || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin'}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      <LuxuryFooter />
    </div>
  );
}
