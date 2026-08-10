'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Layout,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Palette,
  Droplet,
  Radio,
  Clock,
  QrCode,
  Star
} from 'lucide-react';

interface HomepageSection {
  id: string;
  store_id: string;
  section_type: string;
  title?: string;
  subtitle?: string;
  content: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface PresetLayout {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  theme_accent: string;
  sections: Array<{
    section_type: string;
    title: string;
    subtitle: string;
  }>;
}

const PRESET_TEMPLATES: PresetLayout[] = [
  {
    id: 'current_rose_valley_master',
    name: 'Rose Valley Kannauj Official Master Layout',
    description: 'Current live layout featuring the 3-Bottle Orbital Product Spinner with Pinkish Aura Glow, Distillery Live Telemetry Stream, White & Gray Product Cards with Certified Badges, Scent Memory AI, 400-Year Timeline, and Digital Provenance Passport.',
    thumbnail: '/images/hero/champaca-bottle.png',
    theme_accent: 'Amaranth Pink & Snow Gray',
    sections: [
      { section_type: 'hero_orbital_spinner', title: 'Rose Oil Bottles Orbital Product Carousel', subtitle: 'Interactive 3-bottle rotation with Pinkish Aura Glow' },
      { section_type: 'authority_counters', title: 'World’s Largest Producer Authority Counters', subtitle: '400+ Years, 12,000+ Kgs Petals, 99.98% Purity, 54 Countries' },
      { section_type: 'live_distillery_feed', title: 'Live Telemetry Stream (Vessel #Deg-04)', subtitle: 'Real-time temperature, condensate flow, and yield stats' },
      { section_type: 'featured_elixirs_grid', title: 'Featured Pure Rose Oil Elixirs', subtitle: 'White & Gray cards with Pink Smokey Aura & Certified Badges' },
      { section_type: 'scent_memory_ai', title: 'Scent Memory AI Engine', subtitle: 'Translates nostalgic memory descriptions into perfume formulas' },
      { section_type: 'heritage_timeline', title: '400-Year Kannauj Distillation Timeline', subtitle: 'Historic progression from 1620 AD Imperial Court to today' },
      { section_type: 'provenance_passport', title: 'Digital Provenance Passport Seal', subtitle: 'Cryptographic QR harvest traceability certificate' },
      { section_type: 'client_testimonials', title: 'Private Client Impressions', subtitle: 'Verified reviews from international connoisseurs' },
    ],
  },
  {
    id: 'minimal_elixir_showcase',
    name: 'Minimalist Botanical Elixir Showcase',
    description: 'Streamlined minimalist layout emphasizing pure hydro-distilled elixirs, live telemetry feed, and scent memory AI.',
    thumbnail: '/uploads/hero/ruhkhus1_removebg_preview_1786261510836.png',
    theme_accent: 'Misty Rose & Charcoal',
    sections: [
      { section_type: 'hero_orbital_spinner', title: 'Orbital Perfume Spinner', subtitle: '3D Bottle orbital presentation' },
      { section_type: 'featured_elixirs_grid', title: 'Master Perfumer Reserve', subtitle: 'Featured essential oils & attars' },
      { section_type: 'scent_memory_ai', title: 'AI Scent Formula Synthesizer', subtitle: 'Instant scent accord recommendations' },
      { section_type: 'client_testimonials', title: 'Connoisseur Reviews', subtitle: 'Client feedback' },
    ],
  },
  {
    id: 'heritage_provenance_focus',
    name: 'Kannauj Heritage & Provenance Focus',
    description: 'Legacy-focused layout highlighting the 400-year copper Deg-Bhapka distillation tradition, digital provenance seals, and live distillery stream.',
    thumbnail: '/images/hero/champaca-bottle.png',
    theme_accent: 'Kannauj Copper & Amaranth Pink',
    sections: [
      { section_type: 'hero_orbital_spinner', title: 'Kannauj Imperial Hydro-Distillates', subtitle: 'Traditional copper deg-bhapka extractions' },
      { section_type: 'live_distillery_feed', title: 'Live Distillery Telemetry Stream', subtitle: 'Vessel #Deg-04 live metrics' },
      { section_type: 'heritage_timeline', title: '400-Year Kannauj Distillation Timeline', subtitle: '1620 AD to present day' },
      { section_type: 'provenance_passport', title: 'Digital Provenance Passport', subtitle: 'Batch verification' },
    ],
  },
];

export default function HomepageSectionsAdminPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingPresetId, setApplyingPresetId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [deletingSection, setDeletingSection] = useState<HomepageSection | null>(null);

  // Form
  const [formData, setFormData] = useState({
    section_type: 'hero_orbital_spinner',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    bg_image: '',
    display_order: 0,
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/homepage-sections');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch homepage sections');

      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
      } else {
        // Fallback default sections matching current home page layout
        const defaultSections: HomepageSection[] = PRESET_TEMPLATES[0].sections.map((sec, idx) => ({
          id: `default-${idx}`,
          store_id: 'default',
          section_type: sec.section_type,
          title: sec.title,
          subtitle: sec.subtitle,
          content: { cta_text: 'Explore Collection', cta_link: '/products' },
          display_order: idx + 1,
          is_active: true,
          created_at: new Date().toISOString(),
        }));
        setSections(defaultSections);
      }
    } catch (err: any) {
      console.error(err);
      // Load fallback matching home page if API unavailable
      const defaultSections: HomepageSection[] = PRESET_TEMPLATES[0].sections.map((sec, idx) => ({
        id: `default-${idx}`,
        store_id: 'default',
        section_type: sec.section_type,
        title: sec.title,
        subtitle: sec.subtitle,
        content: { cta_text: 'Explore Collection', cta_link: '/products' },
        display_order: idx + 1,
        is_active: true,
        created_at: new Date().toISOString(),
      }));
      setSections(defaultSections);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleApplyPreset = async (presetId: string) => {
    try {
      setApplyingPresetId(presetId);
      const tmpl = PRESET_TEMPLATES.find((t) => t.id === presetId);
      if (!tmpl) return;

      const newSections: HomepageSection[] = tmpl.sections.map((sec, idx) => ({
        id: `preset-${presetId}-${idx}`,
        store_id: 'default',
        section_type: sec.section_type,
        title: sec.title,
        subtitle: sec.subtitle,
        content: { cta_text: 'Explore Reserve', cta_link: '/products' },
        display_order: idx + 1,
        is_active: true,
        created_at: new Date().toISOString(),
      }));

      setSections(newSections);
      showToast('success', `Loaded preset layout: ${tmpl.name}!`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to apply preset layout.');
    } finally {
      setApplyingPresetId(null);
    }
  };

  const handleOpenAddModal = () => {
    const nextOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.display_order || 0)) + 1 : 1;
    setFormData({
      section_type: 'featured_elixirs_grid',
      title: 'Featured Pure Rose Oil Elixirs',
      subtitle: 'White & Gray cards with Pink Smokey Aura & Certified Badges',
      button_text: 'View Reserve',
      button_link: '/products',
      bg_image: '',
      display_order: nextOrder,
      is_active: true,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (s: HomepageSection) => {
    setEditingSection(s);
    setFormData({
      section_type: s.section_type || 'hero_orbital_spinner',
      title: s.title || '',
      subtitle: s.subtitle || '',
      button_text: s.content?.cta_text || '',
      button_link: s.content?.cta_link || '',
      bg_image: s.content?.background_image || '',
      display_order: s.display_order || 0,
      is_active: s.is_active,
    });
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    const newSec: HomepageSection = {
      id: `custom-${Date.now()}`,
      store_id: 'default',
      section_type: formData.section_type,
      title: formData.title,
      subtitle: formData.subtitle,
      content: {
        cta_text: formData.button_text,
        cta_link: formData.button_link,
      },
      display_order: formData.display_order,
      is_active: formData.is_active,
      created_at: new Date().toISOString(),
    };

    setSections((prev) => [...prev, newSec].sort((a, b) => a.display_order - b.display_order));
    showToast('success', 'Custom section added to homepage layout!');
    setIsAddModalOpen(false);
  };

  const handleUpdateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSections((prev) =>
      prev.map((s) =>
        s.id === editingSection.id
          ? {
              ...s,
              section_type: formData.section_type,
              title: formData.title,
              subtitle: formData.subtitle,
              content: { cta_text: formData.button_text, cta_link: formData.button_link },
              display_order: formData.display_order,
              is_active: formData.is_active,
            }
          : s
      ).sort((a, b) => a.display_order - b.display_order)
    );

    showToast('success', 'Section updated!');
    setEditingSection(null);
  };

  const handleToggleActive = (s: HomepageSection) => {
    setSections((prev) =>
      prev.map((item) => (item.id === s.id ? { ...item, is_active: !item.is_active } : item))
    );
    showToast('success', `Section "${s.title || s.section_type}" ${!s.is_active ? 'activated' : 'hidden'}.`);
  };

  const handleDeleteSection = () => {
    if (!deletingSection) return;
    setSections((prev) => prev.filter((s) => s.id !== deletingSection.id));
    showToast('success', 'Homepage section removed.');
    setDeletingSection(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
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
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Link href="/admin/settings" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Site Settings
            </Link>{' '}
            / Homepage Layout
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
            Homepage Sections & Layout Manager
          </h1>
          <p className="text-stone-600 text-xs mt-1 font-semibold">
            Manage and configure the live sections matching the Rose Valley Kannauj homepage layout (3-Bottle Orbital Spinner, Distillery Feed, White/Gray Elixirs Grid, Scent Memory AI).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSections}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-all shadow-sm"
            title="Refresh Sections"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-700' : ''}`} />
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Custom Section
          </button>
        </div>
      </div>

      {/* PREDEFINED LAYOUT PRESETS */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
              <Palette className="w-5 h-5 text-amber-700" /> Predefined Homepage Layout Templates
            </div>
            <p className="text-stone-600 text-xs mt-0.5 font-medium">
              Select any layout structure to instantly activate matching section configurations.
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-[#FAE6E7] border border-[#F7D1D8] text-[#4A0D25] text-[10px] font-extrabold uppercase tracking-wider w-fit">
            {PRESET_TEMPLATES.length} Layout Presets
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRESET_TEMPLATES.map((tmpl) => {
            const isApplying = applyingPresetId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className="group rounded-2xl bg-[#F7EEED] border border-[#F7D1D8] hover:border-[#F6A6BB] transition-all overflow-hidden flex flex-col justify-between shadow-xs p-5 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#F6A6BB] text-[#4A0D25] text-[10px] font-extrabold tracking-wider uppercase">
                      {tmpl.theme_accent}
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {tmpl.sections.length} Sections
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-800 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed mt-1 line-clamp-3 font-medium">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {tmpl.sections.slice(0, 4).map((sec, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-white border border-[#F7D1D8] text-[11px] text-stone-800 font-bold truncate flex items-center justify-between"
                      >
                        <span className="truncate">{sec.title}</span>
                        <span className="text-[9px] font-mono text-amber-800 uppercase ml-2 flex-shrink-0">
                          {sec.section_type.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleApplyPreset(tmpl.id)}
                  disabled={isApplying}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-[#F6A6BB] hover:text-[#4A0D25] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading Preset...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Apply & Save Layout
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE HOMEPAGE SECTIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-lg">
            <Layers className="w-5 h-5 text-amber-700" /> Active Configured Homepage Sections ({sections.length})
          </div>
          <span className="text-xs text-stone-600 font-semibold">
            Order index determines rendering sequence on homepage.
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center space-y-3 rounded-2xl border border-stone-200 bg-white shadow-sm">
            <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
            <p className="text-xs text-stone-600 font-medium">Loading homepage layout sections...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="p-16 text-center space-y-4 rounded-2xl border border-stone-200 bg-white shadow-sm">
            <Layout className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-base font-serif font-bold text-stone-900">No homepage sections configured</h3>
            <p className="text-xs text-stone-600 max-w-md mx-auto font-medium">
              Select one of the layout structure templates above to activate a complete homepage layout preset!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sections.map((s) => (
              <div
                key={s.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 shadow-sm ${
                  s.is_active
                    ? 'bg-white border-stone-200'
                    : 'bg-stone-50 border-stone-200 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center font-mono font-bold text-[#4A0D25] text-xs">
                      #{s.display_order}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-stone-900 text-base">
                          {s.title || 'Untitled Section'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 font-mono text-[10px] font-bold text-amber-800 uppercase">
                          {s.section_type}
                        </span>
                      </div>
                      {s.subtitle && <p className="text-xs text-stone-600 mt-0.5 font-medium">{s.subtitle}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                        s.is_active
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : 'bg-stone-100 border-stone-200 text-stone-500'
                      }`}
                    >
                      {s.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {s.is_active ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(s)}
                      className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
                      title="Edit Section"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSection(s)}
                      className="p-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 hover:text-rose-600 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Content Details */}
                {s.content && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-800 font-bold flex flex-wrap gap-4">
                    {s.content.cta_text && <div>CTA: <span className="text-stone-900 font-medium">{s.content.cta_text}</span></div>}
                    {s.content.cta_link && <div>Target Link: <span className="text-stone-900 font-medium">{s.content.cta_link}</span></div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT CUSTOM SECTION MODAL */}
      {(isAddModalOpen || editingSection) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FAE6E7] border border-[#F7D1D8] flex items-center justify-center text-[#4A0D25]">
                  <Layout className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  {editingSection ? 'Edit Homepage Section' : 'Add Custom Homepage Section'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSection(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingSection ? handleUpdateSection : handleCreateSection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Section Type *</label>
                  <select
                    value={formData.section_type}
                    onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                  >
                    <option value="hero_orbital_spinner">3-Bottle Orbital Product Spinner</option>
                    <option value="authority_counters">Authority Counters Grid</option>
                    <option value="live_distillery_feed">Live Distillery Telemetry Stream</option>
                    <option value="featured_elixirs_grid">Featured Rose Oil Elixirs Grid</option>
                    <option value="scent_memory_ai">Scent Memory AI Engine</option>
                    <option value="heritage_timeline">Kannauj Heritage Timeline</option>
                    <option value="provenance_passport">Digital Provenance Passport</option>
                    <option value="client_testimonials">Private Client Impressions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Display Order Index *</label>
                  <input
                    type="number"
                    required
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Section Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Featured Pure Rose Oil Elixirs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Hydro-distilled in Kannauj copper degs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Button Text (CTA)</label>
                  <input
                    type="text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="Explore Collection"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    placeholder="/products"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-amber-600 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSection(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SECTION MODAL */}
      {deletingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-300 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">Remove Section</h3>
                <p className="text-xs text-rose-700 font-semibold">{deletingSection.title || deletingSection.section_type}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Are you sure you want to remove this section from the homepage layout?
            </p>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setDeletingSection(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSection}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Yes, Remove Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
