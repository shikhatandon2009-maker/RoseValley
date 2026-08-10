'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Type,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Crown,
  Feather,
  Layout,
  RefreshCw,
  Eye,
  Check,
  Globe,
  Sliders
} from 'lucide-react';
import { loadAndApplyGoogleFont, GOOGLE_FONTS_MAP } from '@/components/layout/FontProvider';

const SERIF_OPTIONS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Bodoni Moda',
  'Cinzel Decorative',
  'Cinzel',
  'Italiana',
  'Prata',
  'Aboreto',
  'Marcellus',
  'Bellefair',
  'Castoro Titling',
];

const SCRIPT_OPTIONS = [
  'Pinyon Script',
  'Alex Brush',
  'Great Vibes',
  'Allura',
];

const SANS_OPTIONS = [
  'Plus Jakarta Sans',
  'Tenor Sans',
  'Outfit',
  'Syne',
  'Montserrat',
];

export default function AdminFontsPage() {
  const [headerFont, setHeaderFont] = useState('Playfair Display');
  const [scriptFont, setScriptFont] = useState('Pinyon Script');
  const [bodyFont, setBodyFont] = useState('Plus Jakarta Sans');

  const [customHeaderFont, setCustomHeaderFont] = useState('');
  const [customBodyFont, setCustomBodyFont] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch saved settings
  useEffect(() => {
    fetch('/api/admin/theme')
      .then((res) => res.json())
      .then((data) => {
        if (data.header_font) setHeaderFont(data.header_font);
        if (data.script_font) setScriptFont(data.script_font);
        if (data.body_font) setBodyFont(data.body_font);
      })
      .catch((err) => console.error('Error loading font settings:', err))
      .finally(() => setLoading(false));
  }, []);

  // Update live preview whenever state changes
  useEffect(() => {
    const finalHeader = customHeaderFont.trim() || headerFont;
    const finalBody = customBodyFont.trim() || bodyFont;

    loadAndApplyGoogleFont(finalHeader, 'header');
    loadAndApplyGoogleFont(scriptFont, 'script');
    loadAndApplyGoogleFont(finalBody, 'body');
  }, [headerFont, customHeaderFont, scriptFont, bodyFont, customBodyFont]);

  // Handle Save
  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);

    const finalHeader = customHeaderFont.trim() || headerFont;
    const finalBody = customBodyFont.trim() || bodyFont;

    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          header_font: finalHeader,
          script_font: scriptFont,
          body_font: finalBody,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        try {
          localStorage.setItem('admin_header_font', finalHeader);
          localStorage.setItem('admin_script_font', scriptFont);
          localStorage.setItem('admin_body_font', finalBody);
        } catch (e) {}

        setToastMessage({
          type: 'success',
          text: `Typography suite updated successfully! Storefront is now using ${finalHeader} & ${finalBody}.`,
        });
      } else {
        throw new Error(data.message || 'Failed to save font settings');
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.message || 'Failed to save settings',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const activeHeaderStyle = GOOGLE_FONTS_MAP[customHeaderFont.trim() || headerFont]?.family || `'${customHeaderFont || headerFont}', serif`;
  const activeScriptStyle = GOOGLE_FONTS_MAP[scriptFont]?.family || `'${scriptFont}', cursive`;
  const activeBodyStyle = GOOGLE_FONTS_MAP[customBodyFont.trim() || bodyFont]?.family || `'${customBodyFont || bodyFont}', sans-serif`;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold underline hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F7D1D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A0D25] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#F6A6BB]" /> Store Suite Settings
          </div>
          <h1 className="text-3xl font-black text-[#1A0510] tracking-tight flex items-center gap-3">
            <Type className="w-8 h-8 text-[#4A0D25]" /> Executive Typography & Font Suite
          </h1>
          <p className="text-sm text-[#4A0D25]/80 mt-1">
            Select, customize, and finalize the heading, calligraphy, and body fonts applied site-wide across all storefront components.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#4A0D25] to-[#6B0F34] text-white hover:from-[#6B0F34] hover:to-[#4A0D25] px-6 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-[#F6A6BB]" />
          )}
          <span>{isSaving ? 'Saving Typography...' : 'Save & Finalize Store Fonts'}</span>
        </button>
      </div>

      {/* Main Grid: Controls (Left) vs Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Font Selection Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Header / Brand Title Font */}
          <div className="bg-white p-6 rounded-2xl border border-[#F7D1D8] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAE6E7] flex items-center justify-center">
                  <Crown className="w-4 h-4 text-[#4A0D25]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A0510]">Heading & Brand Logo Font</h3>
                  <p className="text-xs text-neutral-500">Applies to header brand logo, page titles, and hero section titles.</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-[#FAE6E7] text-[#4A0D25] px-2.5 py-1 rounded-full font-bold">
                --font-serif
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase text-[#4A0D25]">
                Select Luxury Serif & Display Font
              </label>
              <select
                value={headerFont}
                onChange={(e) => {
                  setHeaderFont(e.target.value);
                  setCustomHeaderFont('');
                }}
                className="w-full p-3 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] font-bold text-sm text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
              >
                {SERIF_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Or enter Custom Google Font name (e.g. "Cinzel Decorative" or "Cinzel Decorative:wght@700"):
                </label>
                <input
                  type="text"
                  placeholder="Type any Google Font..."
                  value={customHeaderFont}
                  onChange={(e) => setCustomHeaderFont(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F7D1D8] text-xs text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Calligraphy / Fragrance Certificate Script Font */}
          <div className="bg-white p-6 rounded-2xl border border-[#F7D1D8] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAE6E7] flex items-center justify-center">
                  <Feather className="w-4 h-4 text-[#4A0D25]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A0510]">Calligraphy & Signature Script</h3>
                  <p className="text-xs text-neutral-500">Applies to artisanal certificates, distiller signatures, and luxury seals.</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-[#FAE6E7] text-[#4A0D25] px-2.5 py-1 rounded-full font-bold">
                --font-script
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase text-[#4A0D25]">
                Select Calligraphic Script Font
              </label>
              <select
                value={scriptFont}
                onChange={(e) => setScriptFont(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] font-bold text-sm text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
              >
                {SCRIPT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Body & Navigation UI Font */}
          <div className="bg-white p-6 rounded-2xl border border-[#F7D1D8] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAE6E7] flex items-center justify-center">
                  <Type className="w-4 h-4 text-[#4A0D25]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1A0510]">Body & Interface Font</h3>
                  <p className="text-xs text-neutral-500">Applies to body paragraphs, buttons, navigation menus, and form controls.</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-[#FAE6E7] text-[#4A0D25] px-2.5 py-1 rounded-full font-bold">
                --font-jakarta
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-extrabold uppercase text-[#4A0D25]">
                Select Modern Clean Sans-Serif Font
              </label>
              <select
                value={bodyFont}
                onChange={(e) => {
                  setBodyFont(e.target.value);
                  setCustomBodyFont('');
                }}
                className="w-full p-3 rounded-xl bg-[#F7EEED] border border-[#F7D1D8] font-bold text-sm text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
              >
                {SANS_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                  Or enter Custom Google Font name:
                </label>
                <input
                  type="text"
                  placeholder="Type any Google Sans Font..."
                  value={customBodyFont}
                  onChange={(e) => setCustomBodyFont(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#F7D1D8] text-xs text-[#1A0510] focus:outline-none focus:ring-2 focus:ring-[#F6A6BB]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Live Preview Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-[#F7D1D8] shadow-md sticky top-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F7D1D8] pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4A0D25] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#F6A6BB]" /> Real-time Storefront Preview
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">
                Live
              </span>
            </div>

            {/* Live Storefront Component Mockup */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#F7EEED] via-[#FAE6E7]/50 to-[#FFFFFF] border border-[#F7D1D8] space-y-6">
              {/* Brand Header Logo Mockup */}
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#4A0D25]/70 block">
                  Header Brand Logo
                </span>
                <h2
                  className="text-2xl font-black tracking-wider text-[#1A0510]"
                  style={{ fontFamily: activeHeaderStyle }}
                >
                  ROSE VALLEY KANNAUJ
                </h2>
                <p className="text-[11px] text-[#4A0D25] tracking-widest uppercase font-bold">
                  Artisanal Attars & Pure Distillates
                </p>
              </div>

              {/* Olfactory Note Banner */}
              <div className="p-4 rounded-xl bg-white border border-[#F7D1D8] shadow-sm space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#F6A6BB] block tracking-wider">
                  Product Hero Title
                </span>
                <h3
                  className="text-lg font-bold text-[#1A0510]"
                  style={{ fontFamily: activeHeaderStyle }}
                >
                  Hydro-Distilled Ruh Gulab 2026
                </h3>

                <p
                  className="text-xs text-neutral-700 leading-relaxed"
                  style={{ fontFamily: activeBodyStyle }}
                >
                  Hand-crafted using 400-year-old copper Deg-Bhapka hydro-distillation techniques in Kannauj.
                </p>
              </div>

              {/* Calligraphy Signature Seal */}
              <div className="p-4 rounded-xl bg-[#4A0D25] text-white space-y-1 text-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F6A6BB]">
                  Provenance Signature Seal
                </span>
                <p
                  className="text-xl text-[#F6A6BB]"
                  style={{ fontFamily: activeScriptStyle }}
                >
                  Distiller Certificate #Deg-04 • Kannauj Heritage
                </p>
              </div>
            </div>

            {/* Active Typography Summary Box */}
            <div className="p-4 rounded-xl bg-[#F7EEED] text-xs space-y-2 font-mono text-[#1A0510]">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Heading Font:</span>
                <span className="font-bold text-[#4A0D25]">{customHeaderFont || headerFont}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Script Font:</span>
                <span className="font-bold text-[#4A0D25]">{scriptFont}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-sans">Body Font:</span>
                <span className="font-bold text-[#4A0D25]">{customBodyFont || bodyFont}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
