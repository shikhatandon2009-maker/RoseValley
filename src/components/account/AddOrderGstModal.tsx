'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface AddOrderGstModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onGstUpdated: (updatedOrder: any) => void;
}

export function AddOrderGstModal({ isOpen, onClose, order, onGstUpdated }: AddOrderGstModalProps) {
  const existingGst = order?.gstin || order?.shipping_address?.gstin || '';
  const existingComp = order?.company_name || order?.business_name || order?.shipping_address?.companyName || order?.shipping_address?.company_name || '';

  const [companyName, setCompanyName] = useState(existingComp);
  const [gstin, setGstin] = useState(existingGst);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstin.trim() || gstin.trim().length !== 15) {
      setFeedback({ type: 'error', message: 'Please enter a valid 15-character GSTIN (e.g. 09AAACS1234A1Z5).' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const orderId = order.id || order.order_number;
      const res = await fetch(`/api/orders/${orderId}/update-gst`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: gstin.trim().toUpperCase(),
          company_name: companyName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update GST credentials');
      }

      setFeedback({ type: 'success', message: 'GSTIN successfully attached to your order. Invoice updated!' });
      
      if (typeof window !== 'undefined') {
        const cleanGst = gstin.trim().toUpperCase();
        const cleanComp = companyName.trim();
        localStorage.setItem('saved_buyer_gst', cleanGst);
        if (cleanComp) {
          localStorage.setItem('saved_buyer_company', cleanComp);
          localStorage.setItem(`company_gstin_${cleanComp.toLowerCase()}`, cleanGst);
        }

        try {
          const savedAddr = localStorage.getItem('saved_shipping_address');
          if (savedAddr) {
            const parsed = JSON.parse(savedAddr);
            parsed.gstin = cleanGst;
            parsed.company_name = cleanComp || parsed.company_name;
            parsed.companyName = cleanComp || parsed.companyName;
            localStorage.setItem('saved_shipping_address', JSON.stringify(parsed));
          } else {
            localStorage.setItem(
              'saved_shipping_address',
              JSON.stringify({
                gstin: cleanGst,
                company_name: cleanComp,
                companyName: cleanComp,
              })
            );
          }
        } catch (e) {}
      }

      if (data.order) {
        onGstUpdated(data.order);
      }

      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Could not update GST details.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full border-2 border-[#F7D1D8] shadow-2xl p-6 sm:p-8 space-y-5 animate-fade-in text-[#1A0510]">
        <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-extrabold text-lg text-[#1A0510]">
                Add B2B Tax Credit GSTIN
              </h3>
              <span className="text-[11px] font-bold text-emerald-800 block">
                Order #{order.order_number || order.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                : 'bg-rose-100 text-rose-950 border border-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-black text-[#4A0D25] mb-1">
              Registered Business / Company Name
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Aura and Spirit Private Limited"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-bold text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-black text-[#4A0D25]">
                Buyer GST Number (GSTIN) *
              </label>
              <span className="text-[10px] text-stone-500 font-bold uppercase">15 Characters</span>
            </div>
            <input
              type="text"
              required
              maxLength={15}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 09AAACS1234A1Z5"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#F7D1D8] text-xs font-mono font-black uppercase text-[#1A0510] focus:ring-2 focus:ring-[#F6A6BB] outline-none tracking-wider"
            />
          </div>

          <div className="p-3 bg-[#FAE6E7]/50 rounded-xl border border-[#F7D1D8] text-[11px] text-[#4A0D25] font-medium">
            <span className="font-bold block mb-0.5">Input Tax Credit (ITC) Notice:</span>
            Your GSTIN will be stamped onto this order's official Tax Invoice (HSN 330300) before dispatch for filing your GST-2B tax returns.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F7D1D8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 hover:text-[#1A0510] text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#4A0D25] hover:bg-[#6B0F34] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F6A6BB]" />
              {saving ? 'Updating...' : 'Save GST Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
