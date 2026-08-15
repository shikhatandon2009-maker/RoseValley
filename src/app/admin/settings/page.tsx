'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Settings,
  Save,
  Layout,
  Globe,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Coins,
  Plus,
  Trash2,
  Key,
  Copy,
  Clock,
  Check,
  Upload,
  UploadCloud,
  ImageIcon,
  Type
} from 'lucide-react';
import { formatImageUrl } from '@/lib/format-image';
import { useSiteSettingsStore } from '@/store/site-settings-store';

interface SiteSettings {
  store_id: string;
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  use_text_logo: boolean;
  contact_email: string;
  contact_phone: string;
  shipping_rates: {
    standard: number;
    express: number;
    free_threshold: number;
  };
  tax_rate: number;
  store_gstin?: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
}

interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  rate_to_inr: number;
}

interface PasswordResetItem {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}

export default function SiteSettingsAdminPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    store_id: 'essential_oils_perfumes_store_01',
    site_name: 'Rose Valley Kannauj',
    tagline: 'Artisanal Attars & Pure Distillates • Kannauj',
    logo_url: '/images/rvk-logo.png',
    favicon_url: '/images/rvk-logo.png',
    use_text_logo: false,
    contact_email: 'support@rosevalleykannauj.com',
    contact_phone: '+91 98765 43210',
    shipping_rates: { standard: 150, express: 300, free_threshold: 2500 },
    tax_rate: 18.00,
    store_gstin: '09AAACR1234F1Z5',
    social_links: {
      instagram: 'https://instagram.com',
      facebook: 'https://facebook.com',
    },
  });

  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [passwordResets, setPasswordResets] = useState<PasswordResetItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Currency Modal
  const [isAddCurrencyModalOpen, setIsAddCurrencyModalOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    code: '',
    name: '',
    symbol: '',
    rate_to_inr: 1.0,
  });

  // Password Reset Modal
  const [isAddResetModalOpen, setIsAddResetModalOpen] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'logo_url' | 'favicon_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const formattedUrl = formatImageUrl(data.url, '/images/rvk-logo.png');
        setSettings((prev) => ({ ...prev, [targetField]: formattedUrl }));
        useSiteSettingsStore.getState().setSettings({ [targetField]: formattedUrl });
        showToast('success', `${targetField === 'logo_url' ? 'Logo' : 'Favicon'} uploaded successfully!`);
      } else {
        showToast('error', data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error uploading file');
    } finally {
      setUploadingLogo(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const formattedSettings = {
          ...data.settings,
          logo_url: formatImageUrl(data.settings.logo_url, '/images/rvk-logo.png'),
          favicon_url: formatImageUrl(data.settings.favicon_url, '/images/rvk-logo.png'),
        };
        setSettings(formattedSettings);
        useSiteSettingsStore.getState().setSettings(formattedSettings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/admin/settings/currencies');
      const data = await res.json();
      if (res.ok) {
        setCurrencies(data.currencies || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPasswordResets = async () => {
    try {
      const res = await fetch('/api/admin/settings/password-resets');
      const data = await res.json();
      if (res.ok) {
        setPasswordResets(data.resets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchCurrencies();
    fetchPasswordResets();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const formattedSettingsPayload = {
        ...settings,
        logo_url: formatImageUrl(settings.logo_url, '/images/rvk-logo.png'),
        favicon_url: formatImageUrl(settings.favicon_url, '/images/rvk-logo.png'),
      };

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedSettingsPayload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      showToast('success', 'Site settings saved successfully! Logo & Favicon updated.');
      if (data.settings) {
        const updated = {
          ...data.settings,
          logo_url: formatImageUrl(data.settings.logo_url, '/images/rvk-logo.png'),
          favicon_url: formatImageUrl(data.settings.favicon_url, '/images/rvk-logo.png'),
        };
        setSettings(updated);
        useSiteSettingsStore.getState().setSettings(updated);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save site settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCurrencyRate = async (c: CurrencyItem, newRate: number) => {
    try {
      const res = await fetch('/api/admin/settings/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, rate_to_inr: newRate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update rate');

      showToast('success', `Exchange rate for ${c.code} updated to ${newRate}`);
      fetchCurrencies();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update rate');
    }
  };

  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCurrency),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add currency');

      showToast('success', `Currency ${newCurrency.code} added successfully!`);
      setIsAddCurrencyModalOpen(false);
      setNewCurrency({ code: '', name: '', symbol: '', rate_to_inr: 1.0 });
      fetchCurrencies();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add currency');
    }
  };

  const handleGeneratePasswordResetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmailInput.trim()) return;

    try {
      const res = await fetch('/api/admin/settings/password-resets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmailInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate reset token');

      showToast('success', `Password reset token generated for ${resetEmailInput}`);
      setIsAddResetModalOpen(false);
      setResetEmailInput('');
      fetchPasswordResets();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to generate reset token');
    }
  };

  const handleRevokePasswordReset = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/settings/password-resets?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke token');

      showToast('success', 'Password reset token revoked.');
      fetchPasswordResets();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to revoke token');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/40'
              : 'bg-rose-950 text-rose-200 border-rose-500/40'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider">
            <Settings className="w-4 h-4" /> Store Configuration
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Site Settings & Security Parameters
          </h1>
          <p className="text-stone-500 text-xs mt-1">
            Store brand identity, currencies & exchange rates, password reset tokens audit, shipping thresholds, and GST taxes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-3 rounded-2xl border border-stone-200 bg-white">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Loading site settings from Supabase...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* SECTION 1: Store Brand Identity */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg border-b border-stone-200 pb-3">
              <Globe className="w-5 h-5 text-amber-600" /> Store Brand & Identity
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Site Title / Brand Name *</label>
                <input
                  type="text"
                  required
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Contact Email Address *</label>
                <input
                  type="email"
                  required
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Logo and Favicon Section with Upload & Live Preview */}
            <div className="space-y-4 pt-2">
              {/* Logo Mode Selector */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-amber-700" />
                    <span>Logo Display Mode</span>
                  </h4>
                  <p className="text-[11px] text-amber-800 font-medium">
                    Choose whether to display an uploaded image logo or render your Site Title text directly as the logo.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, use_text_logo: false };
                      setSettings(updated);
                      useSiteSettingsStore.getState().setSettings(updated);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      !settings.use_text_logo
                        ? 'bg-amber-700 text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Image Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, use_text_logo: true };
                      setSettings(updated);
                      useSiteSettingsStore.getState().setSettings(updated);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      settings.use_text_logo
                        ? 'bg-amber-700 text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Use Brand Text</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Logo Image URL (Supports File Upload, Direct Links, & Google Drive links)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.logo_url}
                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        onBlur={(e) => {
                          const formatted = formatImageUrl(e.target.value, '/images/rvk-logo.png');
                          setSettings({ ...settings, logo_url: formatted });
                        }}
                        disabled={settings.use_text_logo}
                        placeholder="/images/rvk-logo.png or https://drive.google.com/file/d/..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-mono disabled:opacity-50"
                      />
                      <label className={`px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors flex-shrink-0 ${settings.use_text_logo ? 'opacity-50 pointer-events-none' : ''}`}>
                        <UploadCloud className="w-4 h-4" />
                        <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo_url')}
                          className="hidden"
                          disabled={uploadingLogo || settings.use_text_logo}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Favicon URL (Tab Icon)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.favicon_url}
                        onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                        onBlur={(e) => {
                          const formatted = formatImageUrl(e.target.value, '/images/rvk-logo.png');
                          setSettings({ ...settings, favicon_url: formatted });
                        }}
                        placeholder="/images/rvk-logo.png or https://drive.google.com/file/d/..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-mono"
                      />
                      <label className="px-4 py-2.5 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors flex-shrink-0">
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Favicon</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'favicon_url')}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                      </label>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium italic">
                    💡 Tip: Google Drive view links (e.g., <code className="text-amber-700 font-bold">drive.google.com/file/d/...</code>) are automatically converted to direct raw image links!
                  </p>
                </div>

                {/* Live Previews Box */}
                <div className="w-full md:w-72 p-4 rounded-xl bg-white border border-stone-200 shadow-xs text-center space-y-3 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase tracking-widest font-black text-stone-500 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" /> Active Previews
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {/* Logo Preview */}
                    <div className="p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl flex flex-col items-center justify-center space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#4A0D25]">Store Logo</span>
                      {settings.use_text_logo ? (
                        <div className="text-center px-1 py-1">
                          <span className="font-serif font-extrabold text-xs text-[#1A0510] uppercase tracking-wider block line-clamp-1">
                            {settings.site_name || 'Rose Valley'}
                          </span>
                          <span className="text-[8px] font-black text-[#4A0D25] tracking-widest block uppercase">
                            [TEXT LOGO MODE]
                          </span>
                        </div>
                      ) : settings.logo_url ? (
                        <img
                          src={formatImageUrl(settings.logo_url)}
                          alt="Logo Preview"
                          className="max-h-12 w-auto object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/rvk-logo.png';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-stone-400 font-semibold">No logo</span>
                      )}
                    </div>

                    {/* Favicon Preview */}
                    <div className="p-2.5 bg-[#F7EEED] border border-[#F7D1D8] rounded-xl flex flex-col items-center justify-center space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#4A0D25]">Tab Favicon</span>
                      {settings.favicon_url ? (
                        <img
                          src={formatImageUrl(settings.favicon_url)}
                          alt="Favicon Preview"
                          className="w-8 h-8 object-contain rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/rvk-logo.png';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-stone-400 font-semibold">No favicon</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Currencies & Multi-Currency Exchange Rates */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                <Coins className="w-5 h-5 text-amber-600" /> Multi-Currency & Exchange Rates
              </div>
              <button
                type="button"
                onClick={() => setIsAddCurrencyModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-stone-100 border border-stone-300 text-stone-800 hover:bg-stone-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" /> Add Currency
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Currency</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Rate to INR (₹)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 text-xs text-stone-800">
                  {currencies.map((c) => (
                    <tr key={c.code} className="hover:bg-stone-50">
                      <td className="py-3 px-3 font-bold text-stone-900">
                        {c.name} ({c.code})
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">{c.symbol}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          step="0.0001"
                          defaultValue={c.rate_to_inr}
                          onBlur={(e) => handleSaveCurrencyRate(c, Number(e.target.value))}
                          className="w-32 px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:outline-none focus:border-amber-600"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="text-[10px] text-stone-400">Auto-saved on blur</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Password Resets Audit */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                <Key className="w-5 h-5 text-amber-600" /> Password Reset Tokens Audit ({passwordResets.length})
              </div>
              <button
                type="button"
                onClick={() => setIsAddResetModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Generate Reset Link
              </button>
            </div>

            {passwordResets.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                No password reset tokens currently active.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-4">Recipient Email</th>
                      <th className="py-2.5 px-4">Reset Token</th>
                      <th className="py-2.5 px-4">Expires At</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-xs text-stone-800">
                    {passwordResets.map((pr) => {
                      const isExpired = new Date(pr.expires_at) < new Date();
                      return (
                        <tr key={pr.id} className="hover:bg-stone-50">
                          <td className="py-3 px-4 font-bold text-stone-900">{pr.email}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {pr.token.slice(0, 16)}...
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${window.location.origin}/reset-password?token=${pr.token}`
                                  );
                                  setCopiedTokenId(pr.id);
                                  setTimeout(() => setCopiedTokenId(null), 2000);
                                }}
                                className="p-1 text-stone-400 hover:text-stone-800"
                                title="Copy Reset Link"
                              >
                                {copiedTokenId === pr.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">
                            {new Date(pr.expires_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {pr.used ? (
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold border border-stone-200">
                                USED
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200">
                                EXPIRED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                ACTIVE TOKEN
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevokePasswordReset(pr.id)}
                              className="p-1 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                              title="Revoke Token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 4: Shipping Rates & GST Tax Configuration */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg border-b border-stone-200 pb-3">
              <Truck className="w-5 h-5 text-amber-600" /> Shipping Rates & Logistics Parameters
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Standard Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={settings.shipping_rates?.standard || 150}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping_rates: { ...settings.shipping_rates, standard: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Express Courier Fee (₹)</label>
                <input
                  type="number"
                  value={settings.shipping_rates?.express || 300}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping_rates: { ...settings.shipping_rates, express: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.shipping_rates?.free_threshold || 2500}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shipping_rates: { ...settings.shipping_rates, free_threshold: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: GST / Tax & Invoicing Configuration */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                <Settings className="w-5 h-5 text-amber-600" /> GST Tax & Invoicing Rules
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                Every Invoice is Taxable (18% Default)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Applicable GST / Tax Rate (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settings.tax_rate ?? 18.00}
                    onChange={(e) => setSettings({ ...settings, tax_rate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-600 pr-10"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-stone-500 font-bold">%</span>
                </div>
                <p className="text-[11px] text-stone-500 font-medium mt-1">
                  Standard fragrance & luxury perfume GST rate is 18%. Applied dynamically on checkout taxable subtotal.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Maison Store GSTIN Number (For Tax Invoices) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="09AAACR1234F1Z5"
                  value={settings.store_gstin || '09AAACR1234F1Z5'}
                  onChange={(e) => setSettings({ ...settings, store_gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono font-bold uppercase focus:outline-none focus:border-amber-600"
                />
                <p className="text-[11px] text-stone-500 font-medium mt-1">
                  Printed on all customer and business invoices alongside HSN Code 330300 (Perfumes & Toilet Waters).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700" /> B2B Buyer GST Credit Support
              </div>
              <p className="text-[11px] text-amber-800">
                Customers can optionally enter their GST Number during checkout. The generated invoice will automatically attach their GST credit credentials and separate CGST (9%) + SGST (9%) or IGST (18%).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      )}

      {/* ADD CURRENCY MODAL */}
      {isAddCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Coins className="w-4 h-4" />
                </div>
                <h2 className="text-base font-serif font-bold text-stone-900">Add New Currency</h2>
              </div>
              <button onClick={() => setIsAddCurrencyModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCurrency} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Currency Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="USD, EUR, AED"
                    value={newCurrency.code}
                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 uppercase focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="$, €, AED"
                    value={newCurrency.symbol}
                    onChange={(e) => setNewCurrency({ ...newCurrency, symbol: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Full Currency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="US Dollar, Euro, UAE Dirham"
                  value={newCurrency.name}
                  onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Rate to 1 INR (₹) *</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={newCurrency.rate_to_inr}
                  onChange={(e) => setNewCurrency({ ...newCurrency, rate_to_inr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddCurrencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  Save Currency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GENERATE PASSWORD RESET MODAL */}
      {isAddResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Key className="w-4 h-4" />
                </div>
                <h2 className="text-base font-serif font-bold text-stone-900">Generate Reset Token</h2>
              </div>
              <button onClick={() => setIsAddResetModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePasswordResetToken} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Customer Email *</label>
                <input
                  type="email"
                  required
                  value={resetEmailInput}
                  onChange={(e) => setResetEmailInput(e.target.value)}
                  placeholder="customer@maisonessence.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
                />
              </div>

              <p className="text-[11px] text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                Generates a secure 24-hour single-use token link for password recovery.
              </p>

              <div className="pt-4 flex justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
