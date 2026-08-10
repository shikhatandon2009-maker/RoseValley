'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Code, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { PALETTES_MAP, useTheme } from '@/components/layout/ThemeProvider';

export function AdminThemeSettingsEditor() {
  const { activeThemeId, setTheme, customCss: globalCss } = useTheme();

  const [selectedThemeId, setSelectedThemeId] = useState(activeThemeId || 'burgundy-rose');
  const [colors, setColors] = useState({
    primary: PALETTES_MAP['burgundy-rose'].primary,
    accent: PALETTES_MAP['burgundy-rose'].accent,
    bg: PALETTES_MAP['burgundy-rose'].bg,
    text: PALETTES_MAP['burgundy-rose'].text,
    border: PALETTES_MAP['burgundy-rose'].border,
    cardBg: PALETTES_MAP['burgundy-rose'].cardBg,
  });

  const [cssCode, setCssCode] = useState(globalCss || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchCurrentTheme();
  }, []);

  const fetchCurrentTheme = async () => {
    try {
      const res = await fetch('/api/admin/theme');
      const data = await res.json();
      if (res.ok && data.success) {
        const themeId = data.activeTheme || 'burgundy-rose';
        setSelectedThemeId(themeId);

        const base = PALETTES_MAP[themeId] || PALETTES_MAP['burgundy-rose'];
        const newColors = {
          primary: data.custom_primary || base.primary,
          accent: data.custom_accent || base.accent,
          bg: data.custom_bg || base.bg,
          text: data.custom_text || base.text,
          border: data.custom_border || base.border,
          cardBg: data.custom_card_bg || base.cardBg,
        };
        setColors(newColors);
        setCssCode(data.custom_css || '');

        // Apply immediately to screen
        setTheme(themeId, newColors, data.custom_css || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectPreset = (id: string) => {
    setSelectedThemeId(id);
    const preset = PALETTES_MAP[id];
    if (preset) {
      const newColors = {
        primary: preset.primary,
        accent: preset.accent,
        bg: preset.bg,
        text: preset.text,
        border: preset.border,
        cardBg: preset.cardBg,
      };
      setColors(newColors);
      // Instant Live Preview on screen
      setTheme(id, newColors, cssCode);
    }
  };

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    const updated = { ...colors, [key]: value };
    setColors(updated);
    // Instant Live Preview on screen
    setTheme(selectedThemeId, updated, cssCode);
  };

  const handleCssChange = (value: string) => {
    setCssCode(value);
    // Instant Live Preview on screen
    setTheme(selectedThemeId, colors, value);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);

      await setTheme(selectedThemeId, colors, cssCode);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-amber-500/30 space-y-8 shadow-2xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-neutral-100">
              Store Theme Palettes & Custom CSS Editor
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select any palette preset below to instantly see theme colors update live across your store and admin.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          type="button"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Saving Theme...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-neutral-950" /> Saved & Reflected!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Theme & CSS
            </>
          )}
        </button>
      </div>

      {/* Preset Palettes Selector */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
          1. Select Preset Theme Palette (Live Instant Reflection)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(PALETTES_MAP).map((p) => {
            const isSelected = selectedThemeId === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-3 relative cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 border-amber-400 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40'
                    : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}

                <div className="text-xs font-serif font-bold text-neutral-100">{p.name}</div>

                {/* Color Swatch Circles */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.primary }} title="Primary" />
                  <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.accent }} title="Accent" />
                  <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.bg }} title="Background" />
                  <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: p.text }} title="Text" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Tokens Editor */}
      <div className="space-y-4 pt-2 border-t border-neutral-800">
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-400">
          2. Fine-tune Brand Color Tokens (CSS Variables)
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Primary */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-[11px] font-medium text-neutral-300">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-100 uppercase"
              />
            </div>
          </div>

          {/* Accent */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-[11px] font-medium text-neutral-300">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-100 uppercase"
              />
            </div>
          </div>

          {/* Background */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-[11px] font-medium text-neutral-300">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.bg}
                onChange={(e) => handleColorChange('bg', e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.bg}
                onChange={(e) => handleColorChange('bg', e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-100 uppercase"
              />
            </div>
          </div>

          {/* Text */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-[11px] font-medium text-neutral-300">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-100 uppercase"
              />
            </div>
          </div>

          {/* Border */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-[11px] font-medium text-neutral-300">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.border}
                onChange={(e) => handleColorChange('border', e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.border}
                onChange={(e) => handleColorChange('border', e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-100 uppercase"
              />
            </div>
          </div>

          {/* Card BG */}
          <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
            <label className="block text-[11px] font-medium text-neutral-300">Card BG</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors.cardBg}
                onChange={(e) => handleColorChange('cardBg', e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={colors.cardBg}
                onChange={(e) => handleColorChange('cardBg', e.target.value)}
                className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-[10px] font-mono text-neutral-100 uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Storefront CSS Live Code Editor */}
      <div className="space-y-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" /> 3. Storefront Custom CSS Code Injector
          </label>
          <span className="text-[10px] text-neutral-500">
            CSS rules written here are automatically injected into the storefront &lt;head&gt;.
          </span>
        </div>

        <textarea
          rows={8}
          value={cssCode}
          onChange={(e) => handleCssChange(e.target.value)}
          placeholder={`/* Custom CSS Overrides for Maison De L'Essence */\n.luxury-hero-banner {\n  border: 1px solid #D4AF37;\n}\n.custom-accent-text {\n  letter-spacing: 0.15em;\n}`}
          className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500/50 resize-y leading-relaxed"
        />
      </div>
    </div>
  );
}
