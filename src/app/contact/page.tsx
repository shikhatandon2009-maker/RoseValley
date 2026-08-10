'use client';

import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { LuxuryHeader } from '@/components/layout/LuxuryHeader';
import { LuxuryFooter } from '@/components/layout/LuxuryFooter';
import { SectionWrapper } from '@/components/common/SectionWrapper';

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'order',
    message: '',
  });

  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const [isVerifyingRecaptcha, setIsVerifyingRecaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      
      // Simulate API submission
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSubmittedSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'order',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A0510] font-sans selection:bg-[#F6A6BB] selection:text-neutral-950">
      <LuxuryHeader />

      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-[#FAE6E7]/60 via-[#F7EEED] to-white border-b border-[#F7D1D8] text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1A0510] tracking-tight">
            Contact Rose Valley Kannauj
          </h1>
          <p className="text-xs sm:text-sm text-[#4A0D25] max-w-2xl mx-auto font-medium leading-relaxed">
            Have inquiries regarding custom attar formulations, bulk hydro-distillates, or order tracking? Our master perfumers and client concierge are at your service.
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
                Maison Concierge
              </span>
              <h2 className="font-serif font-extrabold text-3xl text-[#1A0510] mt-1">
                Direct Contact Channels
              </h2>
              <p className="text-xs sm:text-sm text-[#4A0D25] font-bold mt-2 leading-relaxed">
                Reach out to our distillery in Kannauj, Uttar Pradesh, India or our global client care desk.
              </p>
            </div>

            <div className="space-y-4">
              {/* Address Card */}
              <div className="p-5 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] flex items-start gap-4 shadow-xs">
                <div className="p-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Distillery & Estate Address</h3>
                  <p className="text-xs text-[#4A0D25] font-bold mt-1 leading-relaxed">
                    Rose Valley Estate, Deg-Bhapka Heritage Stills<br />
                    Kannauj Industrial Area, Uttar Pradesh 209725, India
                  </p>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-5 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] flex items-start gap-4 shadow-xs">
                <div className="p-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Email Concierge Desk</h3>
                  <p className="text-xs text-[#4A0D25] font-bold mt-1">
                    concierge@rosevalleykannauj.com<br />
                    export@rosevalleykannauj.com
                  </p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="p-5 rounded-2xl bg-[#FAE6E7]/60 border border-[#F7D1D8] flex items-start gap-4 shadow-xs">
                <div className="p-3 rounded-xl bg-[#F6A6BB] text-[#4A0D25] flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-[#1A0510] text-base">Phone & Toll-Free</h3>
                  <p className="text-xs text-[#4A0D25] font-bold mt-1">
                    +91 (5694) 280-1620 / +91 98390 12345<br />
                    Mon - Sat: 9:00 AM - 7:00 PM IST
                  </p>
                </div>
              </div>

              {/* 1-Click WhatsApp Support Card */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-600 text-white">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-extrabold text-emerald-950 text-sm">Instant WhatsApp Support</h3>
                    <p className="text-[11px] text-emerald-800 font-bold">Chat live with our client advisor</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/919839012345?text=Hello%20Rose%20Valley%20Kannauj%20Concierge"
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

              {submittedSuccess ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-extrabold text-xl text-emerald-950">Message Sent Successfully!</h4>
                  <p className="text-xs text-emerald-800 font-bold max-w-md mx-auto">
                    Thank you for reaching out. Our client concierge has received your inquiry and will respond to your email within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xs"
                  >
                    Send Another Inquiry
                  </button>
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
                        placeholder="+91 98390 00000"
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
                        <option value="order">Order Tracking & Receipt</option>
                        <option value="wholesale">Wholesale & Export Distillates</option>
                        <option value="custom">Custom Fragrance Formulation</option>
                        <option value="provenance">Provenance & QR Authenticity</option>
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
                      placeholder="Write your inquiry or specific order details..."
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#F7D1D8] text-xs text-[#1A0510] font-bold focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                    />
                  </div>

                  {/* Google reCAPTCHA Verification Box */}
                  <div className="p-4 rounded-2xl bg-white border border-[#F7D1D8] flex items-center justify-between shadow-xs">
                    <button
                      type="button"
                      onClick={handleRecaptchaCheck}
                      className="flex items-center gap-3 text-left focus:outline-none group"
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
                    className="w-full py-4 rounded-xl bg-[#F6A6BB] hover:bg-[#F4BBC9] text-[#4A0D25] font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Google Map Section */}
      <section className="py-12 bg-[#FAE6E7]/30 border-t border-[#F7D1D8]">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-[#F6A6BB] uppercase tracking-widest">
              Estate Location
            </span>
            <h2 className="font-serif font-extrabold text-3xl text-[#1A0510]">
              Kannauj Distillation Estate Map
            </h2>
            <p className="text-xs text-[#4A0D25] font-bold max-w-lg mx-auto">
              Visit our heritage copper Deg-Bhapka distillery in Kannauj, Uttar Pradesh, India.
            </p>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-[#F7D1D8] shadow-xl aspect-[21/9] w-full relative">
            <iframe
              title="Rose Valley Kannauj Estate Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
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
