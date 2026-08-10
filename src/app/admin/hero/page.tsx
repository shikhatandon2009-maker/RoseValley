'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Save,
  RefreshCw,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Upload,
  Loader2,
  Wand2,
} from 'lucide-react';
import '@/styles/hero-champaca.css';

interface HeroSlideForm {
  id?: string;
  tagline: string;
  title: string;
  subtitle: string;
  product_name: string;
  product_link: string;
  bg_image_url: string;
  bottle_image_url: string;
  button_text: string;
  badge_text: string;
  glow_color: string;
  is_active: boolean;
}

const DEFAULT_FORM: HeroSlideForm = {
  tagline: 'Harvest 2026 • Royal Botanical Reserve',
  title: 'Golden Champaca',
  subtitle:
    'Extracted from dawn-harvested golden Champaca blossoms (Magnolia champaca). Steam distilled into a pure sandalwood base for an extraordinary divine floral sillage.',
  product_name: 'Golden Champaca Absolute Oil',
  product_link: '/products',
  bg_image_url: '/images/hero/champaca-flower-bg.png',
  bottle_image_url: '/images/hero/champaca-bottle.png',
  button_text: 'Explore Golden Champaca',
  badge_text: '100% Hydro-Distilled • Alcohol-Free',
  glow_color: '#FFD700',
  is_active: true,
};

export default function AdminHeroPage() {
  const [formData, setFormData] = useState<HeroSlideForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Uploading states
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingBottle, setUploadingBottle] = useState(false);

  // AI Generation states
  const [showAiBgModal, setShowAiBgModal] = useState(false);
  const [showAiBottleModal, setShowAiBottleModal] = useState(false);
  const [aiBgPrompt, setAiBgPrompt] = useState('Exotic golden yellow Champaca flowers blooming in twilight');
  const [aiBottlePrompt, setAiBottlePrompt] = useState('Luxury crystal perfume bottle filled with golden champaca oil');
  const [generatingAiBg, setGeneratingAiBg] = useState(false);
  const [generatingAiBottle, setGeneratingAiBottle] = useState(false);

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const bottleFileInputRef = useRef<HTMLInputElement>(null);

  const fetchHeroData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/hero-slides');
      const data = await res.json();
      if (data.success && data.slides && data.slides.length > 0) {
        const first = data.slides[0];
        setFormData({
          id: first.id,
          tagline: first.tagline || DEFAULT_FORM.tagline,
          title: first.title || DEFAULT_FORM.title,
          subtitle: first.subtitle || DEFAULT_FORM.subtitle,
          product_name: first.product_name || DEFAULT_FORM.product_name,
          product_link: first.product_link || DEFAULT_FORM.product_link,
          bg_image_url: first.bg_image_url || DEFAULT_FORM.bg_image_url,
          bottle_image_url: first.bottle_image_url || DEFAULT_FORM.bottle_image_url,
          button_text: first.button_text || DEFAULT_FORM.button_text,
          badge_text: first.badge_text || DEFAULT_FORM.badge_text,
          glow_color: first.glow_color || '#FFD700',
          is_active: first.is_active ?? true,
        });
      }
    } catch (err) {
      console.error('Error loading hero settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'bg_image_url' | 'bottle_image_url'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const setUploading = field === 'bg_image_url' ? setUploadingBg : setUploadingBottle;

    setUploading(true);
    setStatusMsg(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, [field]: data.url }));
        setStatusMsg({
          type: 'success',
          text: `Image "${file.name}" uploaded successfully!`,
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: data.error || 'Failed to upload image.',
        });
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Image upload error.',
      });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAiGenerate = async (type: 'bg' | 'bottle') => {
    const prompt = type === 'bg' ? aiBgPrompt : aiBottlePrompt;
    const setGenerating = type === 'bg' ? setGeneratingAiBg : setGeneratingAiBottle;
    const closeModal = type === 'bg' ? () => setShowAiBgModal(false) : () => setShowAiBottleModal(false);

    if (!prompt.trim()) return;

    setGenerating(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/generate-hero-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          [type === 'bg' ? 'bg_image_url' : 'bottle_image_url']: data.url,
        }));
        setStatusMsg({
          type: 'success',
          text: `AI generated new ${type === 'bg' ? 'Background' : 'Bottle'} image!`,
        });
        closeModal();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'AI generation failed.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'AI generation error.' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: 'Hero Section settings saved successfully!' });
        if (data.slide?.id) {
          setFormData((prev) => ({ ...prev, id: data.slide.id }));
        }
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Failed to update hero settings.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-600" /> Website Customization Suite
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 mt-1">
            Hero Section Manager
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Upload images or generate new botanical backgrounds & background-free bottles using AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHeroData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold flex items-center gap-2 transition-all hover:bg-stone-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Reload Settings
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border border-rose-300 text-rose-900'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Live Preview Box */}
      <div className="bg-stone-900 rounded-3xl p-6 border border-stone-800 shadow-xl overflow-hidden text-white space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <Eye className="w-4 h-4 text-amber-400" /> Live Hero Preview (Real-time Simulation)
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/50 font-mono text-[10px] font-bold">
            HIGH AESTHETIC DESIGN
          </span>
        </div>

        {/* Scaled Down Hero Preview Box */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-700/60 min-h-[420px] bg-[#0b0704] flex items-center">
          {/* Background Image */}
          <img
            src={formData.bg_image_url}
            alt="Hero Background Preview"
            className="absolute inset-0 w-full h-full object-cover opacity-75 filter brightness-90"
          />

          {/* Dark Overlay Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0704] via-[#0b0704]/70 to-transparent" />

          {/* Content Layout */}
          <div className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
            {/* Left Info */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#120c08] border border-[#ffd700] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                <Sparkles className="w-3 h-3 text-[#ffd700]" />
                <span className="text-white font-extrabold">{formData.badge_text}</span>
              </div>
              <div className="text-xs font-serif text-[#ffd700] tracking-widest uppercase font-bold drop-shadow">
                {formData.tagline}
              </div>
              <h2 className="font-serif text-3xl font-bold leading-tight">
                <span className="block text-white font-bold drop-shadow-md">Sovereign Essence Of</span>
                <span className="text-amber-400 italic drop-shadow-md">{formData.title}</span>
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed max-w-md line-clamp-3">
                {formData.subtitle}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  {formData.button_text} <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Right Glowing Bottle Preview */}
            <div className="relative flex items-center justify-center min-h-[260px]">
              <div
                className="absolute w-64 h-64 rounded-full blur-2xl pointer-events-none opacity-80 animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${formData.glow_color}C0 0%, ${formData.glow_color}50 40%, transparent 80%)`,
                }}
              />
              <img
                src={formData.bottle_image_url}
                alt="Bottle Preview"
                className="relative z-10 max-h-72 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1 & 2: Text Content & Links */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <Sliders className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Main Headline & Content Text
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Hero Title (Product / Collection Name)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Golden Champaca"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Header Tagline Bar
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  placeholder="Harvest 2026 • Royal Botanical Reserve"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Badge Text Pill
              </label>
              <input
                type="text"
                name="badge_text"
                value={formData.badge_text}
                onChange={handleChange}
                placeholder="100% Hydro-Distilled • Alcohol-Free"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Subtitle Description
              </label>
              <textarea
                name="subtitle"
                rows={3}
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Extracted from dawn-harvested golden Champaca blossoms..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Links & CTA Button */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <LinkIcon className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Product Links & Call-To-Action Button
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Target Product Name
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  placeholder="Golden Champaca Absolute Oil"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Product Link URL
                </label>
                <input
                  type="text"
                  name="product_link"
                  value={formData.product_link}
                  onChange={handleChange}
                  placeholder="/products/golden-champaca-oil"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Explore Button Text
              </label>
              <input
                type="text"
                name="button_text"
                value={formData.button_text}
                onChange={handleChange}
                placeholder="Explore Golden Champaca"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>
          </div>
        </div>

        {/* Column 3: Image Uploads, AI Generators & Visual Glow Customization */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Image Uploads & AI Generators
              </h3>
            </div>

            {/* 1. Background Champaca Flower Image Upload & AI Generator */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Background Flower Image
              </label>

              {/* File Input (Hidden) */}
              <input
                ref={bgFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'bg_image_url')}
                className="hidden"
              />

              {/* Action Buttons: Upload + AI Generate */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => bgFileInputRef.current?.click()}
                  disabled={uploadingBg}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {uploadingBg ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAiBgModal(!showAiBgModal)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ AI Generate</span>
                </button>
              </div>

              {/* AI Background Generator Panel */}
              {showAiBgModal && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2 text-xs">
                  <div className="font-bold text-purple-900 flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5 text-purple-600" /> AI Background Prompt
                  </div>
                  <input
                    type="text"
                    value={aiBgPrompt}
                    onChange={(e) => setAiBgPrompt(e.target.value)}
                    placeholder="e.g. Exotic Jasmine Sambac blossoms at twilight..."
                    className="w-full px-3 py-1.5 rounded-lg border border-purple-200 text-xs text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleAiGenerate('bg')}
                    disabled={generatingAiBg}
                    className="w-full py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {generatingAiBg ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating AI Image...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-amber-300" /> Generate Background Image
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Image URL text input fallback */}
              <input
                type="text"
                name="bg_image_url"
                value={formData.bg_image_url}
                onChange={handleChange}
                placeholder="/images/hero/champaca-flower-bg.png"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] text-stone-700 font-mono"
              />
            </div>

            {/* 2. Background-Free Product Bottle Image Upload & AI Generator */}
            <div className="space-y-2.5 pt-3 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Product Bottle Image (Transparent/Isolated)
              </label>

              {/* File Input (Hidden) */}
              <input
                ref={bottleFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'bottle_image_url')}
                className="hidden"
              />

              {/* Action Buttons: Upload + AI Generate */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => bottleFileInputRef.current?.click()}
                  disabled={uploadingBottle}
                  className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {uploadingBottle ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAiBottleModal(!showAiBottleModal)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>✨ AI Generate</span>
                </button>
              </div>

              {/* AI Bottle Generator Panel */}
              {showAiBottleModal && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 space-y-2 text-xs">
                  <div className="font-bold text-indigo-900 flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-600" /> AI Bottle Prompt
                  </div>
                  <input
                    type="text"
                    value={aiBottlePrompt}
                    onChange={(e) => setAiBottlePrompt(e.target.value)}
                    placeholder="e.g. Royal Oud Perfume Flask with gold cap..."
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleAiGenerate('bottle')}
                    disabled={generatingAiBottle}
                    className="w-full py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {generatingAiBottle ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating AI Bottle...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-amber-300" /> Generate Bottle Image
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Image URL text input fallback */}
              <input
                type="text"
                name="bottle_image_url"
                value={formData.bottle_image_url}
                onChange={handleChange}
                placeholder="/images/hero/champaca-bottle.png"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-[11px] text-stone-700 font-mono"
              />
            </div>

            {/* Golden Glow Hex Color */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Golden Glow Aura Hex Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="glow_color"
                  value={formData.glow_color || '#FFD700'}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg border border-stone-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  name="glow_color"
                  value={formData.glow_color}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800">Publish Hero Section</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
