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
  Type,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Building,
  Download,
  Database,
  ShieldAlert,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { formatImageUrl } from '@/lib/format-image';
import { useSiteSettingsStore } from '@/store/site-settings-store';
import { DEFAULT_INDIA_WEIGHT_SLABS, WeightSlab } from '@/lib/shipping-calculator';

interface SiteSettings {
  store_id: string;
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  use_text_logo: boolean;
  contact_email: string;
  contact_phone: string;
  store_address_line1?: string;
  store_address_line2?: string;
  store_city?: string;
  store_state?: string;
  store_pincode?: string;
  store_country?: string;
  whatsapp_number?: string;
  support_hours?: string;
  google_map_embed?: string;
  shipping_rates: {
    standard: number;
    express: number;
    free_threshold: number;
    calculation_mode?: 'weight_based' | 'item_based' | 'flat' | 'hybrid';
    weight_rate_per_kg?: number;
    express_rate_per_kg?: number;
    packaging_overhead_percent?: number;
    min_shipping_fee?: number;
    india_weight_slabs?: WeightSlab[];
    india_over_200kg_rate_per_kg?: number;
    export_under_200kg_rate_usd?: number;
    export_min_charge_usd?: number;
    export_region_over_200kg_rates?: Record<string, number>;
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
    site_name: 'RoseOil.in',
    tagline: 'Pure Essential Oils & Artisanal Botanical Distillates',
    logo_url: '/images/logo/logo.png',
    favicon_url: '/images/logo/favicon.png',
    use_text_logo: false,
    contact_email: 'support@roseoil.in',
    contact_phone: '+91 96486 78599',
    whatsapp_number: '+91 96486 78599',
    store_address_line1: 'RoseOil.in Botanical Laboratories',
    store_address_line2: 'Distillation Center',
    store_city: 'Kannauj',
    store_state: 'Uttar Pradesh',
    store_pincode: '209725',
    store_country: 'India',
    support_hours: 'Mon - Sat: 9:00 AM - 8:00 PM IST',
    google_map_embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57053.86427339191!2d79.88939768652973!3d27.051939886745195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399e2e604f56fdd1%3A0x8979b9bc88a55639!2sKannauj%2C%20Uttar%20Pradesh%20209725!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
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
  
  // Backup & Purge state
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [backupFilePayload, setBackupFilePayload] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeStep, setPurgeStep] = useState<1 | 2>(1);
  const [purgeInputText, setPurgeInputText] = useState('');
  const [isPurging, setIsPurging] = useState(false);

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
        const formattedUrl = formatImageUrl(data.url, '/images/logo/logo.png');
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
          logo_url: formatImageUrl(data.settings.logo_url, '/images/logo/logo.png'),
          favicon_url: formatImageUrl(data.settings.favicon_url, '/images/logo/favicon.png'),
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

  const handleDownloadBackup = async () => {
    try {
      setIsDownloadingBackup(true);
      const res = await fetch('/api/admin/settings/backup');
      if (!res.ok) {
        throw new Error('Failed to generate backup file');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rose_valley_full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('success', 'Full system backup downloaded successfully!');
    } catch (e: any) {
      showToast('error', e.message || 'Error downloading backup');
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleSelectBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) {
          showToast('error', 'Invalid JSON file format.');
          return;
        }
        setBackupFilePayload(parsed);
        setIsRestoreModalOpen(true);
      } catch (err) {
        showToast('error', 'Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteRestore = async () => {
    if (!backupFilePayload) return;
    try {
      setIsRestoring(true);
      const res = await fetch('/api/admin/settings/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupFilePayload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const r = data.restored_entities || {};
        showToast(
          'success',
          `Restored: ${r.products || 0} products, ${r.variants || 0} variants, ${r.categories || 0} categories!`
        );
        setIsRestoreModalOpen(false);
        setBackupFilePayload(null);
        setTimeout(() => {
          fetchSettings();
          window.location.reload();
        }, 1500);
      } else {
        showToast('error', data.error || 'Failed to restore backup');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error restoring backup');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExecutePurge = async () => {
    if (purgeInputText.trim() !== 'PURGE') {
      showToast('error', 'Please type PURGE in all uppercase letters to confirm.');
      return;
    }
    try {
      setIsPurging(true);
      const res = await fetch('/api/admin/settings/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'PURGE' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('success', data.message || 'All store data purged successfully.');
        setIsPurgeModalOpen(false);
        setPurgeStep(1);
        setPurgeInputText('');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast('error', data.error || 'Failed to purge data');
      }
    } catch (e: any) {
      showToast('error', e.message || 'Error executing purge');
    } finally {
      setIsPurging(false);
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
        logo_url: formatImageUrl(settings.logo_url, '/images/logo/logo.png'),
        favicon_url: formatImageUrl(settings.favicon_url, '/images/logo/favicon.png'),
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
          logo_url: formatImageUrl(data.settings.logo_url, '/images/logo/logo.png'),
          favicon_url: formatImageUrl(data.settings.favicon_url, '/images/logo/favicon.png'),
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
                      Logo Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.logo_url}
                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        onBlur={(e) => {
                          const formatted = formatImageUrl(e.target.value, '/images/logo/logo.png');
                          setSettings({ ...settings, logo_url: formatted });
                        }}
                        disabled={settings.use_text_logo}
                        placeholder="https://...supabase.co/storage/... or /uploads/logos/site_logo.png"
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
                      Favicon URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.favicon_url}
                        onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                        onBlur={(e) => {
                          const formatted = formatImageUrl(e.target.value, '/images/logo/logo.png');
                          setSettings({ ...settings, favicon_url: formatted });
                        }}
                        placeholder="https://...supabase.co/storage/... or /uploads/logos/site_favicon.png"
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
                    💡 Supports direct Supabase storage links, CDN URLs, Google Drive links, or direct file uploads.
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
                            {settings.site_name || 'RoseOil.in'}
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
                            (e.target as HTMLImageElement).src = '/images/logo/logo.png';
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
                            (e.target as HTMLImageElement).src = '/images/logo/logo.png';
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

          {/* SECTION 2: Store Physical Address, Contact Channels & Map (Direct Source for Contact Us Page) */}
          <div className="p-6 rounded-2xl bg-white border-2 border-amber-200/80 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                <MapPin className="w-5 h-5 text-amber-700" /> Store Physical Address & Contact Channels
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                Live Source for &ldquo;/contact&rdquo; Page
              </span>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              Update your physical distillery location, customer support desk email, phone number, WhatsApp, and Google Map. Changes here will immediately populate on the public <strong>Contact Us</strong> page.
            </p>

            {/* Address Lines */}
            <div className="space-y-4">
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Building className="w-4 h-4 text-amber-600" /> Physical Address Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Distillery / Estate Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RoseOil.in Botanical Laboratories"
                    value={settings.store_address_line1 || ''}
                    onChange={(e) => setSettings({ ...settings, store_address_line1: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Address Line 2 (Area / Industrial Zone / Landmark)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kannauj Industrial Area, GT Road"
                    value={settings.store_address_line2 || ''}
                    onChange={(e) => setSettings({ ...settings, store_address_line2: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kannauj"
                    value={settings.store_city || ''}
                    onChange={(e) => setSettings({ ...settings, store_city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Uttar Pradesh"
                    value={settings.store_state || ''}
                    onChange={(e) => setSettings({ ...settings, store_state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Postal Code / PIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="209725"
                    value={settings.store_pincode || ''}
                    onChange={(e) => setSettings({ ...settings, store_pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    placeholder="India"
                    value={settings.store_country || ''}
                    onChange={(e) => setSettings({ ...settings, store_country: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Direct Communication Channels */}
            <div className="pt-3 border-t border-stone-200 space-y-4">
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Phone className="w-4 h-4 text-amber-600" /> Direct Communication Channels
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Store Support Email (Admin Inbox) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="shikhatandon2009@gmail.com"
                      value={settings.contact_email}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Customer Care Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="+91 96486 78599"
                      value={settings.contact_phone}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    1-Click WhatsApp Support Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="+91 96486 78599"
                      value={settings.whatsapp_number || ''}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono font-bold focus:outline-none focus:border-amber-600"
                    />
                    <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Operating & Support Hours *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Mon - Sat: 9:00 AM - 8:00 PM IST"
                      value={settings.support_hours || ''}
                      onChange={(e) => setSettings({ ...settings, support_hours: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                    />
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Google Maps Embed URL (Iframe URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.google.com/maps/embed?..."
                    value={settings.google_map_embed || ''}
                    onChange={(e) => setSettings({ ...settings, google_map_embed: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-600"
                  />
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

          {/* SECTION 4: Shipping Rates & Regional Logistics Matrix */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-2">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                <Truck className="w-5 h-5 text-amber-600" /> Shipping & Logistics Matrix (Weight & Region Based)
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                Gross = Net + 20% Overhead • Taxable Supply
              </span>
            </div>

            {/* DOMESTIC INDIA SHIPPING SECTION WITH EDITABLE SLAB TABLE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇮🇳</span>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                      India Domestic Shipping Slabs (10ml to 200+ Kg)
                    </h4>
                    <p className="text-[11px] text-stone-600">
                      Calculated on Gross Weight (+20% packaging buffer). Sizes 10ml to 200 Kg use the tiered rate table below.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentSlabs = settings.shipping_rates?.india_weight_slabs || DEFAULT_INDIA_WEIGHT_SLABS;
                      const newSlab = {
                        maxKg: currentSlabs.length > 0 ? Number((currentSlabs[currentSlabs.length - 1].maxKg + 5).toFixed(1)) : 1.0,
                        rateINR: currentSlabs.length > 0 ? currentSlabs[currentSlabs.length - 1].rateINR + 100 : 150,
                        label: 'Custom Tier',
                      };
                      setSettings({
                        ...settings,
                        shipping_rates: {
                          ...settings.shipping_rates,
                          india_weight_slabs: [...currentSlabs, newSlab],
                        },
                      });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#FAE6E7] hover:bg-[#F7D1D8] border border-[#F7D1D8] text-[#4A0D25] text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tier Slab
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        shipping_rates: {
                          ...settings.shipping_rates,
                          india_weight_slabs: DEFAULT_INDIA_WEIGHT_SLABS,
                        },
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
                    title="Reset to factory standard weight slabs"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              {/* Editable Domestic Weight Slabs Table */}
              <div className="rounded-xl border border-stone-300 bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-800 uppercase font-black text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Max Weight (Kg)</th>
                      <th className="p-2.5">Domestic Rate (₹)</th>
                      <th className="p-2.5">Slab Description / Size Format</th>
                      <th className="p-2.5 text-right w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 font-medium">
                    {(settings.shipping_rates?.india_weight_slabs || DEFAULT_INDIA_WEIGHT_SLABS).map((slab, idx) => {
                      const slabsList = settings.shipping_rates?.india_weight_slabs || DEFAULT_INDIA_WEIGHT_SLABS;
                      return (
                        <tr key={idx} className="hover:bg-amber-50/40">
                          <td className="p-2.5 font-bold text-stone-400">{idx + 1}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step="0.01"
                                value={slab.maxKg}
                                onChange={(e) => {
                                  const updated = [...slabsList];
                                  updated[idx] = { ...updated[idx], maxKg: Number(e.target.value) };
                                  setSettings({
                                    ...settings,
                                    shipping_rates: { ...settings.shipping_rates, india_weight_slabs: updated },
                                  });
                                }}
                                className="w-24 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-stone-900"
                              />
                              <span className="text-[10px] text-stone-500 font-bold">Kg</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-stone-600">₹</span>
                              <input
                                type="number"
                                value={slab.rateINR}
                                onChange={(e) => {
                                  const updated = [...slabsList];
                                  updated[idx] = { ...updated[idx], rateINR: Number(e.target.value) };
                                  setSettings({
                                    ...settings,
                                    shipping_rates: { ...settings.shipping_rates, india_weight_slabs: updated },
                                  });
                                }}
                                className="w-28 px-2 py-1 rounded-lg border border-stone-300 text-xs font-bold text-[#4A0D25]"
                              />
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={slab.label}
                              onChange={(e) => {
                                const updated = [...slabsList];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                setSettings({
                                  ...settings,
                                  shipping_rates: { ...settings.shipping_rates, india_weight_slabs: updated },
                                });
                              }}
                              placeholder="e.g. Up to 100 gm (Sample / 10ml)"
                              className="w-full px-2 py-1 rounded-lg border border-stone-300 text-xs text-stone-800"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = slabsList.filter((_, i) => i !== idx);
                                setSettings({
                                  ...settings,
                                  shipping_rates: { ...settings.shipping_rates, india_weight_slabs: updated },
                                });
                              }}
                              className="p-1 rounded text-stone-400 hover:text-rose-600"
                              title="Delete slab"
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

              {/* Domestic Shipping Controls: Free Threshold, Over 200 Kg Rate & Packaging Buffer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-stone-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-900">
                      Free Shipping Threshold (₹)
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {(settings.shipping_rates?.free_threshold ?? 2500) > 0 ? 'Active' : 'Disabled (Always Charge)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-stone-600">₹</span>
                    <input
                      type="number"
                      value={settings.shipping_rates?.free_threshold ?? 2500}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shipping_rates: { ...settings.shipping_rates, free_threshold: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none"
                      placeholder="e.g. 2500 (or 0 to always charge)"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Orders at or above this value qualify for free domestic shipping. <strong>Set to 0 to always charge weight-based shipping</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-300 space-y-1">
                  <label className="block text-xs font-bold text-stone-900">
                    Over 200 Kg Flat Rate (₹ / Kg) <span className="text-amber-800 font-normal">• Bulk Cargo</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-stone-600">₹</span>
                    <input
                      type="number"
                      value={settings.shipping_rates?.india_over_200kg_rate_per_kg || 100}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shipping_rates: { ...settings.shipping_rates, india_over_200kg_rate_per_kg: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none"
                    />
                    <span className="text-xs text-stone-500 font-bold">/ Kg</span>
                  </div>
                  <p className="text-[10px] text-stone-500">Post 200 Kg, orders are charged flat per kg (e.g. 250 Kg × ₹100 = ₹25,000).</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-300 space-y-1">
                  <label className="block text-xs font-bold text-stone-900">
                    Packaging Overhead Buffer (%) <span className="text-amber-800 font-normal">• Gross Weight</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.shipping_rates?.packaging_overhead_percent || 20}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shipping_rates: { ...settings.shipping_rates, packaging_overhead_percent: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-300 text-xs text-stone-900 font-bold focus:outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2 text-xs text-stone-500 font-bold">%</span>
                  </div>
                  <p className="text-[10px] text-stone-500">Gross Weight = Net Weight + 20% (1 Kg Net = 1.2 Kg Gross Billed).</p>
                </div>
              </div>
            </div>

            {/* INTERNATIONAL EXPORT REGIONS SECTION WITH EDITABLE RATES */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✈️</span>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                      International & Export Regional Rates (USD / Kg)
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Standard Export: $9 USD/Kg (Min $30 USD). Above 200 Kg: Regional Destination Rates below apply.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-950 text-[10px] font-bold">
                  Global Freight Engine
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1">
                  <label className="block text-xs font-bold text-amber-950">Standard Export Rate Up to 200 Kg ($ USD / Kg)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-600">$</span>
                    <input
                      type="number"
                      value={settings.shipping_rates?.export_under_200kg_rate_usd || 9}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shipping_rates: { ...settings.shipping_rates, export_under_200kg_rate_usd: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-300 text-xs text-stone-900 font-bold focus:outline-none"
                    />
                    <span className="text-xs text-stone-500 font-bold">/ Kg</span>
                  </div>
                  <p className="text-[10px] text-amber-800">Default rate per kg for export parcels under 200 Kg.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1">
                  <label className="block text-xs font-bold text-amber-950">Minimum Export Fixed Charge ($ USD)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-600">$</span>
                    <input
                      type="number"
                      value={settings.shipping_rates?.export_min_charge_usd || 30}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          shipping_rates: { ...settings.shipping_rates, export_min_charge_usd: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-amber-50/50 border border-amber-300 text-xs text-stone-900 font-bold focus:outline-none"
                    />
                    <span className="text-xs text-stone-500 font-bold">USD</span>
                  </div>
                  <p className="text-[10px] text-amber-800">Minimum base courier fee applied to any export dispatch.</p>
                </div>
              </div>

              {/* Above 200 Kg Regional Rate Table with Direct Input Controls */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-amber-950 mb-2">
                  Over 200 Kg Export Regional Rates ($ USD / Kg) — Editable by Destination Zone:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* USA & Canada */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🇺🇸 USA & 🇨🇦 Canada</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.usa_canada ?? 8}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                usa_canada: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-amber-950"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* Asiana */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🇯🇵 Asiana (East/SE Asia)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.asiana ?? 8}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                asiana: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-amber-950"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* Asia Pacific */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🇦🇺 Asia Pacific (AU, NZ)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.asia_pacific ?? 6}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                asia_pacific: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-emerald-900"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* Gulf & Middle East */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🇦🇪 Gulf & Middle East</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.gulf_middle_east ?? 6}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                gulf_middle_east: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-emerald-900"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* Africa */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🌍 Africa</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.africa ?? 11}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                africa: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-rose-950"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* South America */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🇧🇷 South America</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.south_america ?? 10}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                south_america: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-rose-950"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* Europe & UK */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🇪🇺 Europe & 🇬🇧 UK</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.europe ?? 7}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                europe: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-blue-950"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>

                  {/* Rest of World */}
                  <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1.5">
                    <span className="text-xs font-bold text-stone-800 block">🌐 Rest of World</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-600">$</span>
                      <input
                        type="number"
                        value={settings.shipping_rates?.export_region_over_200kg_rates?.rest_of_world ?? 9}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            shipping_rates: {
                              ...settings.shipping_rates,
                              export_region_over_200kg_rates: {
                                ...(settings.shipping_rates?.export_region_over_200kg_rates || {}),
                                rest_of_world: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-2 py-1 rounded-lg border border-amber-300 text-xs font-bold text-stone-900"
                      />
                      <span className="text-[10px] text-stone-500 font-bold">/Kg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-stone-900">Taxable Supply Compliance Notice</span>
                <p className="text-[11px] text-stone-600">
                  In accordance with GST rules, transportation/freight services on domestic e-commerce transactions are taxable supplies. The applicable {settings.tax_rate ?? 18}% GST is computed on the total taxable base: <strong>(Items Subtotal - Discount) + Shipping Fee</strong>.
                </p>
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
                  Store GSTIN Number (For Tax Invoices) *
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

          {/* SECTION 6: System Data Management & Safety Operations */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
                <Database className="w-5 h-5 text-amber-600" /> System Data Backup & Danger Zone
              </div>
              <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-[10px] font-black uppercase tracking-wider">
                Store-Scoped Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Option 1: Backup Data */}
              <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                    <Download className="w-4 h-4 text-emerald-600" /> 1. Export System Backup
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Export a full encrypted JSON backup containing catalog items, bottle sizes, customer profiles, order logs, reviews, and store settings.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-stone-600">Products</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-stone-600">Variants</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] font-bold text-stone-600">Orders</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isDownloadingBackup}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloadingBackup ? 'Generating...' : 'Download Backup (.json)'}</span>
                </button>
              </div>

              {/* Option 2: Restore Data */}
              <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
                    <UploadCloud className="w-4 h-4 text-sky-600" /> 2. Restore from Backup
                  </div>
                  <p className="text-xs text-sky-800 leading-relaxed">
                    Upload any previously downloaded RoseOil.in backup JSON file to safely restore catalog, variants, and configurations to Supabase.
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-[10px] font-bold text-sky-700">Auto Upsert</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-sky-200 text-[10px] font-bold text-sky-700">Pre-check</span>
                  </div>
                </div>

                <label className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <UploadCloud className="w-4 h-4" />
                  <span>{isRestoring ? 'Restoring...' : 'Restore Backup (.json)'}</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleSelectBackupFile}
                    className="hidden"
                    disabled={isRestoring}
                  />
                </label>
              </div>

              {/* Option 3: Purge Data (Double Verification) */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> 3. Purge Store Data
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    Permanently delete all catalog products, bottle sizes, test customer accounts, orders, reviews, and cart records from Supabase.
                  </p>
                  <p className="text-[11px] text-rose-700 font-bold">
                    ⚠️ Irreversible Action (2-step check)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPurgeStep(1);
                    setPurgeInputText('');
                    setIsPurgeModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge All Store Data</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
                  placeholder="customer@roseoil.in"
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

      {/* RESTORE BACKUP CONFIRMATION MODAL */}
      {isRestoreModalOpen && backupFilePayload && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-sky-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-sky-950">
                    Restore System Data Backup
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">Verify Backup Archive Contents</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isRestoring) {
                    setIsRestoreModalOpen(false);
                    setBackupFilePayload(null);
                  }
                }}
                disabled={isRestoring}
                className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Archive Summary Inspection */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-2">
                <div className="font-extrabold text-sky-900 flex items-center justify-between">
                  <span>Archive Export Date:</span>
                  <span className="font-mono text-stone-600 font-normal">
                    {backupFilePayload.metadata?.export_date
                      ? new Date(backupFilePayload.metadata.export_date).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center font-bold">
                  <div className="p-2 rounded-xl bg-white border border-sky-200 shadow-2xs">
                    <div className="text-base text-sky-700">
                      {backupFilePayload.data?.products?.length ||
                        backupFilePayload.products?.length ||
                        (Array.isArray(backupFilePayload) ? backupFilePayload.length : 0) ||
                        backupFilePayload.metadata?.summary?.total_products ||
                        0}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">Products</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-sky-200 shadow-2xs">
                    <div className="text-base text-sky-700">
                      {backupFilePayload.data?.variants?.length ||
                        backupFilePayload.data?.product_variants?.length ||
                        backupFilePayload.variants?.length ||
                        backupFilePayload.product_variants?.length ||
                        backupFilePayload.metadata?.summary?.total_variants ||
                        0}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">Bottle Sizes</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-sky-200 shadow-2xs">
                    <div className="text-base text-sky-700">
                      {backupFilePayload.data?.categories?.length ||
                        backupFilePayload.categories?.length ||
                        backupFilePayload.metadata?.summary?.total_categories ||
                        0}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">Categories</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-sky-200 shadow-2xs">
                    <div className="text-sm font-bold text-emerald-700">
                      {backupFilePayload.data?.site_settings ? '✓ Complete' : '—'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">Weight & Slabs</div>
                  </div>
                </div>

                {(backupFilePayload.data?.pages?.length || backupFilePayload.data?.blogs?.length || backupFilePayload.data?.countries?.length) ? (
                  <div className="flex items-center justify-between text-[11px] bg-white p-2.5 rounded-xl border border-sky-200 text-stone-600">
                    <span>Includes Content & Routing:</span>
                    <span className="font-semibold text-sky-950">
                      {backupFilePayload.data?.pages?.length || 0} Pages • {backupFilePayload.data?.blogs?.length || 0} Blogs • {backupFilePayload.data?.countries?.length || 0} Countries
                    </span>
                  </div>
                ) : null}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                Restoring this backup will safely update or upsert all store configurations, domestic weight slabs, export regional tiers, products, variants, and pages into the Supabase database.
              </p>

              <div className="pt-2 flex justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsRestoreModalOpen(false);
                    setBackupFilePayload(null);
                  }}
                  disabled={isRestoring}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isRestoring ? 'Restoring System Data...' : 'Confirm & Restore Backup'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURGE ALL DATA DOUBLE-MESSAGE CHECK MODAL */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-rose-950">
                    {purgeStep === 1 ? 'Step 1 of 2: Danger Zone Warning' : 'Step 2 of 2: Final Verification'}
                  </h2>
                  <p className="text-[11px] text-stone-500 font-medium">Double-Message Confirmation Guard</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isPurging) setIsPurgeModalOpen(false);
                }}
                disabled={isPurging}
                className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: INITIAL WARNING */}
            {purgeStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-2">
                  <div className="font-extrabold flex items-center gap-2 text-rose-800 text-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Are you absolutely sure you want to purge all data?</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    This action will permanently erase:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-stone-800 font-medium pl-1">
                    <li>All catalog products and bottle sizes/variants</li>
                    <li>All order histories and cart entries</li>
                    <li>All customer reviews & question threads</li>
                    <li>All registered non-admin customer profiles</li>
                  </ul>
                  <p className="font-black text-rose-700 pt-1">
                    ⚠️ This operation is irreversible and cannot be undone.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsPurgeModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurgeStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>I Understand the Risks — Continue to Step 2</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: TYPED VERIFICATION CHECK */}
            {purgeStep === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
                  <p className="font-extrabold text-amber-900">
                    Please type <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-300 font-black text-rose-700">PURGE</span> below to authorize the deletion:
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    value={purgeInputText}
                    onChange={(e) => setPurgeInputText(e.target.value)}
                    placeholder="Type PURGE in capital letters"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border-2 border-stone-300 text-sm font-mono font-bold text-stone-900 focus:outline-none focus:border-rose-600 tracking-wider"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setPurgeStep(1)}
                    disabled={isPurging}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer"
                  >
                    Back to Step 1
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePurge}
                    disabled={isPurging || purgeInputText.trim() !== 'PURGE'}
                    className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isPurging ? 'Purging All Store Data...' : 'Permanently Delete All Store Data'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
